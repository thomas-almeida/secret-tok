import User from '../models/User.js';
import Transaction from '../models/Transactions.js';
import notificationService from '../services/notificationService.js';
import emailService from '../services/email/emailService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import axios from 'axios';
import Customer from '../models/Customer.js';

export const calculateAndApplyCommission = async (transaction, affiliateUser) => {
  const totalAssociated = affiliateUser.revenue.associatedUsers.length;
  
   const commissionPercentage = 0.90;
  
  const commissionAmount = transaction.amount * commissionPercentage;
  
  // Adicionar comissão ao balance
  affiliateUser.revenue.balance += commissionAmount;

  // Adicionar usuário à lista de associados se ainda não estiver
  if (!affiliateUser.revenue.associatedUsers.includes(transaction.userId)) {
    affiliateUser.revenue.associatedUsers.push(transaction.userId);
  }

  // Atualizar taxa de conversão (transações pagas / sessões)
  const paidTransactions = affiliateUser.revenue.transactions.filter(t => t.status === 'PAID').length;
  const sessions = affiliateUser.revenue.sessions || 1; // Evitar divisão por zero
  affiliateUser.revenue.conversionRate = paidTransactions / sessions;

  await affiliateUser.save();

  // Enviar notificação de comissão paga
  notificationService.sendMessage(EVENT_TYPES.AFFILIATE_COMMISSION, {
    affiliateId: affiliateUser._id,
    affiliateName: affiliateUser.name,
    userId: transaction.userId,
    commissionAmount,
    percentage: commissionPercentage,
    totalAssociated: affiliateUser.revenue.associatedUsers.length,
    currentBalance: affiliateUser.revenue.balance,
    transactionId: transaction._id,
    modelUsername: transaction.modelUsername || null
  });

  console.log(`Comissão de ${commissionPercentage * 100}% (R$ ${commissionAmount}) adicionada ao afiliado ${affiliateUser._id}`);
  
  // Enviar email de comissão para o afiliado
  try {
    await emailService.sendAffiliateCommissionEmail(affiliateUser, {
      newBalance: affiliateUser.revenue.balance,
      totalAssociated: affiliateUser.revenue.associatedUsers.length,
      conversionRate: affiliateUser.revenue.conversionRate
    });
  } catch (emailError) {
    console.error('❌ Failed to send commission email:', emailError.message);
  }
  
  return {
    commissionAmount,
    commissionPercentage,
    totalAssociated: affiliateUser.revenue.associatedUsers.length,
    newBalance: affiliateUser.revenue.balance,
    conversionRate: affiliateUser.revenue.conversionRate
  };
};

export const checkTransactionStatusAndProcess = async (gatewayId) => {
  try {
    const nexusPagResponse = await axios.get(
      `https://nexuspag.com/api/pix/${gatewayId}`,
      {
        headers: {
          'x-api-key': process.env.NEXUSPAG_PROD
        }
      }
    );

    if (nexusPagResponse.data?.status?.toUpperCase() === 'PAID') {
      console.log('Looking for transaction with gatewayId:', gatewayId);
      const transaction = await Transaction.findOne({ gatewayId });
      console.log('Transaction found:', transaction);

      if (!transaction) {
        console.error('Transaction not found for gatewayId:', gatewayId);
        
        const allTransactions = await Transaction.find().limit(10).sort({ createdAt: -1 });
        console.log('Recent transactions:', allTransactions.map(t => ({ _id: t._id, gatewayId: t.gatewayId, status: t.status })));
        
        return null;
      }

      if (transaction.status !== 'PAID') {
        transaction.status = 'PAID';
        await transaction.save();

        // Ativar assinatura ou liberar acesso ao close friends, dependendo do que foi comprado
        const user = await Customer.findById(transaction.userId);
        if (user) {
          if (transaction.purchaseType === 'close_friends') {
            user.closeFriendsAccess = {
              active: true,
              purchasedAt: new Date()
            };
          } else {
            user.subscription.active = true;
            user.subscription.transactionDate = new Date();
          }
          await user.save();

          // Enviar notificação de pagamento aprovado
          notificationService.sendMessage(EVENT_TYPES.SUBSCRIPTION_PAID, {
            userId: user._id,
            userName: user.email,
            purchaseType: transaction.purchaseType,
            planId: user.subscription?.planId,
            amount: transaction.amount,
            transactionId: transaction._id,
            gatewayId: gatewayId
          });
        }

        // Processar comissão do afiliado ou modelo fake
        let affiliateUser = null;
        if (transaction.referenceId && transaction.referenceId !== "none") {
          affiliateUser = await User.findById(transaction.referenceId);
        } else if (transaction.modelUsername) {
          // Buscar afiliado dono da modelo fake
          affiliateUser = await User.findOne({ 'revenue.customModel.username': transaction.modelUsername });
        }

        if (affiliateUser) {
          const transactionIndex = affiliateUser.revenue.transactions.findIndex(
            t => t._id.toString() === transaction._id.toString()
          );
          
          if (transactionIndex !== -1) {
            affiliateUser.revenue.transactions[transactionIndex] = transaction.toObject();
          }

          const commissionData = await calculateAndApplyCommission(transaction, affiliateUser);
          
          return {
            transaction,
            commissionData,
            user: user?.toObject(),
            affiliate: affiliateUser.toObject()
          };
        }

        return { transaction, user: user?.toObject() };
      }

      return { transaction, alreadyPaid: true };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return null;
  }
};
import User from '../models/User.js';
import Transaction from '../models/Transactions.js';
import { hashPassword } from '../utils/password.js';
import notificationService from '../services/notificationService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import { checkTransactionStatusAndProcess } from '../services/commissionService.js';

export const createUser = async (req, res) => {
  try {
    const { name, phone, email, password, subscription, revenue } = req.body;

    if (!name || !phone || !password || !email) {
      return res.status(400).json({
        error: 'Name, phone, email and password are required'
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      subscription,
      revenue
    });

    await user.save();

    notificationService.sendMessage(EVENT_TYPES.NEW_USER, {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userId: user._id
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating user',
      message: error.message
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching users',
      message: error.message
    });
  }
};



export const getAfiliateBalance = async (req, res) => {
  try {
    const { afiliateId } = req.params;
    const afiliate = await User.findById(afiliateId);

    if (!afiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    const transactions = afiliate.revenue?.transactions || [];
    let newPaidTransactions = [];
    let processedCommissions = [];

    // Verificar status das transações pendentes
    if (transactions.length > 0) {
      for (const transaction of transactions) {
        if (transaction.status !== 'PAID') {
          const result = await checkTransactionStatusAndProcess(transaction.gatewayId);
          
          if (result && !result.alreadyPaid) {
            newPaidTransactions.push(result.transaction);
            if (result.commissionData) {
              processedCommissions.push(result.commissionData);
            }
          }
        }
      }
    }

    // Recarregar os dados atualizados do afiliado após processar transações
    const updatedAfiliate = await User.findById(afiliateId).select('name email revenue').lean();
    
    const balance = updatedAfiliate.revenue?.balance ?? 0;
    const associatedUsers = updatedAfiliate.revenue?.associatedUsers?.length ?? 0;
    const allTransactions = updatedAfiliate.revenue?.transactions || [];

    return res.status(200).json({
      message: 'success',
      data: { 
        balance, 
        associatedUsers, 
        transactions: allTransactions,
        newPaidTransactions: newPaidTransactions.length > 0 ? newPaidTransactions : undefined,
        processedCommissions: processedCommissions.length > 0 ? processedCommissions : undefined
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error fetching affiliate balance',
      message: error.message
    });
  }
}
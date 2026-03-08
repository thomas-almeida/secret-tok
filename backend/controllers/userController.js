import User from '../models/User.js';
import Transaction from '../models/Transactions.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import notificationService from '../services/notificationService.js';
import { EVENT_TYPES } from '../config/notificationEvents.js';
import { checkTransactionStatusAndProcess } from '../services/commissionService.js';
import Customer from '../models/Customer.js';

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

export const createCustomer = async (req, res) => {
  try {

    const { email, subscription } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'insira um email válido necessário!'
      });
    }

    const customer = new Customer({
      email,
      subscription
    })

    await customer.save()

    res.status(201).json({
      message: 'new customer created successfully',
      customer: customer
    });


  } catch (error) {
    res.status(500).json({
      error: 'Error creating user',
      message: error.message
    });
  }
}


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

export const getUsersOverview = async (req, res) => {
  try {
    const users = await User.find().lean();

    const overview = users.map(user => {
      const transactions = user.revenue?.transactions || [];
      const paidTransactions = transactions.filter(t => t.status === 'PAID');
      const pendingTransactions = transactions.filter(t => t.status !== 'PAID');
      const totalInvoiced = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        balance: user.revenue?.balance || 0,
        totalInvoiced: totalInvoiced,
        paidTransactions: paidTransactions.length,
        pendingTransactions: pendingTransactions.length,
        associatedUsers: user.revenue?.associatedUsers?.length || 0,
        contactStatus: user.contactStatus || 'a iniciar',
        funil: user.funil || 'indiferente',
        customModel: user.revenue?.customModel || null,
        customPlans: user.revenue?.customPlans || null
      };
    });

    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching users overview',
      message: error.message
    });
  }
};

// Busca os dados da modelo fake pelo username
export const getModelByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 'revenue.customModel.username': username });

    if (!user) {
      return res.status(404).json({ error: 'Modelo não encontrada' });
    }

    res.status(200).json({
      model: user.revenue.customModel,
      customPlans: user.revenue.customPlans
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar modelo', message: error.message });
  }
};

// Atualiza os valores personalizados dos planos
export const updateCustomPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lifetime, monthly } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (lifetime !== undefined) user.revenue.customPlans.lifetime = lifetime;
    if (monthly !== undefined) user.revenue.customPlans.monthly = monthly;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Valores personalizados atualizados com sucesso',
      customPlans: user.revenue.customPlans
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar planos personalizados', message: error.message });
  }
};

// Atualiza os dados da modelo fake
export const updateCustomModel = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, displayName, description, profilePicture, coverPicture, instagramLink } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const customModel = user.revenue.customModel;
    
    // Verifica se username ou displayName estão sendo alterados
    if (username !== undefined && customModel.username && customModel.username !== username) {
      return res.status(400).json({
        error: 'O username não pode ser alterado após a criação da modelo.'
      });
    }
    
    if (displayName !== undefined && customModel.displayName && customModel.displayName !== displayName) {
      return res.status(400).json({
        error: 'O nome exibido não pode ser alterado após a criação da modelo.'
      });
    }
    
    // Atualiza apenas os campos permitidos
    if (username !== undefined && !customModel.username) customModel.username = username;
    if (displayName !== undefined && !customModel.displayName) customModel.displayName = displayName;
    if (description !== undefined) customModel.description = description;
    if (profilePicture !== undefined) customModel.profilePicture = profilePicture;
    if (coverPicture !== undefined) customModel.coverPicture = coverPicture;
    if (instagramLink !== undefined) customModel.instagramLink = instagramLink;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Dados da modelo fake atualizados com sucesso',
      customModel: user.revenue.customModel
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar modelo fake', message: error.message });
  }
};

// Registra uma nova sessão para o afiliado
export const registerSession = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.revenue.sessions += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Sessão registrada com sucesso',
      sessions: user.revenue.sessions
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar sessão', message: error.message });
  }
};

export const checkIsAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required', isAdmin: false });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found', isAdmin: false });
    }

    res.status(200).json({
      isAdmin: user.isAdmin || false,
      userId: user._id,
      userName: user.name
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error checking admin status',
      isAdmin: false
    });
  }
};

export const validateAdmin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error validating admin',
      message: error.message
    });
  }
};

export const setAdmin = async (req, res) => {
  try {
    const { userId, makeAdmin } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isAdmin = makeAdmin === true;
    await user.save();

    res.status(200).json({
      success: true,
      message: makeAdmin ? 'User is now an admin' : 'Admin privileges removed',
      userId: user._id,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error setting admin status',
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
    const conversionRate = updatedAfiliate.revenue?.conversionRate ?? 0;

    return res.status(200).json({
      message: 'success',
      data: {
        balance,
        associatedUsers,
        conversionRate,
        transactions: allTransactions,
        newPaidTransactions: newPaidTransactions.length > 0 ? newPaidTransactions : undefined,
        processedCommissions: processedCommissions.length > 0 ? processedCommissions : undefined,
        customModel: updatedAfiliate.revenue?.customModel || null,
        customPlans: updatedAfiliate.revenue?.customPlans || null
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error fetching affiliate balance',
      message: error.message
    });
  }
};

// Registra uma transação vinculada ao username da modelo fake
export const createModelTransaction = async (req, res) => {
  try {
    const { username } = req.params;
    const { amount, gatewayId, referenceId } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    const user = await User.findOne({ 'revenue.customModel.username': username });
    if (!user) {
      return res.status(404).json({ error: 'Modelo não encontrada' });
    }

    // Criar transação vinculada ao usuário afiliado (dono da modelo fake)
    const transaction = new Transaction({
      userId: user._id,
      amount,
      gatewayId,
      referenceId,
      modelUsername: username,
      status: 'PENDING'
    });

    await transaction.save();

    // Adicionar transação ao revenue do afiliado
    user.revenue.transactions.push(transaction.toObject());
    await user.save();

    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação', message: error.message });
  }
};

export const updateUserCRM = async (req, res) => {
  try {
    const { userId, contactStatus, funil } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (contactStatus !== undefined) {
      if (!['a iniciar', 'enviado', 'respondido'].includes(contactStatus)) {
        return res.status(400).json({ error: 'Invalid contact status' });
      }
      user.contactStatus = contactStatus;
    }

    if (funil !== undefined) {
      if (!['indiferente', 'negativo', 'positivo'].includes(funil)) {
        return res.status(400).json({ error: 'Invalid funil value' });
      }
      user.funil = funil;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'CRM updated successfully',
      user: {
        _id: user._id,
        contactStatus: user.contactStatus,
        funil: user.funil
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error updating user CRM',
      message: error.message
    });
  }
};
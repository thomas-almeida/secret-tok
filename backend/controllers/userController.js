import User from '../models/User.js';
import Transaction from '../models/Transactions.js';
import { comparePassword, hashPassword } from '../utils/password.js';
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
        associatedUsers: user.revenue?.associatedUsers?.length || 0
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
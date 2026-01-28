import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

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
    const afiliate = await User.findById(afiliateId).select('revenue').lean();

    if (!afiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    const balance = afiliate.revenue?.balance ?? 0;
    const associatedUsers = afiliate.revenue?.associatedUsers?.length ?? 0;

    return res.status(200).json({
      message: 'success',
      data: { balance, associatedUsers }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error fetching affiliate balance',
      message: error.message
    });
  }
}
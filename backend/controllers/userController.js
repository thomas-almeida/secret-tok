import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

export const createUser = async (req, res) => {
  try {
    const { name, phone, email, password, subscription } = req.body;

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
      subscription
    });

    await user.save();
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
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
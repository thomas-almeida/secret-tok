import User from '../models/User.js';
import { comparePassword } from '../utils/password.js';

export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        error: 'Phone and password are required' 
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error during login', 
      message: error.message 
    });
  }
};
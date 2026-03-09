import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import modelRoutes from './routes/modelRoutes.js';

import keepAlive from './services/keepAlive.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);

//anti-cold 

app.get('/ping', (req, res) => {
  console.log('[KEEP] all services are online!')
  res.status(200).json({ status: 'ok', timestamp: Date.now() })
})

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      keepAlive()
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
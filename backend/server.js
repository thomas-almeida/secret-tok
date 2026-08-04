import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import telegramFlowRoutes from './routes/telegramFlowRoutes.js';
import telegramBotRoutes from './routes/telegramBotRoutes.js';
import keepAlive from './services/keepAlive.js';
import telegramFlowBotService from './services/telegramFlowBotService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// ✅ Health check com status do banco
app.get('/ping', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'ok' : 'down'
  console.log(`[KEEP] server: ok | db: ${dbStatus}`)
  res.status(200).json({
    status: 'ok',
    db: dbStatus,
    timestamp: Date.now()
  })
})

// ✅ Middleware para checar banco antes de rotas críticas
function checkDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Serviço indisponível, tente novamente em instantes.' })
  }
  next()
}

app.use('/api/users', checkDB, userRoutes);
app.use('/api/auth', checkDB, authRoutes);
app.use('/api/models', checkDB, modelRoutes);
app.use('/api/telegram-flows', checkDB, telegramFlowRoutes);
app.use('/api/telegram-bot', telegramBotRoutes); // sem checkDB: precisa responder rápido ao Telegram mesmo com Mongo instável

// ✅ Mongoose com pool configurado
mongoose.connect(process.env.DB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      keepAlive()
      telegramFlowBotService.registerWebhook()
      telegramFlowBotService.startTimeoutSweep()
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
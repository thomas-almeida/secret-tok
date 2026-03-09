import fetch from 'node-fetch';
import mongoose from 'mongoose';

const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'

export default function keepAlive() {
  setInterval(async () => {
    try {
      // ✅ Pinga o MongoDB também
      await mongoose.connection.db.admin().ping()
      await fetch(`${SELF_URL}/ping`)
      console.log(`[keep-alive] ok - ${new Date().toISOString()}`)
    } catch (err) {
      console.error('[keep-alive] erro:', err.message)
    }
  }, 5 * 60 * 1000)
}
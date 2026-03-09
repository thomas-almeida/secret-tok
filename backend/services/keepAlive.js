
import fetch from 'node-fetch'

const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'localhost:3000'

export default function keepAlive() {
    setInterval(async () => {
        try {
            await fetch(`${SELF_URL}/ping`)
            console.log(`[keep-alive] ${new Date().toISOString()}`)
        } catch (err) {
            console.error('[keep-alive] erro:', err.message)
        }
    }, 3 * 60 * 1000)
}
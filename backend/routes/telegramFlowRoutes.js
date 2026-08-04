import express from "express"
import multer from "multer"
import {
    createFlow,
    getAllFlows,
    getFlowById,
    updateFlow,
    deleteFlow,
    getFlowFunnel,
    getFlowLeads,
    uploadMedia
} from "../controllers/telegramFlowController.js"

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true)
        } else {
            cb(new Error('Apenas imagens ou vídeos são permitidos'))
        }
    }
})

router.post("/create", createFlow)                 // POST /api/telegram-flows/create - Criar fluxo
router.get("/", getAllFlows)                        // GET /api/telegram-flows - Listar todos os fluxos
router.get("/:flowId", getFlowById)                 // GET /api/telegram-flows/:flowId - Obter fluxo específico
router.put("/:flowId", updateFlow)                  // PUT /api/telegram-flows/:flowId - Atualizar fluxo (steps inclusos)
router.delete("/:flowId", deleteFlow)               // DELETE /api/telegram-flows/:flowId - Deletar fluxo

router.get("/:flowId/funnel", getFlowFunnel)        // GET /api/telegram-flows/:flowId/funnel - Dashboard de funil
router.get("/:flowId/leads", getFlowLeads)          // GET /api/telegram-flows/:flowId/leads - Lista de leads/execuções

router.post("/upload-media", (req, res, next) => {  // POST /api/telegram-flows/upload-media - Upload de foto/vídeo (R2)
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Erro no upload' })
        }
        next()
    })
}, uploadMedia)

export default router

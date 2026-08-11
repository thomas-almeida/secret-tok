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
    getLeadTimeline,
    uploadMedia,
    redirectClick
} from "../controllers/telegramFlowController.js"
import {
    getAllContacts,
    getFlowAudience,
    setFlowAudience,
    dispatchFlow
} from "../controllers/telegramRemarketingController.js"

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

router.get("/click/:runId/:stepOrder/:buttonIndex", redirectClick) // GET /api/telegram-flows/click/:runId/:stepOrder/:buttonIndex - Redirect rastreado (botões de link)

router.get("/contacts", getAllContacts)             // GET /api/telegram-flows/contacts - Todos os contatos que já deram /start (precisa vir antes de /:flowId)

router.post("/create", createFlow)                 // POST /api/telegram-flows/create - Criar fluxo
router.get("/", getAllFlows)                        // GET /api/telegram-flows - Listar todos os fluxos
router.get("/:flowId", getFlowById)                 // GET /api/telegram-flows/:flowId - Obter fluxo específico
router.put("/:flowId", updateFlow)                  // PUT /api/telegram-flows/:flowId - Atualizar fluxo (steps inclusos)
router.delete("/:flowId", deleteFlow)               // DELETE /api/telegram-flows/:flowId - Deletar fluxo

router.get("/:flowId/funnel", getFlowFunnel)        // GET /api/telegram-flows/:flowId/funnel - Dashboard de funil
router.get("/:flowId/leads", getFlowLeads)          // GET /api/telegram-flows/:flowId/leads - Lista de leads/execuções
router.get("/:flowId/leads/:runId/timeline", getLeadTimeline) // GET /api/telegram-flows/:flowId/leads/:runId/timeline - Jornada (conversa) reconstruída do lead

router.get("/:flowId/audience", getFlowAudience)    // GET /api/telegram-flows/:flowId/audience - Audiência de remarketing do fluxo
router.put("/:flowId/audience", setFlowAudience)    // PUT /api/telegram-flows/:flowId/audience - Marca quem recebe o remarketing
router.post("/:flowId/dispatch", dispatchFlow)      // POST /api/telegram-flows/:flowId/dispatch - Dispara o remarketing pra quem foi marcado

router.post("/upload-media", (req, res, next) => {  // POST /api/telegram-flows/upload-media - Upload de foto/vídeo (R2)
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Erro no upload' })
        }
        next()
    })
}, uploadMedia)

export default router

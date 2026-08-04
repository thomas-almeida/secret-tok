import express from "express"
import {
    createFlow,
    getAllFlows,
    getFlowById,
    updateFlow,
    deleteFlow,
    getFlowFunnel,
    getFlowLeads
} from "../controllers/telegramFlowController.js"

const router = express.Router()

router.post("/create", createFlow)                 // POST /api/telegram-flows/create - Criar fluxo
router.get("/", getAllFlows)                        // GET /api/telegram-flows - Listar todos os fluxos
router.get("/:flowId", getFlowById)                 // GET /api/telegram-flows/:flowId - Obter fluxo específico
router.put("/:flowId", updateFlow)                  // PUT /api/telegram-flows/:flowId - Atualizar fluxo (steps inclusos)
router.delete("/:flowId", deleteFlow)               // DELETE /api/telegram-flows/:flowId - Deletar fluxo

router.get("/:flowId/funnel", getFlowFunnel)        // GET /api/telegram-flows/:flowId/funnel - Dashboard de funil
router.get("/:flowId/leads", getFlowLeads)          // GET /api/telegram-flows/:flowId/leads - Lista de leads/execuções

export default router

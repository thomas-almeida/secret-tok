import express from "express"
import {
    createModel,
    getAllModels,
    getModelById,
    createVideo,
    getVideosByModel,
    deleteVideo
} from "../controllers/modelController.js"

const router = express.Router()

// Rotas para modelos
router.post("/create", createModel)                      // POST /api/models - Criar modelo
router.get("/get-all-models", getAllModels)                      // GET /api/models - Listar todos os modelos
router.get("/:modelId", getModelById)              // GET /api/models/:modelId - Obter modelo específico

// Rotas para vídeos
router.post("/:modelId/videos", createVideo)       // POST /api/models/:modelId/videos - Criar vídeo
router.get("/:modelId/videos", getVideosByModel)   // GET /api/models/:modelId/videos - Listar vídeos
router.delete("/:modelId/videos/:videoId", deleteVideo) // DELETE /api/models/:modelId/videos/:videoId - Deletar vídeo

export default router

import Models from "../models/Models.js"

// Criar um novo modelo
export const createModel = async (req, res) => {
    try {
        const { name, profilePic, description } = req.body

        if (!name || !profilePic || !description) {
            return res.status(400).json({
                message: "Nome, foto de perfil e descrição são obrigatórios"
            })
        }

        const newModel = new Models({
            name,
            profilePic,
            description,
            videos: []
        })

        const savedModel = await newModel.save()

        return res.status(201).json({
            message: "Modelo criado com sucesso",
            model: savedModel
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao criar modelo",
            error: error.message
        })
    }
}

// Listar todos os modelos
export const getAllModels = async (req, res) => {
    try {
        const models = await Models.find()

        return res.status(200).json({
            message: "Modelos listados com sucesso",
            count: models.length,
            models
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar modelos",
            error: error.message
        })
    }
}

// Obter um modelo específico por ID
export const getModelById = async (req, res) => {
    try {
        const { modelId } = req.params

        const model = await Models.findById(modelId)

        if (!model) {
            return res.status(404).json({
                message: "Modelo não encontrado"
            })
        }

        return res.status(200).json({
            message: "Modelo encontrado",
            model
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar modelo",
            error: error.message
        })
    }
}

// Criar um novo vídeo para um modelo
export const createVideo = async (req, res) => {
    try {
        const { modelId } = req.params
        const { videoUrl, description } = req.body

        if (!videoUrl || !description) {
            return res.status(400).json({
                message: "URL do vídeo e descrição são obrigatórias"
            })
        }

        const model = await Models.findById(modelId)

        if (!model) {
            return res.status(404).json({
                message: "Modelo não encontrado"
            })
        }

        const newVideo = {
            videoUrl,
            description
        }

        model.videos.push(newVideo)
        const updatedModel = await model.save()

        return res.status(201).json({
            message: "Vídeo criado com sucesso",
            model: updatedModel
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao criar vídeo",
            error: error.message
        })
    }
}

// Listar todos os vídeos de um modelo
export const getVideosByModel = async (req, res) => {
    try {
        const { modelId } = req.params

        const model = await Models.findById(modelId)

        if (!model) {
            return res.status(404).json({
                message: "Modelo não encontrado"
            })
        }

        return res.status(200).json({
            message: "Vídeos listados com sucesso",
            modelName: model.name,
            count: model.videos.length,
            videos: model.videos
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao listar vídeos",
            error: error.message
        })
    }
}

// Deletar um vídeo de um modelo
export const deleteVideo = async (req, res) => {
    try {
        const { modelId, videoId } = req.params

        const model = await Models.findById(modelId)

        if (!model) {
            return res.status(404).json({
                message: "Modelo não encontrado"
            })
        }

        const videoIndex = model.videos.findIndex(
            video => video._id.toString() === videoId
        )

        if (videoIndex === -1) {
            return res.status(404).json({
                message: "Vídeo não encontrado"
            })
        }

        model.videos.splice(videoIndex, 1)
        const updatedModel = await model.save()

        return res.status(200).json({
            message: "Vídeo deletado com sucesso",
            model: updatedModel
        })
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao deletar vídeo",
            error: error.message
        })
    }
}

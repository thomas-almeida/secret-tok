import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
mongoose.connect(process.env.DB_URI);

// Função para remover o índice único
const removeUniqueIndex = async () => {
  try {
    await User.collection.dropIndex('revenue.customModel.username_1');
    console.log('Índice único removido com sucesso.');
  } catch (error) {
    console.error('Erro ao remover índice único:', error);
  }
};

// Função para atualizar os afiliados
const migrateAfiliates = async () => {
  try {
    // Remover o índice único antes de atualizar
    await removeUniqueIndex();

    // Buscar todos os usuários com revenue (afiliados)
    const afiliates = await User.find({ 'revenue': { $exists: true } });

    // Atualizar cada afiliado
    for (const afiliate of afiliates) {
      // Atualizar a comissão para 90%
      afiliate.revenue.conversionRate = 0.90;

      // Adicionar o campo instagramLink (vazio) ao customModel, se existir e se o username não for vazio
      if (afiliate.revenue.customModel && afiliate.revenue.customModel.username) {
        if (!afiliate.revenue.customModel.instagramLink) {
          afiliate.revenue.customModel.instagramLink = '';
        }
      }

      // Salvar as alterações
      await afiliate.save();
      console.log(`Afiliado ${afiliate._id} atualizado com sucesso.`);
    }

    console.log('Migration concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migration:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    mongoose.connection.close();
  }
};

// Executar a migration
migrateAfiliates();
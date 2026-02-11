import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transactions.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env do diretório pai
dotenv.config({ path: join(__dirname, '../.env') });

async function migrateRevenueTransactions() {
    try {
        console.log('Iniciando migração de transações para revenueSchema...');
        
        // Verificar se DB_URI foi carregada
        if (!process.env.DB_URI) {
            console.error('❌ DB_URI não encontrada no .env');
            process.exit(1);
        }
        
        console.log('🔗 Conectando ao MongoDB:', process.env.DB_URI.replace(/\/\/[^@]+@/, '//***:***@'));
        
        // Conectar ao MongoDB com await
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Conectado ao MongoDB');
        
        // Buscar todos os usuários que têm transações com referenceId válido
        const allTransactions = await Transaction.find({ 
            referenceId: { $exists: true, $ne: "none", $ne: null, $regex: /^[0-9a-fA-F]{24}$/ } 
        });
        
        console.log(`📋 Encontradas ${allTransactions.length} transações com referenceId`);
        
        if (allTransactions.length === 0) {
            console.log('⚠️ Nenhuma transação com referenceId encontrada para migrar');
            return;
        }
        
        // Agrupar transações por referenceId (afiliado)
        const transactionsByAffiliate = {};
        
        allTransactions.forEach(transaction => {
            const affiliateId = transaction.referenceId.toString();
            if (!transactionsByAffiliate[affiliateId]) {
                transactionsByAffiliate[affiliateId] = [];
            }
            transactionsByAffiliate[affiliateId].push(transaction.toObject());
        });
        
        console.log(`👥 Agrupadas transações para ${Object.keys(transactionsByAffiliate).length} afiliados`);
        
        // Atualizar cada afiliado com suas transações
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const [affiliateId, transactions] of Object.entries(transactionsByAffiliate)) {
            try {
                const affiliateUser = await User.findById(affiliateId);
                
                if (affiliateUser && affiliateUser.revenue) {
                    // Verificar se já tem transações no campo
                    if (affiliateUser.revenue.transactions.length === 0) {
                        affiliateUser.revenue.transactions = transactions;
                        await affiliateUser.save();
                        updatedCount++;
                        console.log(`✅ Atualizado afiliado ${affiliateId} (${affiliateUser.name}) com ${transactions.length} transações`);
                    } else {
                        skippedCount++;
                        console.log(`⏭ Afiliado ${affiliateId} (${affiliateUser.name}) já possui ${affiliateUser.revenue.transactions.length} transações`);
                    }
                } else {
                    console.log(`❌ Afiliado ${affiliateId} não encontrado ou sem revenue`);
                }
            } catch (error) {
                console.error(`❌ Erro ao atualizar afiliado ${affiliateId}:`, error.message);
            }
        }
        
        // Listar todos os usuários que poderiam ter revenue
        const allUsersWithRevenue = await User.find({ 'revenue': { $exists: true } });
        console.log(`\n📊 Total de usuários com revenue: ${allUsersWithRevenue.length}`);
        
        for (const user of allUsersWithRevenue) {
            console.log(`   👤 ${user._id} - ${user.name || 'Sem nome'} - Balance: R$${user.revenue.balance} - Transactions: ${user.revenue.transactions.length}`);
        }
        
        console.log(`\n=== MIGRAÇÃO CONCLUÍDA ===`);
        console.log(`✅ ${updatedCount} usuários atualizados com sucesso`);
        console.log(`⏭ ${skippedCount} usuários já tinham dados e foram pulados`);
        console.log(`📊 Total processado: ${updatedCount + skippedCount} afiliados`);
        
    } catch (error) {
        console.error('❌ Erro durante migração:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

migrateRevenueTransactions();
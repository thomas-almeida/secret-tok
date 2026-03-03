import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function migrateUserCRMFields() {
    try {
        console.log('Iniciando migração de campos CRM (contactStatus e funil)...');
        
        if (!process.env.DB_URI) {
            console.error('❌ DB_URI não encontrada no .env');
            process.exit(1);
        }
        
        console.log('🔗 Conectando ao MongoDB:', process.env.DB_URI.replace(/\/\/[^@]+@/, '//***:***@'));
        
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Conectado ao MongoDB');
        
        const totalUsers = await User.countDocuments();
        console.log(`📋 Total de usuários no banco: ${totalUsers}`);
        
        const usersNeedingUpdate = await User.find({
            $or: [
                { contactStatus: { $exists: false } },
                { funil: { $exists: false } }
            ]
        });
        
        console.log(`⚠️ Usuários que precisam de atualização: ${usersNeedingUpdate.length}`);
        
        if (usersNeedingUpdate.length === 0) {
            console.log('✅ Todos os usuários já possuem os campos CRM');
            return;
        }
        
        const result = await User.updateMany(
            {
                $or: [
                    { contactStatus: { $exists: false } },
                    { funil: { $exists: false } }
                ]
            },
            {
                $set: {
                    contactStatus: 'a iniciar',
                    funil: 'indiferente'
                }
            }
        );
        
        console.log(`✅ Migração concluída!`);
        console.log(`   - Usuários atualizados: ${result.modifiedCount}`);
        
        const usersAfterUpdate = await User.find({
            $or: [
                { contactStatus: { $exists: false } },
                { funil: { $exists: false } }
            ]
        });
        
        console.log(`   - Usuários sem campos: ${usersAfterUpdate.length}`);
        
        console.log('\n=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===');
        
    } catch (error) {
        console.error('❌ Erro durante migração:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

migrateUserCRMFields();

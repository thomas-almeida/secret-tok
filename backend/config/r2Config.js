import { S3Client } from "@aws-sdk/client-s3"
import dotenv from 'dotenv'
dotenv.config()

export const R2_CONFIG = {
    bucket: 'rapidinhas',
    publicBaseUrl: 'https://rapidinhas-cdn.rapidinhas-cdn.workers.dev'
}

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_USER_API_S3_URL,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.R2_USER_API_ACCESS_KEY,
        secretAccessKey: process.env.R2_USER_API_SECRET_ACCESS_KEY
    }
})

import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Aguardar os parâmetros no Next.js 15
    const params = await context.params
    
    // Construir caminho completo do vídeo
    const videoPath = join(...params.path)
    const fullPath = join(process.cwd(), 'public', videoPath)
    
    console.log('Tentando servir vídeo:', fullPath)
    
    // Verificar se o arquivo existe
    let fileStats
    try {
      fileStats = statSync(fullPath)
    } catch (error) {
      console.error('Arquivo não encontrado:', fullPath)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!fileStats.isFile()) {
      console.error('Não é um arquivo:', fullPath)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Range requests para streaming
    const range = request.headers.get('range')
    const fileSize = fileStats.size

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = (end - start) + 1

      // Criar stream para o chunk solicitado
      const videoStream = createReadStream(fullPath, { start, end })

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }

      return new NextResponse(videoStream as any, {
        status: 206,
        headers,
      })
    } else {
      // Servir o arquivo completo se não houver range
      const videoStream = createReadStream(fullPath)
      
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }

      return new NextResponse(videoStream as any, {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error('Error serving video:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
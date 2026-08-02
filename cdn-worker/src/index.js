export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''))

    if (!key) {
      return new Response('Not found', { status: 404 })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 })
    }

    const head = await env.VIDEOS_BUCKET.head(key)
    if (!head) {
      return new Response('Not found', { status: 404 })
    }

    const size = head.size
    const contentType = head.httpMetadata?.contentType || 'video/mp4'
    const rangeHeader = request.headers.get('range')

    const commonHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
    }

    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: { ...commonHeaders, 'Content-Length': String(size) },
      })
    }

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/)
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0
        let end = match[2] ? parseInt(match[2], 10) : size - 1
        if (end >= size) end = size - 1

        if (start > end || start >= size) {
          return new Response(null, {
            status: 416,
            headers: { 'Content-Range': `bytes */${size}` },
          })
        }

        const length = end - start + 1
        const object = await env.VIDEOS_BUCKET.get(key, { range: { offset: start, length } })
        if (!object) return new Response('Not found', { status: 404 })

        return new Response(object.body, {
          status: 206,
          headers: {
            ...commonHeaders,
            'Content-Length': String(length),
            'Content-Range': `bytes ${start}-${end}/${size}`,
          },
        })
      }
    }

    const object = await env.VIDEOS_BUCKET.get(key)
    if (!object) return new Response('Not found', { status: 404 })

    return new Response(object.body, {
      status: 200,
      headers: { ...commonHeaders, 'Content-Length': String(size) },
    })
  },
}

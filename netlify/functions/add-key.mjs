import { getStore } from '@netlify/blobs'

export default async (req) => {
  const adminSecret = Netlify.env.get('ADMIN_SECRET')
  const authHeader = req.headers.get('authorization') || ''

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { key, expires_at = null, action = 'add' } = body

  if (!key) {
    return Response.json({ error: 'Key manquante.' }, { status: 400 })
  }

  const normalizedKey = key.trim().toUpperCase()
  const store = getStore('vip-keys')

  if (action === 'remove') {
    await store.delete(normalizedKey)
    return Response.json({ success: true, message: `Key ${normalizedKey} supprimée.` })
  }

  await store.setJSON(normalizedKey, {
    created_at: Date.now(),
    expires_at: expires_at || null
  })

  return Response.json({ success: true, key: normalizedKey })
}

export const config = {
  path: '/api/add-key'
}

import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let key
  try {
    const body = await req.json()
    key = (body.key || '').trim().toUpperCase()
  } catch {
    return Response.json({ valid: false, error: 'Requête invalide.' }, { status: 400 })
  }

  if (!key) {
    return Response.json({ valid: false, error: 'Key manquante.' })
  }

  const store = getStore({ name: 'vip-keys', consistency: 'strong' })
  const entry = await store.get(key, { type: 'json' })

  if (!entry) {
    return Response.json({ valid: false, error: 'Key invalide ou inexistante.' })
  }

  if (entry.expires_at && Date.now() > entry.expires_at) {
    await store.delete(key)
    return Response.json({ valid: false, error: 'Key expirée.' })
  }

  let expires_str = null
  if (entry.expires_at) {
    const d = new Date(entry.expires_at)
    expires_str = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return Response.json({
    valid: true,
    expires_at: entry.expires_at || null,
    expires_str
  })
}

export const config = {
  path: '/api/verify-key',
  method: 'POST'
}

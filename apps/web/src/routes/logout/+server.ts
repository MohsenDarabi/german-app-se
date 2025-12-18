// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const SESSION_COOKIE = 'session'

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' })
  throw redirect(303, '/login')
}

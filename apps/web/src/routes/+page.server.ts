import { redirect } from '@sveltejs/kit'
import { dev } from '$app/environment'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  // TODO: TEMPORARY BYPASS - Remove `&& !dev` after implementing proper dev auth
  // See docs/TODO-AUTH-BYPASS.md for details
  if (!locals.user && !dev) {
    throw redirect(303, '/login')
  }

  return {}
}

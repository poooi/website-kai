import { handleStatus } from '~/lib/route-handlers'

export const GET = async (request: Request) => handleStatus(request)

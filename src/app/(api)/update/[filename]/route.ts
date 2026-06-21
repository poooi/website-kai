import { handleUpdate } from '~/lib/route-handlers'

export const GET = async (
  request: Request,
  props: { params: Promise<{ filename: string }> },
) => {
  const params = await props.params
  return handleUpdate(request, params)
}

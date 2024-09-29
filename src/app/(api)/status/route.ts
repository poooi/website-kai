export const runtime = 'edge'

export const GET = async (request: Request) => {
  const ipCountry = request.headers.get('CF-IPCountry')
  return Response.json({ message: 'poi poi poi!', country: ipCountry })
}

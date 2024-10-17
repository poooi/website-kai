export interface PoiVersions {
  version: string
  betaVersion: string
}

export const fetchPoiVersions = async (): Promise<PoiVersions> => {
  const resp = await fetch(
    'https://raw.githubusercontent.com/poooi/poi-release/master/latest.json',
  )
  return resp.json() as Promise<PoiVersions>
}

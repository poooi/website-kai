/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

const size = {
  width: 1200,
  height: 630,
}

export const runtime = 'edge'

const Image = async () => {
  const logoSrc = await fetch(
    new URL('../../assets/poi.png', import.meta.url),
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: '240px',
          fontWeight: '600',
          lineHeight: '1.2em',
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={logoSrc as unknown as string} height="400" />
        <div>poi</div>
      </div>
    ),
    {
      ...size,
    },
  )
}

export default Image

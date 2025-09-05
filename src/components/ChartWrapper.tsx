'use client'

import dynamic from 'next/dynamic'

const ChartWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default dynamic(() => Promise.resolve(ChartWrapper), {
  ssr: false,
})
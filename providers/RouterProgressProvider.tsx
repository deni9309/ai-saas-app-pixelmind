'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

const RouterProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar height="4px" color="#ffea00" options={{ showSpinner: false }} shallowRouting />
    </>
  )
}

export default RouterProgressProvider

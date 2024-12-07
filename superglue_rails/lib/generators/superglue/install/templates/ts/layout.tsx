import React, {ReactNode} from 'react'
import { useAppSelector } from '@javascript/store'

export const Layout = ({children}: {children: ReactNode}) => {
  const flash = useAppSelector((state) => state.flash)

  return (
    <div>
      {flash.success && <p>{flash.success}</p>}
      {flash.notice && <p>{flash.notice}</p>}
      {flash.error && <p>{flash.error}</p>}

      {children}
    </div>
  )
}

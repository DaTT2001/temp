import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://github.com/DaTT2001/temp" target="_blank" rel="noopener noreferrer">
          MES
        </a>
        <span className="ms-1">&copy; 2025 Kingduan.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://github.com/DaTT2001" target="_blank" rel="noopener noreferrer">
          DaTT2001
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)

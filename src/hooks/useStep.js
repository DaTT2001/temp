import React, { createContext, useContext, useState } from 'react'

const StepContext = createContext()

export const StepProvider = ({ children }) => {
  const [step, setStep] = useState('idle') // Không lấy từ localStorage nữa

  return (
    <StepContext.Provider value={[step, setStep]}>
      {children}
    </StepContext.Provider>
  )
}

export const useStep = () => useContext(StepContext)
import { useEffect, useRef, useState } from 'react'

export default function useCountdown(initial, onDone) {
  const [countdown, setCountdown] = useState(initial)
  const timerRef = useRef(null)

  useEffect(() => {
    if (initial > 0) setCountdown(initial)
  }, [initial])

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current)
            onDone && onDone()
            return 0
          }
          return c - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line
  }, [initial])

  return countdown
}
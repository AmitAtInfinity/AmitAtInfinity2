import { useState, useEffect } from 'react'
import styles from './LoadingScreen.module.css'

interface Props {
  onEnter: () => void
}

export function LoadingScreen({ onEnter }: Props) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady]       = useState(false)
  const [show, setShow]         = useState(true)

  // Simulate loading progress (real assets use Suspense + LoadingManager)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setReady(true), 400)
          return 100
        }
        return p + Math.random() * 8 + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  const handleEnter = () => {
    setShow(false)
    setTimeout(onEnter, 600)
  }

  if (!show) return null

  const bars = Math.floor((Math.min(progress, 100) / 100) * 10)
  const progressStr = '█'.repeat(bars) + '░'.repeat(10 - bars)

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.title}>AMIT AT INFINITY</div>
        <div className={styles.subtitle}>Preparing infinity...</div>
        <div className={styles.progressBar}>{progressStr}</div>
        <div className={styles.percent}>{Math.floor(Math.min(progress, 100))}%</div>

        {ready && (
          <div className={styles.enterWrap}>
            <p className={styles.quote}>"Preparing infinity."</p>
            <button className={styles.enterBtn} onClick={handleEnter}>
              [ ENTER INFINITY ]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

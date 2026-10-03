import { useEffect, useRef } from 'react'
import { useGameStore } from '../systems/gameStore'
import { ACHIEVEMENTS } from '../data/portfolio'
import styles from './AchievementToast.module.css'

export function AchievementToast() {
  const pending      = useGameStore((s) => s.pendingAchievement)
  const clearPending = useGameStore((s) => s.clearPendingAchievement)
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(null!)

  const achievement = pending ? ACHIEVEMENTS.find((a) => a.id === pending) : null

  useEffect(() => {
    if (pending) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => clearPending(), 3500)
    }
    return () => clearTimeout(timerRef.current)
  }, [pending, clearPending])

  if (!achievement) return null

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>{achievement.icon}</span>
      <div className={styles.text}>
        <span className={styles.label}>Achievement Unlocked</span>
        <span className={styles.title}>{achievement.title}</span>
        <span className={styles.desc}>{achievement.description}</span>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { useGameStore } from '../../systems/gameStore'
import { DESTINATIONS } from '../../data/portfolio'
import styles from './HUD.module.css'

export function HUD() {
  const shipSpeed       = useGameStore((s) => s.shipSpeed)
  const nearbyDest      = useGameStore((s) => s.nearbyDestination)
  const currentDest     = useGameStore((s) => s.currentDestination)
  const audioEnabled    = useGameStore((s) => s.audioEnabled)
  const toggleAudio     = useGameStore((s) => s.toggleAudio)
  const toggleDebug     = useGameStore((s) => s.toggleDebug)
  const debugMode       = useGameStore((s) => s.debugMode)
  const setActivePanel  = useGameStore((s) => s.setActivePanel)
  const activePanel     = useGameStore((s) => s.activePanel)

  const nearby = DESTINATIONS.find((d) => d.id === nearbyDest)

  // Panel mapping per destination
  const PANEL_MAP: Record<string, 'about' | 'projects' | 'skills' | 'research' | 'experience' | 'achievements' | 'contact'> = {
    lighthouse: 'about',
    skills:     'skills',
    projects:   'projects',
    research:   'research',
    wreck:      'experience',
    treasure:   'achievements',
    horizon:    'contact',
    secret:     'achievements',
  }

  // Keyboard shortcuts (global)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setActivePanel(activePanel === 'map' ? null : 'map')
      }
      if (e.code === 'KeyE' && nearbyDest) {
        const panel = PANEL_MAP[nearbyDest]
        if (panel) setActivePanel(activePanel === panel ? null : panel)
      }
      if (e.code === 'Escape') {
        setActivePanel(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nearbyDest, activePanel, setActivePanel])

  return (
    <div className={styles.hud}>
      {/* Speed indicator */}
      <div className={styles.speedometer}>
        <div className={styles.speedBar}>
          <div
            className={styles.speedFill}
            style={{ width: `${Math.min((shipSpeed / 25) * 100, 100)}%` }}
          />
        </div>
        <span className={styles.speedValue}>{Math.round(shipSpeed)} kts</span>
      </div>

      {/* Interaction prompt */}
      {nearby && (
        <div className={styles.interactPrompt}>
          <span className={styles.key}>E</span>
          <span>Explore {nearby.label}</span>
        </div>
      )}

      {/* Location name */}
      {currentDest && (
        <div className={styles.locationName}>
          {DESTINATIONS.find((d) => d.id === currentDest)?.icon}{' '}
          {DESTINATIONS.find((d) => d.id === currentDest)?.label}
        </div>
      )}

      {/* Top-right controls */}
      <div className={styles.topRight}>
        <button className={styles.iconBtn} onClick={toggleAudio} title="Toggle audio">
          {audioEnabled ? '🔊' : '🔇'}
        </button>
        <button className={styles.iconBtn} onClick={() => setActivePanel(activePanel === 'map' ? null : 'map')} title="Map (M)">
          🗺️
        </button>
        <button className={styles.iconBtn} onClick={toggleDebug} title="Debug">
          {debugMode ? '🐛' : '⚙️'}
        </button>
      </div>

      {/* Controls hint — bottom right */}
      <div className={styles.controls}>
        <span>WASD / ↑↓←→ — Move</span>
        <span>Space — Boost</span>
        <span>M — Map</span>
        <span>E — Interact</span>
      </div>
    </div>
  )
}

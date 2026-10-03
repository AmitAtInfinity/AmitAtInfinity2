import { useState } from 'react'
import { Leva } from 'leva'
import { Experience } from './components/experience/Experience'
import { HUD } from './ui/HUD/HUD'
import { Panels } from './ui/Panels'
import { AchievementToast } from './ui/AchievementToast'
import { LoadingScreen } from './components/Loading/LoadingScreen'
import { useGameStore } from './systems/gameStore'
import './App.css'

export default function App() {
  const [voyageStarted, setVoyageStarted] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <Leva hidden />
      {/* Loading screen sits on top until user presses ENTER */}
      {!voyageStarted && (
        <LoadingScreen onEnter={() => setVoyageStarted(true)} />
      )}

      {/* 3D world — always mounted so it loads while user reads the loading screen */}
      <Experience />

      {/* 2D UI overlay — only visible after voyage starts */}
      {voyageStarted && (
        <>
          <HUD />
          <Panels />
          <AchievementToast />
        </>
      )}

      {/* Cinematic Overlays */}
      <BlackScreenOverlay />
    </div>
  )
}

function BlackScreenOverlay() {
  const opacity = useGameStore((s) => s.blackScreenOpacity)
  
  if (opacity <= 0) return null
  
  return (
    <div 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundColor: 'black', 
        opacity, 
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'opacity 0.1s linear'
      }} 
    />
  )
}

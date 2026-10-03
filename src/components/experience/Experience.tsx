import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import { Ocean } from './Ocean/Ocean'
import { Ship } from './Ship/Ship'
import { CameraRig } from './Camera/CameraRig'
import { Environment } from './Environment/Environment'
import { Islands } from './Islands/Islands'
import { Wake } from './Effects/Wake'
import { ArrowPath } from './Effects/ArrowPath'
import { useGameStore } from '../../systems/gameStore'

export function Experience() {
  const debugMode = useGameStore((s) => s.debugMode)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 6, 20] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      {debugMode && <Perf position="top-left" />}

      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]} colliders={false}>
          <Environment />
          <Ocean />
          <Ship />
          <Wake />
          <ArrowPath />
          <Islands />
          <CameraRig />
        </Physics>
      </Suspense>
    </Canvas>
  )
}

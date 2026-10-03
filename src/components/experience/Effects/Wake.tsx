import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../../systems/gameStore'

/** Trailing wake plane behind the ship */
export function Wake() {
  const wakeRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.MeshBasicMaterial>(null!)
  const shipSpeed = useGameStore((s) => s.shipSpeed)
  const shipPos   = useGameStore((s) => s.shipPosition)

  useFrame((_) => {
    const mesh = wakeRef.current
    if (!mesh) return

    // Position wake behind ship
    mesh.position.set(shipPos[0], shipPos[1] - 0.05, shipPos[2] + 3)

    // Scale wake with speed
    const t = Math.min(shipSpeed / 25, 1)
    mesh.scale.set(0.5 + t * 2.5, 1, 1 + t * 5)

    // Fade opacity with speed
    if (matRef.current) {
      matRef.current.opacity = t * 0.5
    }
  })

  return (
    <mesh ref={wakeRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2, 6, 1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        color="#c8e8ff"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}

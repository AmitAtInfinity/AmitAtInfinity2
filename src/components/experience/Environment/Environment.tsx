import { useRef } from 'react'
import { Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Subtle cloud puff — sky-tinted so it melts into the background
function FluffyCloud({ position, scale = 1, speed = 0.02, opacity = 0.3 }: {
  position: [number, number, number]
  scale?: number
  speed?: number
  opacity?: number
}) {
  const group = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.position.x += speed * delta
    if (group.current.position.x > 400) {
      group.current.position.x = -400
    }
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[6, 7, 7]} />
        <meshStandardMaterial color="#d8e8f8" transparent opacity={opacity} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[7, -1, 0]}>
        <sphereGeometry args={[4.5, 6, 6]} />
        <meshStandardMaterial color="#d0e2f2" transparent opacity={opacity * 0.85} roughness={1} />
      </mesh>
      <mesh position={[-7, -1.5, 0]}>
        <sphereGeometry args={[5, 6, 6]} />
        <meshStandardMaterial color="#d0e2f2" transparent opacity={opacity * 0.85} roughness={1} />
      </mesh>
      <mesh position={[3, 3.5, 0]}>
        <sphereGeometry args={[3.5, 6, 6]} />
        <meshStandardMaterial color="#ddeeff" transparent opacity={opacity * 0.9} roughness={1} />
      </mesh>
      <mesh position={[-3, 3, 1]}>
        <sphereGeometry args={[4, 6, 6]} />
        <meshStandardMaterial color="#ddeeff" transparent opacity={opacity * 0.9} roughness={1} />
      </mesh>
      <mesh position={[10, -3, 2]}>
        <sphereGeometry args={[3, 5, 5]} />
        <meshStandardMaterial color="#c8daea" transparent opacity={opacity * 0.7} roughness={1} />
      </mesh>
      <mesh position={[-10, -2, -1]}>
        <sphereGeometry args={[3.5, 5, 5]} />
        <meshStandardMaterial color="#c8daea" transparent opacity={opacity * 0.7} roughness={1} />
      </mesh>
      <mesh position={[0, -3.5, 0]}>
        <sphereGeometry args={[5.5, 7, 4]} />
        <meshStandardMaterial color="#b8c8da" transparent opacity={opacity * 0.4} roughness={1} />
      </mesh>
    </group>
  )
}

export function Environment() {
  return (
    <>
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[80, 22, 60]}
        turbidity={6}
        rayleigh={1.4}
        mieCoefficient={0.004}
        mieDirectionalG={0.82}
        azimuth={0.22}
      />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#b8ddf2', 120, 550]} />

      {/* Ambient fill */}
      <ambientLight intensity={0.75} color="#fff4e0" />

      {/* Sun directional */}
      <directionalLight
        position={[80, 80, 60]}
        intensity={2.2}
        color="#fffbe8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={600}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />

      {/* Sky/ground bounce */}
      <hemisphereLight args={['#aad4f5', '#2a8a7a', 0.9]} />

      {/* ── Clouds — few, faint, submerged into the sky ─────────── */}
      <FluffyCloud position={[-80, 50, -120]}  scale={3.0}  speed={0.8}  opacity={0.28} />
      <FluffyCloud position={[140, 60, -200]}  scale={3.5}  speed={0.6}  opacity={0.22} />
      <FluffyCloud position={[-200, 65, -320]} scale={4.0}  speed={0.5}  opacity={0.18} />
      <FluffyCloud position={[60, 55, -400]}   scale={4.5}  speed={0.4}  opacity={0.15} />
      <FluffyCloud position={[280, 70, -450]}  scale={5.0}  speed={0.3}  opacity={0.12} />
      <FluffyCloud position={[-50, 80, 60]}    scale={3.5}  speed={0.7}  opacity={0.14} />
    </>
  )
}


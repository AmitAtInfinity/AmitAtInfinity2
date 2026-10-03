import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../../systems/gameStore'

export function ArrowPath() {
  const discovered = useGameStore((s) => s.discoveredDestinations)
  // If the lighthouse has been found, we don't render the path.
  const isLighthouseDiscovered = discovered.has('lighthouse' as any)
  
  const groupRef = useRef<THREE.Group>(null)
  
  const arrowCount = 12
  
  // A simple 2D shape for the arrow/chevron
  const arrowGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 1.5)    // Tip (pointing +Y in local 2D space)
    shape.lineTo(1.2, -1.5) // Bottom right
    shape.lineTo(0, -0.5)   // Bottom inner notch
    shape.lineTo(-1.2, -1.5)// Bottom left
    shape.lineTo(0, 1.5)    // Back to tip
    return new THREE.ShapeGeometry(shape)
  }, [])

  // Animate the cascading blink effect and update positions dynamically
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    const speed = -5 // Faster flow
    
    // Dynamically calculate path from ship to lighthouse
    const shipPosArr = useGameStore.getState().shipPosition
    // Push the start position slightly in front of the ship so it doesn't clip through the hull
    const shipPos = new THREE.Vector3(shipPosArr[0], 0.2, shipPosArr[2])
    const end = new THREE.Vector3(-80, 0.2, -60) // Lighthouse position
    
    const direction = new THREE.Vector3().subVectors(end, shipPos)
    // Angle in the XZ plane to point from start to end (added PI to fix 180deg flip)
    const angle = Math.atan2(direction.x, direction.z) + Math.PI
    
    groupRef.current.children.forEach((child, i) => {
      // 1. Update Position & Rotation
      // t goes from 0.1 to 1.0 so we don't spawn arrows exactly inside the ship
      const t = 0.1 + (i / (arrowCount - 1)) * 0.9
      child.position.lerpVectors(shipPos, end, t)
      child.rotation.set(-Math.PI / 2, 0, angle)

      // 2. Update Glow Animation
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        const phase = (i / arrowCount) * Math.PI * 4
        
        // Sine wave between 0 and 1
        const wave = (Math.sin(time * speed - phase) + 1) / 2
        // Power of 4 makes the pulse sharper
        const intensity = Math.pow(wave, 4)
        
        // Solid black when off, bright glowing neon red when on
        mat.emissiveIntensity = intensity * 4
        mat.opacity = 1 // Fully solid, never transparent
      }
    })
  })

  if (isLighthouseDiscovered) return null

  return (
    <group ref={groupRef}>
      {Array.from({ length: arrowCount }).map((_, i) => (
        <mesh key={i}>
          <primitive object={arrowGeo} attach="geometry" />
          <meshStandardMaterial 
            color="#000000" // Pitch black base
            emissive="#ff0033" // Neon red/pink glow
            transparent={false} // Solid to prevent blending with water
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

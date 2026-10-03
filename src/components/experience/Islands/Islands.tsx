import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { DESTINATIONS } from '../../../data/portfolio'
import { useGameStore } from '../../../systems/gameStore'

const INTERACTION_RADIUS = 18    // units — how close to trigger
const DOCK_RADIUS = 14           // units — close enough to dock outside the island colliders

// ── Shared island geometry factory ──────────────────────────────────────────

function Island({ position, color, capColor, children, id, labelOffset = [0, 8, 0], labelColor = "#dddddd" }: {
  position: [number, number, number]
  color: string
  capColor?: string
  id: string
  labelOffset?: [number, number, number]
  labelColor?: string
  children?: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null!)
  const setNearby  = useGameStore((s) => s.setNearbyDestination)
  const setCurrent = useGameStore((s) => s.setCurrentDestination)
  const discover   = useGameStore((s) => s.discoverDestination)
  const shipPos    = useGameStore((s) => s.shipPosition)
  const unlock     = useGameStore((s) => s.unlockAchievement)

  const wasNearby  = useRef(false)
  const wasDocked  = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asId = (v: string) => v as any

  useFrame(() => {
    const dx = shipPos[0] - position[0]
    const dz = shipPos[2] - position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)

    const isNearby = dist < INTERACTION_RADIUS
    const isDocked = dist < DOCK_RADIUS

    if (isNearby && !wasNearby.current) {
      setNearby(asId(id))
      discover(asId(id))
      unlock(asId(`ach-${id}`))
    } else if (!isNearby && wasNearby.current) {
      setNearby(null)
    }

    if (isDocked && !wasDocked.current) {
      setCurrent(asId(id))
    } else if (!isDocked && wasDocked.current) {
      setCurrent(null)
    }

    wasNearby.current = isNearby
    wasDocked.current = isDocked
  })

  return (
    <group ref={group} position={position}>
      {/* Island base */}
      <mesh receiveShadow castShadow position={[0, -1, 0]}>
        <cylinderGeometry args={[8, 10, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Sand/grass cap */}
      <mesh receiveShadow castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[7.5, 8, 1, 8]} />
        <meshStandardMaterial color={capColor ?? "#c8b87a"} roughness={0.95} />
      </mesh>
      {/* Name label floating above */}
      <Text
        position={labelOffset}
        fontSize={1.2}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#555555"
      >
        {DESTINATIONS.find(d => d.id === id)?.label ?? id}
      </Text>
      {children}
    </group>
  )
}

// ── Harbor Town Details ───────────────────────────────────────────────────

interface HouseProps { position: [number, number, number], color: string, roofColor: string, scale?: number, rotation?: [number, number, number] }
function House({ position, color, roofColor, scale = 1, rotation = [0, 0, 0] }: HouseProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main Body */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Roof (Pyramid) */}
      <mesh castShadow receiveShadow position={[0, 3.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.2, 1.6, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.75, 1.51]}>
        <boxGeometry args={[0.8, 1.5, 0.1]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      {/* Windows */}
      <mesh position={[-1.2, 1.8, 1.51]}>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#88ccff" />
      </mesh>
      <mesh position={[1.2, 1.8, 1.51]}>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#88ccff" />
      </mesh>
    </group>
  )
}

interface TreeProps { position: [number, number, number], scale?: number }
function LowPolyTree({ position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 2, 6]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh castShadow position={[0, 2.5, 0]}>
        <dodecahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial color="#509040" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[1, 2.0, 0.5]}>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#408030" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.8, 2.2, -0.5]}>
        <dodecahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color="#60a040" roughness={0.9} />
      </mesh>
    </group>
  )
}

interface PropProps { position: [number, number, number], rotation?: [number, number, number] }
function Crate({ position, rotation = [0, 0, 0] }: PropProps) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#8a6b4e" roughness={0.9} />
    </mesh>
  )
}

function Barrel({ position }: PropProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} />
    </mesh>
  )
}

// ── Harbor — The Coastal Port Town & Continental Border ─────────────────

function Harbor() {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. MASSIVE BORDER MOUNTAINS (Forming the edge of the world) */}
      
      {/* Far Left: Flat "Table" Mountain */}
      <mesh receiveShadow castShadow position={[-160, 20, 130]} rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[25, 80, 60, 7]} />
        <meshStandardMaterial color="#4a7a4a" roughness={1} flatShading />
      </mesh>
      
      {/* Inner Left: Pointy, jagged peak (Slightly less sharp at the very top) */}
      <mesh receiveShadow castShadow position={[-70, 25, 120]} rotation={[0, 1.2, 0]}>
        <cylinderGeometry args={[4, 60, 80, 6]} />
        <meshStandardMaterial color="#3a6a3a" roughness={1} flatShading />
      </mesh>
      
      {/* Inner Right: Tall mountain with a smooth blunt top */}
      <mesh receiveShadow castShadow position={[50, 25, 140]} rotation={[0, -0.4, 0]}>
        <cylinderGeometry args={[15, 90, 80, 10]} />
        <meshStandardMaterial color="#5a8a5a" roughness={1} flatShading />
      </mesh>
      
      {/* Far Right: Classic slightly blunt mountain (Shrunk) */}
      <mesh receiveShadow castShadow position={[160, 15, 130]} rotation={[0, 0.8, 0]}>
        <cylinderGeometry args={[8, 60, 50, 8]} />
        <meshStandardMaterial color="#4a7a4a" roughness={1} flatShading />
      </mesh>

      {/* 2. THE NATURAL COASTLINE (Sandy beaches gently sloping into water) */}
      {/* Central Beach (Where the pier connects perfectly at Y=1.2, Z=12) */}
      <mesh receiveShadow position={[-5, -0.8, 28]}>
        <cylinderGeometry args={[16, 36, 4, 24]} />
        <meshStandardMaterial color="#e0cda7" roughness={1} flatShading />
      </mesh>

      {/* Left Beach */}
      <mesh receiveShadow position={[-40, -1.0, 32]} rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[18, 40, 4, 16]} />
        <meshStandardMaterial color="#e0cda7" roughness={1} flatShading />
      </mesh>

      {/* Right Beach */}
      <mesh receiveShadow position={[30, -0.9, 32]} rotation={[0, -0.3, 0]}>
        <cylinderGeometry args={[16, 38, 4, 16]} />
        <meshStandardMaterial color="#e0cda7" roughness={1} flatShading />
      </mesh>

      {/* Central Grassy Hill (Behind the beach) */}
      <mesh receiveShadow position={[-5, 0.5, 42]}>
        <cylinderGeometry args={[20, 26, 6, 20]} />
        <meshStandardMaterial color="#a8b86a" roughness={1} flatShading />
      </mesh>
      
      {/* Left Grassy Hill */}
      <mesh receiveShadow position={[-45, 1.0, 48]}>
        <cylinderGeometry args={[25, 32, 8, 16]} />
        <meshStandardMaterial color="#5a8a5a" roughness={1} flatShading />
      </mesh>

      {/* Right Grassy Hill */}
      <mesh receiveShadow position={[35, 1.0, 48]}>
        <cylinderGeometry args={[22, 30, 8, 16]} />
        <meshStandardMaterial color="#5a8a5a" roughness={1} flatShading />
      </mesh>

      {/* 3. THE WOODEN PIER (Sticks out from the central beach) */}
      <group position={[-5, 0, 2]}>
        {/* Pier Deck */}
        <mesh receiveShadow castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[4, 0.4, 20]} />
          <meshStandardMaterial color="#5C4033" roughness={0.9} />
        </mesh>
        
        {/* Pier Planks Detail */}
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} receiveShadow position={[0, 1.41, -9.5 + i * 1.0]}>
            <boxGeometry args={[3.8, 0.05, 0.9]} />
            <meshStandardMaterial color="#4A3020" roughness={1.0} />
          </mesh>
        ))}

        {/* Support Pillars */}
        {[[-1.5, -8], [1.5, -8], [-1.5, -4], [1.5, -4], [-1.5, 0], [1.5, 0], [-1.5, 4], [1.5, 4], [-1.5, 8], [1.5, 8]].map(([px, pz], i) => (
          <mesh key={i} castShadow position={[px, -1, pz]}>
            <cylinderGeometry args={[0.3, 0.3, 5, 8]} />
            <meshStandardMaterial color="#2d1a0d" roughness={0.9} />
          </mesh>
        ))}

        {/* Bollards */}
        {[[-1.2, -7], [1.2, -7], [-1.2, 0], [1.2, 0], [-1.2, 7], [1.2, 7]].map(([bx, bz], i) => (
          <mesh key={i} castShadow position={[bx, 1.6, bz]}>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        ))}

        {/* Harbor sign */}
        <group position={[0, 1.5, -8]}>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[5, 1.2, 0.2]} />
            <meshStandardMaterial color="#3A2010" roughness={0.8} />
          </mesh>
          <Text position={[0, 2, 0.12]} fontSize={0.6} color="#e8c078" anchorX="center" anchorY="middle">
            THE VOYAGE
          </Text>
          {/* Sign posts */}
          <mesh castShadow position={[-1.5, 0.5, 0]}><cylinderGeometry args={[0.1, 0.1, 3]} /><meshStandardMaterial color="#2d1a0d" /></mesh>
          <mesh castShadow position={[1.5, 0.5, 0]}><cylinderGeometry args={[0.1, 0.1, 3]} /><meshStandardMaterial color="#2d1a0d" /></mesh>
        </group>
      </group>

      {/* 4. COLORFUL PORT HOUSES (Nestled on the beaches and hills) */}
      {/* Houses on the sandy beach */}
      <House position={[-15, 1.2, 18]} color="#2080a0" roofColor="#8a3020" rotation={[0, Math.PI + 0.2, 0]} />
      <House position={[5, 1.2, 17]} color="#d06020" roofColor="#8a3020" rotation={[0, Math.PI - 0.2, 0]} />
      <House position={[15, 1.2, 20]} color="#209040" roofColor="#8a3020" rotation={[0, Math.PI - 0.4, 0]} />
      
      {/* Houses on the grassy hills behind */}
      <House position={[-10, 3.5, 28]} color="#a03030" roofColor="#8a3020" rotation={[0, Math.PI + 0.1, 0]} />
      <House position={[0, 3.5, 27]} color="#d0b020" roofColor="#8a3020" rotation={[0, Math.PI, 0]} />
      <House position={[10, 3.5, 29]} color="#2080a0" roofColor="#8a3020" rotation={[0, Math.PI - 0.1, 0]} />

      {/* 5. TREES AND NATURE */}
      <LowPolyTree position={[-25, 1.2, 20]} scale={1.5} />
      <LowPolyTree position={[25, 1.2, 22]} scale={1.8} />
      
      <LowPolyTree position={[-20, 3.5, 28]} scale={2.0} />
      <LowPolyTree position={[20, 3.5, 30]} scale={1.6} />
      
      <LowPolyTree position={[-40, 5.0, 40]} scale={2.5} />
      <LowPolyTree position={[40, 5.0, 45]} scale={2.2} />
      
      {/* 6. BARRELS AND CRATES (On the pier and beach) */}
      <Crate position={[-5.8, 1.81, 6]} rotation={[0, 0.2, 0]} />
      <Crate position={[-5.8, 2.61, 6]} rotation={[0, -0.1, 0]} />
      <Barrel position={[-4.2, 1.81, 5.5]} />
      <Barrel position={[-4.5, 1.81, 6.2]} />
      <Barrel position={[-3.8, 1.81, 7]} />

      <Crate position={[2, 1.6, 14]} rotation={[0, 0.4, 0]} />
      <Barrel position={[4, 1.6, 15]} />
    </group>
  )
}

// ── Lighthouse — About Me ─────────────────────────────────────────────────

function Lighthouse() {
  const lightRef = useRef<THREE.PointLight>(null!)
  useFrame(({ clock }) => {
    if (lightRef.current) {
      // Rotating light effect or pulsing
      lightRef.current.intensity = 3 + Math.sin(clock.getElapsedTime() * 3) * 1.5
    }
  })
  
  return (
    <Island id="lighthouse" position={[-80, 0, -60]} color="#6aa84f" labelOffset={[0, 8.5, 8]} labelColor="#cccccc">
      {/* 1. Rocks around the edge */}
      <mesh position={[-6, 0.5, -4]} rotation={[0, Math.PI/4, 0]}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#403060" flatShading />
      </mesh>
      <mesh position={[7, 0.2, -2]} rotation={[0.2, 0, 0.5]} scale={[1, 0.6, 1]}>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial color="#403060" flatShading />
      </mesh>
      <mesh position={[4, 0.5, 6]} rotation={[0.5, 1, 0.5]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#302050" flatShading />
      </mesh>

      {/* 2. Wooden Dock (Front at Z = 9) */}
      <group position={[0, 0.7, 9.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.3, 5]} />
          <meshStandardMaterial color="#d06030" flatShading />
        </mesh>
        {/* Support poles */}
        {[1.5, -1.5].map((z) => (
          <mesh key={z} position={[-0.8, -1.5, z]}>
            <boxGeometry args={[0.3, 3.5, 0.3]} />
            <meshStandardMaterial color="#804020" />
          </mesh>
        ))}
        {[1.5, -1.5].map((z) => (
          <mesh key={`r${z}`} position={[0.8, -1.5, z]}>
            <boxGeometry args={[0.3, 3.5, 0.3]} />
            <meshStandardMaterial color="#804020" />
          </mesh>
        ))}
      </group>

      {/* 3. Yellow Path */}
      <mesh position={[0, 0.91, 5.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshStandardMaterial color="#f0d050" />
      </mesh>

      {/* 4. Pine Trees (Cones on cylinders) */}
      {[
        [-4, 0.9, 3],
        [-2.5, 0.9, 5],
        [4, 0.9, 3],
        [6, 0.9, 0],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.5]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.6, 2, 5]} />
            <meshStandardMaterial color="#4caf50" flatShading />
          </mesh>
        </group>
      ))}

      {/* 5. Lighthouse Base Buildings */}
      <group position={[0, 0.9, 0]}>
        {/* White side building */}
        <mesh castShadow position={[2, 1, 0]}>
          <boxGeometry args={[2.8, 2, 2.8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Slanted purple roof for white building */}
        <mesh castShadow position={[2, 2.1, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[3.2, 0.2, 3.2]} />
          <meshStandardMaterial color="#605090" flatShading />
        </mesh>
        {/* Cyan Window */}
        <mesh position={[2.5, 1.2, 1.51]}>
          <boxGeometry args={[0.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#00ffff" />
        </mesh>

        {/* Dark Blue Main Base */}
        <mesh castShadow position={[-0.5, 1.5, 0]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#202060" flatShading />
        </mesh>
        {/* Brown Door */}
        <mesh position={[-0.5, 0.6, 1.51]}>
          <boxGeometry args={[1, 1.2, 0.1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* 6. Lighthouse Tower (Octagonal Cylinders) */}
        <group position={[-0.5, 3.0, 0]}>
          {/* Alternating Stripes */}
          {[
            { y: 1.0, color: '#ffffff', radiusTop: 1.1, radiusBottom: 1.3 },
            { y: 3.0, color: '#e03030', radiusTop: 0.9, radiusBottom: 1.1 },
            { y: 5.0, color: '#ffffff', radiusTop: 0.7, radiusBottom: 0.9 },
            { y: 7.0, color: '#e03030', radiusTop: 0.5, radiusBottom: 0.7 },
          ].map((stripe, i) => (
            <mesh castShadow key={i} position={[0, stripe.y, 0]}>
              <cylinderGeometry args={[stripe.radiusTop, stripe.radiusBottom, 2, 8]} />
              <meshStandardMaterial color={stripe.color} flatShading />
            </mesh>
          ))}

          {/* Red Balcony / Railing Platform */}
          <mesh castShadow position={[0, 8.2, 0]}>
            <cylinderGeometry args={[1.0, 0.5, 0.4, 8]} />
            <meshStandardMaterial color="#e03030" flatShading />
          </mesh>
          
          {/* Cyan Glass Lantern Room */}
          <mesh position={[0, 9.2, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 1.6, 8]} />
            <meshStandardMaterial color="#00ffff" transparent opacity={0.6} flatShading />
          </mesh>
          {/* Inner Light Core */}
          <mesh position={[0, 9.2, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 9.2, 0]} color="#ffffff" intensity={5} distance={100} />

          {/* Red Conical Roof */}
          <mesh castShadow position={[0, 10.5, 0]}>
            <coneGeometry args={[0.9, 1.0, 8]} />
            <meshStandardMaterial color="#e03030" flatShading />
          </mesh>
          {/* Roof Cap */}
          <mesh castShadow position={[0, 11.1, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#e03030" flatShading />
          </mesh>
        </group>
      </group>
    </Island>
  )
}

// ── Skills Island ─────────────────────────────────────────────────────────

function PalmTree({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Base Trunk Segment */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 6]} />
          <meshStandardMaterial color="#8a6b4e" flatShading />
        </mesh>
        
        {/* Second Trunk Segment */}
        <group position={[0, 1.4, 0]} rotation={[0, 0, 0.15]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.5, 6]} />
            <meshStandardMaterial color="#8a6b4e" flatShading />
          </mesh>
          
          {/* Third Trunk Segment */}
          <group position={[0, 1.4, 0]} rotation={[0, 0, 0.2]}>
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.2, 1.5, 6]} />
              <meshStandardMaterial color="#8a6b4e" flatShading />
            </mesh>
            
            {/* Tree Top (Coconuts & Leaves) */}
            <group position={[0, 1.4, 0]}>
              {/* Coconuts */}
              {[0, 1, 2].map((i) => (
                <mesh key={`coco-${i}`} position={[Math.cos(i * 2.1) * 0.3, -0.2, Math.sin(i * 2.1) * 0.3]} castShadow>
                  <dodecahedronGeometry args={[0.25]} />
                  <meshStandardMaterial color="#3a2010" flatShading />
                </mesh>
              ))}

              {/* Leaves */}
              {[...Array(6)].map((_, i) => (
                <group key={`leaf-${i}`} rotation={[0, (i * Math.PI * 2) / 6, 0]}>
                  {/* Tilt the leaf outwards and downwards (past 90 degrees) */}
                  <group rotation={[0, 0, -Math.PI / 1.8]}>
                    {/* Shift the cone along its local Y axis so its base sits exactly at the origin (0,0,0) */}
                    <mesh position={[0, 1.25, 0]} scale={[1, 1, 0.1]} castShadow>
                      <coneGeometry args={[0.5, 2.5, 4]} />
                      <meshStandardMaterial color="#66bb6a" flatShading />
                    </mesh>
                  </group>
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

function SkillsIsland() {
  return (
    <Island id="skills" position={[0, 0, -130]} color="#d6c694" capColor="#f5e4b3" labelOffset={[0, 15, 0]}>
      {/* Irregular sand mounds to break the octagon shape */}
      <mesh position={[-6, 0.5, 6]} castShadow receiveShadow rotation={[0.2, 0.5, 0]}>
        <dodecahedronGeometry args={[5]} />
        <meshStandardMaterial color="#f5e4b3" roughness={1} flatShading />
      </mesh>
      <mesh position={[7, 0.5, -5]} castShadow receiveShadow rotation={[-0.2, 0.8, 0.1]}>
        <dodecahedronGeometry args={[5.5]} />
        <meshStandardMaterial color="#f5e4b3" roughness={1} flatShading />
      </mesh>

      {/* ── Main Boat-House ── */}
      <group position={[0, 1.0, 0]} rotation={[0, -Math.PI / 6, 0]}>
        
        {/* House Walls (Sage Green) */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 3, 5.2]} />
          <meshStandardMaterial color="#749678" roughness={0.9} />
        </mesh>
        {/* Wall Planks Lines (Subtle details) */}
        {[...Array(4)].map((_, i) => (
          <mesh key={`plank-${i}`} position={[0, 0.8 + i * 0.6, 2.61]} castShadow>
            <boxGeometry args={[4, 0.05, 0.05]} />
            <meshStandardMaterial color="#5a7a5a" />
          </mesh>
        ))}

        {/* Boat Hull Roof (Dark Red/Brown) */}
        <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 2.8, 5.6, 12, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#7a3a30" roughness={0.8} flatShading />
        </mesh>
        
        {/* Roof Keel */}
        <mesh position={[0, 5.8, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 5.6]} />
          <meshStandardMaterial color="#4a201c" roughness={0.9} />
        </mesh>

        {/* Small window on the roof side */}
        <mesh position={[2.65, 4.2, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
          <meshStandardMaterial color="#aaddff" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[2.7, 4.2, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
          <torusGeometry args={[0.4, 0.05, 4, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Door */}
        <mesh position={[0, 1.2, 2.61]} castShadow>
          <boxGeometry args={[1.2, 2.2, 0.1]} />
          <meshStandardMaterial color="#5c3a21" roughness={0.9} />
        </mesh>

        {/* Window */}
        <mesh position={[1.4, 1.5, 2.61]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#aaddff" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[1.4, 1.5, 2.65]} castShadow>
          <boxGeometry args={[0.9, 0.9, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[1.4, 1.5, 2.66]} castShadow><boxGeometry args={[0.1, 0.9, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[1.4, 1.5, 2.66]} castShadow><boxGeometry args={[0.9, 0.1, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh>

        {/* Lifebuoy */}
        <mesh position={[-1.2, 1.5, 2.62]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.4, 0.12, 8, 12]} />
          <meshStandardMaterial color="#e63946" roughness={0.8} />
        </mesh>
        <mesh position={[-1.2, 1.5, 2.62]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <torusGeometry args={[0.41, 0.13, 4, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>

        {/* Deck / Porch */}
        <mesh position={[0, 0.1, 3.8]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.2, 2.4]} />
          <meshStandardMaterial color="#bda07b" roughness={0.9} />
        </mesh>
        {/* Porch Pillars & Railing */}
        <mesh position={[-2.3, 0.6, 4.8]} castShadow><boxGeometry args={[0.1, 1, 0.1]} /><meshStandardMaterial color="#bda07b" /></mesh>
        <mesh position={[2.3, 0.6, 4.8]} castShadow><boxGeometry args={[0.1, 1, 0.1]} /><meshStandardMaterial color="#bda07b" /></mesh>
        <mesh position={[0, 0.9, 4.8]} castShadow><boxGeometry args={[4.8, 0.1, 0.1]} /><meshStandardMaterial color="#bda07b" /></mesh>

        {/* Stairs */}
        <mesh position={[0, -0.3, 5.3]} castShadow><boxGeometry args={[1.5, 0.1, 0.6]} /><meshStandardMaterial color="#bda07b" /></mesh>
        <mesh position={[0, -0.7, 5.7]} castShadow><boxGeometry args={[1.5, 0.1, 0.6]} /><meshStandardMaterial color="#bda07b" /></mesh>

        {/* Ladder leaning on roof */}
        <group position={[-2.2, 2.0, 1.0]} rotation={[0, 0, -Math.PI / 8]}>
          <mesh position={[-0.3, 0, 0]} castShadow><boxGeometry args={[0.1, 4.5, 0.1]} /><meshStandardMaterial color="#8a603a" /></mesh>
          <mesh position={[0.3, 0, 0]} castShadow><boxGeometry args={[0.1, 4.5, 0.1]} /><meshStandardMaterial color="#8a603a" /></mesh>
          {[...Array(7)].map((_, i) => (
            <mesh key={i} position={[0, -1.8 + i * 0.6, 0]} castShadow><boxGeometry args={[0.6, 0.1, 0.1]} /><meshStandardMaterial color="#8a603a" /></mesh>
          ))}
        </group>

        {/* Chimney & Smoke */}
        <group position={[1.5, 2.5, -2.0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 3.5, 1]} />
            <meshStandardMaterial color="#b34b3d" roughness={0.9} />
          </mesh>
          {/* Natural Fluffy Smoke */}
          <group position={[0, 2.5, 0]}>
            {[...Array(8)].map((_, i) => (
              <mesh key={`smoke-${i}`} position={[Math.sin(i * 1.5) * 0.4, i * 0.6, Math.cos(i * 1.5) * 0.4]} castShadow>
                <sphereGeometry args={[0.6 + Math.sin(i * 0.8) * 0.3, 16, 16]} />
                <meshStandardMaterial color="#eeeeee" transparent opacity={0.85 - (i * 0.08)} roughness={1} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ── Environment Details ── */}
      
      {/* Grey Low Poly Rocks */}
      {[
        [-7, 1, 6], [9, 0.5, 6], [6, 0.5, -6], [-6, 0, -7], [-9, -0.5, 2]
      ].map(([x, y, z], i) => (
        <mesh key={`rock-${i}`} position={[x, y, z]} rotation={[Math.random(), Math.random(), Math.random()]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.5 + Math.random()]} />
          <meshStandardMaterial color="#666666" roughness={0.8} flatShading />
        </mesh>
      ))}

      {/* Tall Dark Rocks in water */}
      <mesh position={[-14, -1, 10]} rotation={[0.2, 0.5, 0.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3.5]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[-11, 1, 12]} rotation={[0, 0.2, 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[4.5]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} flatShading />
      </mesh>

      {/* Grass Tufts */}
      {[...Array(35)].map((_, i) => {
        const x = (Math.random() - 0.5) * 16
        const z = (Math.random() - 0.5) * 16
        const dist = Math.sqrt(x*x + z*z)
        if (dist > 8 || dist < 4) return null
        return (
          <mesh key={`grass-${i}`} position={[x, 1.2, z]} rotation={[0, Math.random() * Math.PI, 0]} castShadow>
            <coneGeometry args={[0.3, 1.2, 4]} />
            <meshStandardMaterial color="#557a36" roughness={0.9} flatShading />
          </mesh>
        )
      })}

      {/* Tiny Sand Island connected by bridge */}
      <group position={[-10, 0, -2]}>
        <mesh position={[0, -0.5, 0]} castShadow receiveShadow rotation={[0.1, 0.5, 0]}>
          <dodecahedronGeometry args={[3.5]} />
          <meshStandardMaterial color="#f5e4b3" roughness={1} flatShading />
        </mesh>
        {/* Bridge */}
        <mesh position={[5, 1.0, 0]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.2, 1]} />
          <meshStandardMaterial color="#bda07b" roughness={0.9} />
        </mesh>
        <mesh position={[5, -0.5, 0]} castShadow><boxGeometry args={[0.2, 3, 0.2]} /><meshStandardMaterial color="#8a6b4e" /></mesh>
        
        {/* Beach Umbrella */}
        <group position={[-1, 1.5, 0]} rotation={[0, 0, 0.2]}>
          <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.05, 0.05, 3]} /><meshStandardMaterial color="#d4d4d4" /></mesh>
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[2, 0.8, 12]} />
            <meshStandardMaterial color="#4fc3f7" flatShading />
          </mesh>
        </group>
      </group>

      {/* Dock and Tiny Purple Boat */}
      <group position={[6, -0.5, 9]} rotation={[0, Math.PI / 4.5, 0]}>
        {/* Dock Planks */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.2, 8]} />
          <meshStandardMaterial color="#cda67b" roughness={0.9} />
        </mesh>
        {/* Dock Posts */}
        <mesh position={[-0.8, 0.5, 3]} castShadow><cylinderGeometry args={[0.15, 0.15, 3]} /><meshStandardMaterial color="#8a6b4e" /></mesh>
        <mesh position={[0.8, 0.5, 3]} castShadow><cylinderGeometry args={[0.15, 0.15, 3]} /><meshStandardMaterial color="#8a6b4e" /></mesh>
        <mesh position={[-0.8, 0.5, -3]} castShadow><cylinderGeometry args={[0.15, 0.15, 3]} /><meshStandardMaterial color="#8a6b4e" /></mesh>
        <mesh position={[0.8, 0.5, -3]} castShadow><cylinderGeometry args={[0.15, 0.15, 3]} /><meshStandardMaterial color="#8a6b4e" /></mesh>
        
        {/* Purple Boat */}
        <group position={[2.5, 0.5, 2]} rotation={[0, -Math.PI/5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.8, 3.2]} />
            <meshStandardMaterial color="#8e3575" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow rotation={[0, 0, 0]}>
            <coneGeometry args={[1, 2.5, 3]} />
            <meshStandardMaterial color="#ffa726" roughness={0.8} flatShading />
          </mesh>
        </group>
      </group>

      {/* Palm Trees */}
      <PalmTree position={[5.5, 0.5, 2.0]} scale={1.1} rotation={[0, -0.6, 0]} />
      <PalmTree position={[7.0, 0.5, -0.5]} scale={0.8} rotation={[0, -1.2, 0]} />

    </Island>
  )
}

// ── Projects Island (Volcanic) ────────────────────────────────────────────

function ProjectsIsland() {
  return (
    <Island id="projects" position={[-20, 0, -250]} color="#d97b38" capColor="#88cc44" labelOffset={[0, 14, 0]}>
      {/* ── Terrain Extensions ── */}
      {/* Sandy beach on the front left */}
      <mesh position={[-5, -0.2, 5]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 0.8, 12]} />
        <meshStandardMaterial color="#f6d05f" roughness={1} flatShading />
      </mesh>

      {/* Rounded Rocks Clustering around the base */}
      {[
        [-8, -0.5, 2], [-7, 0, 6], [-3, -0.5, 8], [2, 0, 8], [6, -0.5, 6],
        [8, -0.5, 2], [7, 0, -3], [3, 0.5, -7], [-4, 0, -7], [-7, 0, -4]
      ].map(([x, y, z], i) => (
        <mesh key={`rock-${i}`} position={[x, y, z]} rotation={[Math.random(), Math.random(), 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.5 + Math.random()]} />
          <meshStandardMaterial color="#8a8e9e" roughness={0.8} flatShading />
        </mesh>
      ))}

      {/* ── Main Cottage ── */}
      <group position={[1.5, 1.0, 1]} rotation={[0, -Math.PI / 8, 0]}>
        
        {/* House Walls (Cream/White Plaster) */}
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.5, 3.2]} />
          <meshStandardMaterial color="#f2e7c9" roughness={0.9} />
        </mesh>

        {/* Wooden Corner Trims */}
        {[[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].map(([x, z], i) => (
          <mesh key={`trim-${i}`} position={[x, 1.25, z]} castShadow>
            <boxGeometry args={[0.2, 2.6, 0.2]} />
            <meshStandardMaterial color="#dfa863" />
          </mesh>
        ))}

        {/* Gable Roof (Red Tiles) */}
        {/* We use a box rotated by 45 degrees and sunk into the house */}
        <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2.5, 3.6]} />
          <meshStandardMaterial color="#e8554e" roughness={0.8} />
        </mesh>

        {/* Arched Door */}
        <group position={[0, 0, 1.61]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.0, 1.4, 0.1]} />
            <meshStandardMaterial color="#c28b5a" />
          </mesh>
          <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
            <meshStandardMaterial color="#c28b5a" />
          </mesh>
          {/* Door Handle */}
          <mesh position={[0.3, 0.7, 0.1]} castShadow>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        </group>

        {/* Side Window */}
        <group position={[1.61, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 1.0, 0.1]} />
            <meshStandardMaterial color="#aaddff" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Shutters */}
          <mesh position={[-0.6, 0, 0.05]} castShadow><boxGeometry args={[0.3, 1.0, 0.05]} /><meshStandardMaterial color="#dfa863" /></mesh>
          <mesh position={[0.6, 0, 0.05]} castShadow><boxGeometry args={[0.3, 1.0, 0.05]} /><meshStandardMaterial color="#dfa863" /></mesh>
        </group>

        {/* Chimney */}
        <group position={[0.8, 3.2, -0.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.8, 0.8]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 0.2, 1.0]} />
            <meshStandardMaterial color="#777777" />
          </mesh>
          {/* Cute Bubble Smoke */}
          {[...Array(5)].map((_, i) => (
            <mesh key={`smoke-${i}`} position={[0.2 + i * 0.3, 1.2 + i * 0.5, 0.2 - i * 0.2]} castShadow>
              <sphereGeometry args={[0.4 + Math.sin(i) * 0.1, 16, 16]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.9 - (i * 0.15)} />
            </mesh>
          ))}
        </group>

        {/* Blue Anchor decoration leaning on the wall */}
        <group position={[-1.2, 0.5, 1.7]} rotation={[0, 0.2, 0.3]}>
          {/* Shank */}
          <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.1, 1.0, 0.1]} /><meshStandardMaterial color="#1e7db0" /></mesh>
          {/* Stock */}
          <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[0.6, 0.1, 0.1]} /><meshStandardMaterial color="#1e7db0" /></mesh>
          {/* Arms (Torus half) */}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.4, 0.1, 8, 12, Math.PI]} />
            <meshStandardMaterial color="#1e7db0" />
          </mesh>
        </group>
      </group>

      {/* ── Environment Details ── */}

      {/* Stone Pathway */}
      {[
        [0.5, 0.42, 3], [0, 0.42, 4], [-0.8, 0.42, 4.8], [-1.8, 0.42, 5.2]
      ].map(([x, y, z], i) => (
        <mesh key={`path-${i}`} position={[x, y, z]} rotation={[0, Math.random(), 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      ))}

      {/* Wooden Fence along the grass edge */}
      <group position={[0, 0.6, 0]}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI + Math.PI / 6; // Semi-circle in front
          const x = Math.cos(angle) * 6;
          const z = Math.sin(angle) * 6;
          if (angle > Math.PI * 0.4 && angle < Math.PI * 0.6) return null; // Gap for the pathway
          return (
            <group key={`fence-${i}`} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh castShadow><boxGeometry args={[0.15, 0.8, 0.15]} /><meshStandardMaterial color="#dfa863" /></mesh>
              <mesh position={[0.6, 0.1, 0]} castShadow><boxGeometry args={[1.2, 0.1, 0.05]} /><meshStandardMaterial color="#dfa863" /></mesh>
              <mesh position={[0.6, -0.2, 0]} castShadow><boxGeometry args={[1.2, 0.1, 0.05]} /><meshStandardMaterial color="#dfa863" /></mesh>
            </group>
          )
        })}
      </group>

      {/* Grass Bushes */}
      {[
        [5, 0.6, 2], [6, 0.6, 0], [4, 0.6, -4], [-3, 0.6, -5]
      ].map(([x, y, z], i) => (
        <mesh key={`bush-${i}`} position={[x, y, z]} castShadow>
          <dodecahedronGeometry args={[0.6 + Math.random() * 0.4]} />
          <meshStandardMaterial color="#44aa44" flatShading />
        </mesh>
      ))}

      {/* Dock on the left */}
      <group position={[-5, 0.2, 3]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.2, 4]} />
          <meshStandardMaterial color="#dfa863" />
        </mesh>
        {/* Posts */}
        {[[-0.8, 1.5], [0.8, 1.5], [-0.8, -1.5], [0.8, -1.5]].map(([px, pz], i) => (
          <mesh key={`dpost-${i}`} position={[px, -0.5, pz]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1.5, 6]} />
            <meshStandardMaterial color="#a67142" />
          </mesh>
        ))}
        {/* Stairs from dock to grass */}
        <group position={[0, 0.5, 2.5]} rotation={[-0.4, 0, 0]}>
          <mesh position={[-0.8, 0, 0]} castShadow><boxGeometry args={[0.1, 2, 0.2]} /><meshStandardMaterial color="#dfa863" /></mesh>
          <mesh position={[0.8, 0, 0]} castShadow><boxGeometry args={[0.1, 2, 0.2]} /><meshStandardMaterial color="#dfa863" /></mesh>
          {[...Array(4)].map((_, i) => (
            <mesh key={`stair-${i}`} position={[0, -0.6 + i * 0.4, 0]} castShadow><boxGeometry args={[1.6, 0.1, 0.3]} /><meshStandardMaterial color="#dfa863" /></mesh>
          ))}
        </group>
        {/* Rowboat */}
        <group position={[-2, -0.4, 0]} rotation={[0, 0.2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.4, 2.8]} />
            <meshStandardMaterial color="#b5794d" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[1.0, 0.4, 2.6]} />
            <meshStandardMaterial color="#8a542a" />
          </mesh>
          {/* Boat Seats */}
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[1.1, 0.05, 0.4]} /><meshStandardMaterial color="#dfa863" /></mesh>
          <mesh position={[0, 0.3, -0.8]} castShadow><boxGeometry args={[1.1, 0.05, 0.4]} /><meshStandardMaterial color="#dfa863" /></mesh>
          {/* Oar */}
          <mesh position={[0.6, 0.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.5]} />
            <meshStandardMaterial color="#dddddd" />
          </mesh>
        </group>
      </group>

      {/* Lifebuoys */}
      <mesh position={[2, 0.5, 5.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.1, 8, 12]} />
        <meshStandardMaterial color="#e8554e" />
      </mesh>
      <mesh position={[-6.2, 0.4, 2.5]} rotation={[0, -0.4, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.3, 0.1, 8, 12]} />
        <meshStandardMaterial color="#e8554e" />
      </mesh>
    </Island>
  )
}

// ── Research Island ───────────────────────────────────────────────────────

function ResearchIsland() {
  return (
    <Island id="research" position={[80, 0, -200]} color="#f3ca76" capColor="#f3ca76" labelOffset={[0, 16, 0]}>
      {/* ── Environment Base ── */}
      {/* Large Mountain/Rock in the back */}
      <mesh position={[-3, 0, -6]} rotation={[0, 0.5, 0.1]} castShadow receiveShadow>
        <coneGeometry args={[6, 12, 6]} />
        <meshStandardMaterial color="#767070" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-7, -1, -3]} rotation={[0.2, 0, -0.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[4]} />
        <meshStandardMaterial color="#6a6566" roughness={0.9} flatShading />
      </mesh>

      {/* Grass Patch */}
      <mesh position={[-2, 0.55, -2]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 0.2, 12]} />
        <meshStandardMaterial color="#a8e64c" roughness={1} flatShading />
      </mesh>

      {/* Pebbles & Rocks */}
      {[
        [4, 0.5, 2], [5, 0.5, 1], [4.5, 0.5, 3],
        [-6, 0.5, 4], [-7, 0.5, 3.5], [-2, 0.5, 5]
      ].map(([x, y, z], i) => (
        <mesh key={`pebble-${i}`} position={[x, y, z]} rotation={[Math.random(), Math.random(), 0]} castShadow>
          <dodecahedronGeometry args={[0.3 + Math.random() * 0.3]} />
          <meshStandardMaterial color="#888888" flatShading />
        </mesh>
      ))}

      {/* Red Starfish */}
      <group position={[2.5, 0.55, 3]} rotation={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 5]} />
          <meshStandardMaterial color="#ea5b4c" flatShading />
        </mesh>
      </group>
      <group position={[-5, 0.55, 1]} rotation={[0, 1.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 5]} />
          <meshStandardMaterial color="#ea5b4c" flatShading />
        </mesh>
      </group>

      {/* Palm Trees on the Grass */}
      <PalmTree position={[-1, 0.6, -4]} scale={1.2} rotation={[0, 0.5, 0]} />
      <PalmTree position={[-4, 0.6, -1]} scale={1.0} rotation={[0, -0.8, 0]} />
      <PalmTree position={[2, 0.6, -2]} scale={0.9} rotation={[0, 1.5, 0]} />

      {/* ── Tiki Hut / Stilt House ── */}
      <group position={[1.5, 0.5, 2]} rotation={[0, Math.PI / 8, 0]}>
        {/* Stilts (4 thick wooden posts) */}
        {[
          [-1.8, -0.5, -1.3], [1.8, -0.5, -1.3],
          [-1.8, -0.5, 1.3], [1.8, -0.5, 1.3]
        ].map(([x, y, z], i) => (
          <mesh key={`stilt-${i}`} position={[x, y, z]} castShadow>
            <cylinderGeometry args={[0.2, 0.15, 2.5, 4]} />
            <meshStandardMaterial color="#bd7944" flatShading />
          </mesh>
        ))}

        {/* Wooden Deck Floor */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.3, 3.2]} />
          <meshStandardMaterial color="#bd7944" />
        </mesh>

        {/* Dark Wood Walls */}
        <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 2.3, 2.4]} />
          <meshStandardMaterial color="#684126" />
        </mesh>
        
        {/* Doorway (Black cutout) */}
        <mesh position={[-0.8, 2.0, 1.21]} castShadow>
          <boxGeometry args={[1.0, 1.7, 0.1]} />
          <meshStandardMaterial color="#1a110a" />
        </mesh>
        {/* Window (Black cutout) */}
        <mesh position={[1.81, 2.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.8, 1.0]} />
          <meshStandardMaterial color="#1a110a" />
        </mesh>

        {/* Door Awning */}
        <mesh position={[-0.8, 3.0, 1.5]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[1.4, 0.1, 0.8]} />
          <meshStandardMaterial color="#f4cc55" />
        </mesh>
        {/* Window Awning */}
        <mesh position={[2.1, 2.8, 0]} rotation={[0, 0, -0.4]} castShadow>
          <boxGeometry args={[0.8, 0.1, 1.4]} />
          <meshStandardMaterial color="#f4cc55" />
        </mesh>

        {/* Straw Roof */}
        <mesh position={[0, 4.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
          <coneGeometry args={[3.2, 2.4, 4]} />
          <meshStandardMaterial color="#f4cc55" flatShading />
        </mesh>

        {/* Ladder to the dock */}
        <group position={[-0.8, -0.1, 2.2]} rotation={[0.5, 0, 0]}>
          <mesh position={[-0.4, 0, 0]} castShadow><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#bd7944" /></mesh>
          <mesh position={[0.4, 0, 0]} castShadow><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#bd7944" /></mesh>
          {[...Array(4)].map((_, i) => (
            <mesh key={`rung-${i}`} position={[0, -0.8 + i * 0.5, 0]} castShadow><boxGeometry args={[0.8, 0.1, 0.1]} /><meshStandardMaterial color="#bd7944" /></mesh>
          ))}
        </group>
      </group>

      {/* ── Dock & Props ── */}
      <group position={[1.5, -0.2, 5]}>
        {/* Main Dock Platform */}
        <mesh position={[0, 0.5, 1]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 5]} />
          <meshStandardMaterial color="#c46e37" />
        </mesh>
        {/* L-Shape Extension */}
        <mesh position={[1.75, 0.5, 2.75]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 0.2, 1.5]} />
          <meshStandardMaterial color="#c46e37" />
        </mesh>

        {/* Dock Pylons */}
        {[
          [-0.6, 0.5, -1], [0.6, 0.5, -1],
          [-0.6, 0.5, 1.5],
          [-0.6, 0.5, 3.2],
          [3.2, 0.5, 2.2], [3.2, 0.5, 3.3]
        ].map(([x, y, z], i) => (
          <mesh key={`pylon-${i}`} position={[x, y, z]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 1.5, 6]} />
            <meshStandardMaterial color="#8a542a" />
          </mesh>
        ))}

        {/* Small Bucket on the dock */}
        <group position={[1.5, 0.7, 2.5]} rotation={[0, 0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.15, 0.35, 8]} />
            <meshStandardMaterial color="#889098" flatShading />
          </mesh>
          {/* Fish tail sticking out */}
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
            <coneGeometry args={[0.1, 0.3, 3]} />
            <meshStandardMaterial color="#4fc3f7" flatShading />
          </mesh>
        </group>

        {/* Fishing Rod */}
        <group position={[2.5, 0.7, 2.5]} rotation={[0, 0, 0]}>
          <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, -1.2]} castShadow>
            <cylinderGeometry args={[0.02, 0.04, 2, 4]} />
            <meshStandardMaterial color="#d89644" />
          </mesh>
          <mesh position={[1.4, 0.6, 0]} castShadow>
            <boxGeometry args={[0.01, 1.2, 0.01]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Tiny Rowboat Moored */}
        <group position={[-1.8, 0.2, 2.0]} rotation={[0, Math.PI / 8, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.4, 2.8]} />
            <meshStandardMaterial color="#b5794d" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[1.0, 0.4, 2.6]} />
            <meshStandardMaterial color="#8a542a" />
          </mesh>
          {/* Boat Seats */}
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[1.1, 0.05, 0.4]} /><meshStandardMaterial color="#c46e37" /></mesh>
          <mesh position={[0, 0.3, -0.8]} castShadow><boxGeometry args={[1.1, 0.05, 0.4]} /><meshStandardMaterial color="#c46e37" /></mesh>
          <mesh position={[0, 0.3, 0.8]} castShadow><boxGeometry args={[1.1, 0.05, 0.4]} /><meshStandardMaterial color="#c46e37" /></mesh>
        </group>
      </group>
    </Island>
  )
}

// ── Shipwreck — Experience ────────────────────────────────────────────────

function Shipwreck() {
  return (
    <Island id="wreck" position={[0, 0, -350]} color="#cbb592" capColor="#cbb592" labelOffset={[0, 16, 0]}>
      {/* ── Terrain Extensions ── */}
      {/* Dark Green Grass Patch */}
      <mesh position={[-4, 0.52, -2]} rotation={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 5, 0.1, 6]} />
        <meshStandardMaterial color="#295c37" flatShading />
      </mesh>

      {/* Rocks */}
      <mesh position={[-2, 0.5, -5]} rotation={[0.4, 0.1, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.5]} />
        <meshStandardMaterial color="#6e737b" flatShading />
      </mesh>
      <mesh position={[5, 0.5, -6]} rotation={[0, 0.5, 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2]} />
        <meshStandardMaterial color="#6e737b" flatShading />
      </mesh>

      {/* Spiky Plants on the grass */}
      {[...Array(8)].map((_, i) => (
        <group key={`plant-${i}`} position={[-4 + (Math.random() - 0.5) * 6, 0.5, -2 + (Math.random() - 0.5) * 6]} rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.4]} castShadow><coneGeometry args={[0.1, 0.8, 3]} /><meshStandardMaterial color="#1f4228" /></mesh>
          <mesh position={[0.1, 0.25, 0]} rotation={[0.2, 0, -0.4]} castShadow><coneGeometry args={[0.1, 0.6, 3]} /><meshStandardMaterial color="#1f4228" /></mesh>
          <mesh position={[-0.1, 0.2, 0.1]} rotation={[-0.3, 0, 0]} castShadow><coneGeometry args={[0.1, 0.5, 3]} /><meshStandardMaterial color="#1f4228" /></mesh>
        </group>
      ))}

      {/* ── Broken Shipwreck ── */}
      
      {/* Front Half (Bow) - Tilted steeply up */}
      <group position={[-2.5, 2.5, -3]} rotation={[0.8, 0.3, 0.1]}>
        {/* Hull Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2.5, 5]} />
          <meshStandardMaterial color="#8c664b" />
        </mesh>
        {/* Pointed Bow */}
        <mesh position={[0, 0, 3.5]} rotation={[Math.PI / 2, Math.PI / 4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0, 2.12, 2, 4]} />
          <meshStandardMaterial color="#8c664b" />
        </mesh>
        {/* Deck gap showing interior */}
        <mesh position={[0, 1.3, -1]} castShadow>
          <boxGeometry args={[2.8, 0.1, 2]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 4, 1]} rotation={[-0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 8, 6]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
        {/* Crossbeam */}
        <mesh position={[0, 6, 1.5]} rotation={[-0.2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 5, 4]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
        {/* Tattered Sail */}
        <mesh position={[0, 4.5, 2]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[4.5, 4, 0.05]} />
          <meshStandardMaterial color="#c4c6ca" />
        </mesh>
      </group>

      {/* Back Half (Stern) - Sitting mostly flat */}
      <group position={[3.5, 0.8, -3.5]} rotation={[0, -0.4, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 2, 5]} />
          <meshStandardMaterial color="#8c664b" />
        </mesh>
        <mesh position={[0, 1.5, -1.5]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1, 2]} />
          <meshStandardMaterial color="#8c664b" />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 8, 6]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
        {/* Crossbeam */}
        <mesh position={[0, 6, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 4, 4]} />
          <meshStandardMaterial color="#5a3d2b" />
        </mesh>
        {/* Tattered Sail */}
        <mesh position={[0.8, 4, 0.2]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[3, 4, 0.05]} />
          <meshStandardMaterial color="#c4c6ca" />
        </mesh>
      </group>

      {/* ── Boardwalk Camp ── */}
      <group position={[0, 0.8, 2]}>
        {/* Main Platform */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 0.2, 5]} />
          <meshStandardMaterial color="#b38b6d" />
        </mesh>
        
        {/* Stilts supporting the dock */}
        {[
          [-3.8, -2.3], [3.8, -2.3], [-3.8, 2.3], [3.8, 2.3], [0, -2.3], [0, 2.3]
        ].map(([px, pz], i) => (
          <mesh key={`stilt-${i}`} position={[px, -0.8, pz]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 6]} />
            <meshStandardMaterial color="#5a3d2b" />
          </mesh>
        ))}

        {/* Ramp Down Left */}
        <mesh position={[-4.5, -0.3, 0]} rotation={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[2, 0.2, 1.5]} />
          <meshStandardMaterial color="#b38b6d" />
        </mesh>
        {/* Ramp Down Front */}
        <mesh position={[0, -0.4, 3]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 0.2, 2.5]} />
          <meshStandardMaterial color="#b38b6d" />
        </mesh>

        {/* Watchtower */}
        <group position={[-2.8, 1, -1.5]}>
          {/* 3 Poles */}
          <mesh position={[-0.4, 1.5, -0.4]} rotation={[0.05, 0, -0.05]} castShadow><cylinderGeometry args={[0.05, 0.05, 3.5, 4]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          <mesh position={[0.4, 1.5, -0.4]} rotation={[0.05, 0, 0.05]} castShadow><cylinderGeometry args={[0.05, 0.05, 3.5, 4]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          <mesh position={[0, 1.5, 0.5]} rotation={[-0.05, 0, 0]} castShadow><cylinderGeometry args={[0.05, 0.05, 3.5, 4]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          {/* Platform */}
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.2, 8]} />
            <meshStandardMaterial color="#b38b6d" />
          </mesh>
          {/* Railing */}
          <mesh position={[0, 3.3, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.4, 8]} />
            <meshStandardMaterial color="#b38b6d" wireframe />
          </mesh>
          {/* Black Flag */}
          <mesh position={[0, 4, 0]} castShadow><cylinderGeometry args={[0.03, 0.03, 2]} /><meshStandardMaterial color="#111" /></mesh>
          <mesh position={[0.5, 4.6, 0]} castShadow><boxGeometry args={[1.0, 0.6, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
        </group>

        {/* Props (Barrels, Crates, Sacks) */}
        <group position={[-0.5, 0.1, -1.5]}>
          {/* Barrels */}
          <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.8, 8]} /><meshStandardMaterial color="#8c664b" /></mesh>
          <mesh position={[0.8, 0.4, -0.2]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.8, 8]} /><meshStandardMaterial color="#8c664b" /></mesh>
          {/* Crates */}
          <mesh position={[-1.2, 0.4, 0.2]} castShadow><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#9c7556" /></mesh>
          <mesh position={[-1.2, 1.2, 0.2]} rotation={[0, 0.3, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color="#9c7556" /></mesh>
          <mesh position={[-2.2, 0.3, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color="#9c7556" /></mesh>
          {/* Sacks */}
          <mesh position={[1.6, 0.2, 0.2]} castShadow><dodecahedronGeometry args={[0.3]} /><meshStandardMaterial color="#e0dcc7" /></mesh>
          <mesh position={[2.0, 0.2, 0.4]} castShadow><dodecahedronGeometry args={[0.25]} /><meshStandardMaterial color="#e0dcc7" /></mesh>
        </group>

        {/* Canopy & Cannon */}
        <group position={[2.5, 0.1, 1.5]}>
          {/* White Canvas Roof */}
          <mesh position={[0, 1.4, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 0.1, 2.2]} />
            <meshStandardMaterial color="#e0dcc7" />
          </mesh>
          {/* Canopy Posts */}
          <mesh position={[-0.9, 0.7, -0.9]} castShadow><cylinderGeometry args={[0.05, 0.05, 1.4]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          <mesh position={[0.9, 0.7, -0.9]} castShadow><cylinderGeometry args={[0.05, 0.05, 1.4]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          <mesh position={[-0.9, 0.6, 0.9]} castShadow><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          <mesh position={[0.9, 0.6, 0.9]} castShadow><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
          {/* Cannon */}
          <mesh position={[0, 0.4, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 1.4, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.8, 0.4, 1.0]} />
            <meshStandardMaterial color="#5a3d2b" />
          </mesh>
        </group>
      </group>
    </Island>
  )
}

// ── Treasure Chest — Achievements ────────────────────────────────────────

function TreasureIsland() {
  const chestRef = useRef<THREE.Group>(null!)
  const sharksRef = useRef<THREE.Group>(null!)
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (chestRef.current) {
      chestRef.current.rotation.y = Math.sin(t * 0.5) * 0.15
    }
    if (sharksRef.current) {
      sharksRef.current.rotation.y = t * 0.3 // Sharks circle the island
    }
  })

  return (
    <Island id="treasure" position={[-120, 0, -300]} color="#d9e68c" capColor="#d9e68c" labelOffset={[0, 16, 0]}>
      {/* Tall Palm Tree behind the chest */}
      <PalmTree position={[0, 0.9, -2]} scale={1.3} rotation={[0, 1.5, 0]} />

      {/* Rocks */}
      {[
        [3, 0.5, -1], [4, -0.5, 4], [2, 0.5, 3],
        [-3, 0.5, 2], [-4, -0.5, -2], [-2, 0.5, -4]
      ].map(([x, y, z], i) => (
        <mesh key={`rock-${i}`} position={[x, y, z]} rotation={[Math.random(), Math.random(), 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.8 + Math.random() * 0.5]} />
          <meshStandardMaterial color="#8a8e9e" flatShading />
        </mesh>
      ))}

      {/* Tiny Red Crab */}
      <group position={[-2, 1.0, 0]} rotation={[0, -0.5, 0]}>
        <mesh castShadow><boxGeometry args={[0.3, 0.15, 0.2]} /><meshStandardMaterial color="#ff3333" /></mesh>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.5]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.3]} /><meshStandardMaterial color="#ff3333" /></mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.5]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.3]} /><meshStandardMaterial color="#ff3333" /></mesh>
      </group>

      {/* Coconuts & Shovel */}
      <mesh position={[-1.2, 1.0, 0.5]} castShadow><dodecahedronGeometry args={[0.15]} /><meshStandardMaterial color="#6a4b35" /></mesh>
      <mesh position={[-1.0, 1.0, 0.7]} castShadow><dodecahedronGeometry args={[0.12]} /><meshStandardMaterial color="#6a4b35" /></mesh>
      
      <group position={[1.5, 1.5, 0.5]} rotation={[0.4, 0.2, 0.3]}>
        <mesh position={[0, -0.8, 0]} castShadow><boxGeometry args={[0.3, 0.4, 0.05]} /><meshStandardMaterial color="#888888" /></mesh>
        <mesh castShadow><cylinderGeometry args={[0.03, 0.03, 1.6]} /><meshStandardMaterial color="#bd7944" /></mesh>
        <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[0.2, 0.05, 0.05]} /><meshStandardMaterial color="#bd7944" /></mesh>
      </group>

      {/* Rowboat pulled up on the beach */}
      <group position={[1, 0, 5]} rotation={[-0.1, -0.4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.6, 3.2]} />
          <meshStandardMaterial color="#9c6d42" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.4, 0.6, 3.0]} />
          <meshStandardMaterial color="#8a542a" />
        </mesh>
        {/* Seats */}
        <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[1.5, 0.1, 0.5]} /><meshStandardMaterial color="#9c6d42" /></mesh>
        <mesh position={[0, 0.3, -0.8]} castShadow><boxGeometry args={[1.5, 0.1, 0.5]} /><meshStandardMaterial color="#9c6d42" /></mesh>
        <mesh position={[0, 0.3, 0.8]} castShadow><boxGeometry args={[1.5, 0.1, 0.5]} /><meshStandardMaterial color="#9c6d42" /></mesh>
        {/* Oars crossed inside */}
        <group position={[0, 0.4, 0]} rotation={[0, 0.4, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.03, 0.03, 2]} /><meshStandardMaterial color="#d4b48c" /></mesh>
          <mesh position={[0, 0, -0.9]} castShadow><boxGeometry args={[0.15, 0.02, 0.4]} /><meshStandardMaterial color="#d4b48c" /></mesh>
        </group>
        <group position={[0, 0.45, 0]} rotation={[0, -0.4, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.03, 0.03, 2]} /><meshStandardMaterial color="#d4b48c" /></mesh>
          <mesh position={[0, 0, -0.9]} castShadow><boxGeometry args={[0.15, 0.02, 0.4]} /><meshStandardMaterial color="#d4b48c" /></mesh>
        </group>
      </group>

      {/* Animated Treasure Chest */}
      <group ref={chestRef} position={[0, 1.5, 0]}>
        {/* Chest body */}
        <mesh castShadow>
          <boxGeometry args={[2.0, 1.2, 1.4]} />
          <meshStandardMaterial color="#6a4b35" roughness={0.9} />
        </mesh>
        {/* Gold inside */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.8, 0.3, 1.2]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} />
        </mesh>
        {/* Open Lid (hinged at the back) */}
        <group position={[0, 0.6, -0.7]} rotation={[-Math.PI / 2.5, 0, 0]}>
          <mesh position={[0, 0.3, 0.7]} castShadow>
            <boxGeometry args={[2.0, 0.6, 1.4]} />
            <meshStandardMaterial color="#6a4b35" roughness={0.9} />
          </mesh>
        </group>
        {/* Glow */}
        <pointLight position={[0, 1.0, 0]} color="#ffd700" intensity={2.5} distance={15} />
      </group>

      {/* Circling Sharks */}
      <group ref={sharksRef}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
          <group key={`shark-${i}`} rotation={[0, angle, 0]}>
            {/* Fin pushing out of the water */}
            <mesh position={[8, -0.5, 0]} rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.2, 0.8, 3]} />
              <meshStandardMaterial color="#555555" flatShading />
            </mesh>
          </group>
        ))}
      </group>

    </Island>
  )
}

// ── Horizon — Contact ────────────────────────────────────────────────────

function HorizonIsland() {
  return (
    <Island id="horizon" position={[0, 0, -500]} color="#7090c0">
      {/* Archway */}
      <mesh castShadow position={[-1.5, 3, 0]}>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial color="#e8e0f0" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[1.5, 3, 0]}>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial color="#e8e0f0" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 6.3, 0]}>
        <boxGeometry args={[3.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#e8e0f0" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 5, 2]} color="#a0c0ff" intensity={2} distance={30} />
    </Island>
  )
}

// ── Secret Area ──────────────────────────────────────────────────────────

function SecretArea() {
  return (
    <Island id="secret" position={[150, 0, -180]} color="#507050">
      {/* Mysterious stone circle */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} castShadow position={[Math.cos(angle) * 5, 2, Math.sin(angle) * 5]}>
            <boxGeometry args={[0.8, 4, 0.8]} />
            <meshStandardMaterial color="#606070" roughness={0.9} />
          </mesh>
        )
      })}
      <pointLight position={[0, 3, 0]} color="#8040ff" intensity={2} distance={25} />
    </Island>
  )
}

// ── All Islands exported as one component ────────────────────────────────

export function Islands() {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group name="map-collision-root">
        <Harbor />
        <Lighthouse />
        <SkillsIsland />
        <ProjectsIsland />
        <ResearchIsland />
        <Shipwreck />
        <TreasureIsland />
        <HorizonIsland />
        <SecretArea />
      </group>
    </RigidBody>
  )
}

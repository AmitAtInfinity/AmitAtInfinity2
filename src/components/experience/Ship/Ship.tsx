import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useInputSystem } from '../../../systems/Input/InputSystem'
import { useGameStore } from '../../../systems/gameStore'

// Ship physics constants
const ACCELERATION    = 14                           // units/s²
const MAX_SPEED       = 20                           // units/s
const BOOST_MAX_SPEED = 35                           // units/s
const DRAG            = 4                            // damping coefficient
const TURN_SPEED      = 1.4                          // rad/s
const TURN_INERTIA    = 6                            // smoothing factor for steering

// Wave bobbing — matches ocean shader parameters
const BOB_AMPLITUDE   = 0.25
const BOB_FREQUENCY   = 0.75

const jibGeometry = new THREE.BufferGeometry();
jibGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
  0, 2.9, 0.0,      // 0: Top (Head - attached to Foremast top)
  0, -0.1, -3.8,    // 1: Front (Tack - attached to Bow tip)
  0, 0.5, -1.0,     // 2: Back (Clew - lower back corner)
]), 3));
jibGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
  0.5, 1.0,         // Top
  0.0, 0.0,         // Front Bottom
  1.0, 0.0          // Back Bottom
]), 2));
jibGeometry.setIndex([
  0, 1, 2 // Single flat triangle face (material side=2 handles backface)
]);
jibGeometry.computeVertexNormals();

function ShipMesh({ 
  wheelRef,
  sailRefs 
}: { 
  wheelRef: React.RefObject<THREE.Group>
  sailRefs: React.RefObject<THREE.Group>[] 
}) {
  const HULL = "#c27b57" // Warm orange-brown wood
  const TRIM = "#f0f0f0" // White
  const DECK = "#d4a373" // Lighter wood deck
  const MAST = "#d4a373" 
  const SAIL = "#363636" // Charcoal grey (lighter pirate black)
  const CANNON = "#111111" // Black
  const ANCHOR = "#a3a9b0" // Silver
  const DARK_WOOD = "#5c3a21" // Doors, barrels

  // Seamless Ship Hull Shapes (Perfectly matched to railings)
  const shipShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.9, 3.4);  // Stern Left
    s.lineTo(1.9, 3.4);   // Stern Right
    s.lineTo(1.9, -3.3);  // Bow Start Right
    s.lineTo(0, -6.4);    // Bow Tip
    s.lineTo(-1.9, -3.3); // Bow Start Left
    s.closePath();
    return s;
  }, []);

  const trimShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.0, 3.5);  
    s.lineTo(2.0, 3.5);   
    s.lineTo(2.0, -3.3);  
    s.lineTo(0, -6.6);    
    s.lineTo(-2.0, -3.3); 
    s.closePath();
    return s;
  }, []);

  const lowerHullShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, 3.2);  
    s.lineTo(1.6, 3.2);   
    s.lineTo(1.6, -3.1);  
    s.lineTo(0, -5.8);    
    s.lineTo(-1.6, -3.1); 
    s.closePath();
    return s;
  }, []);

  const cabinShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.9, 3.6); 
    s.lineTo(1.9, 3.6);  
    s.lineTo(1.9, 0.9);  
    s.lineTo(-1.9, 0.9); 
    s.closePath();
    return s;
  }, []);

  const cabinTrimShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.0, 3.7);
    s.lineTo(2.0, 3.7);
    s.lineTo(2.0, 0.8);
    s.lineTo(-2.0, 0.8);
    s.closePath();
    return s;
  }, []);

  const extrudeHull = useMemo(() => ({ depth: 1.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }), []);
  const extrudeLower = useMemo(() => ({ depth: 1.0, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 }), []);
  const extrudeTrim = useMemo(() => ({ depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }), []);
  const extrudeDeck = useMemo(() => ({ depth: 0.3, bevelEnabled: false }), []);

  const flagGeometryRef = useRef<THREE.PlaneGeometry>(null!)
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const speed = useGameStore.getState().shipSpeed || 0
    
    // Animate Flag Vertices
    if (flagGeometryRef.current) {
      // Slower, heavier flutter
      const waveSpeed = 3 + Math.abs(speed) * 0.5
      // More amplitude (folds)
      const waveAmp = 0.15 + (Math.abs(speed) / 20) * 0.2
      
      const pos = flagGeometryRef.current.attributes.position
      const uvs = flagGeometryRef.current.attributes.uv
      
      for (let i = 0; i < pos.count; i++) {
        const u = uvs.getX(i) 
        
        // u * 12 gives more folds across the flag's length
        const z = Math.sin(u * 12 - t * waveSpeed) * waveAmp * Math.pow(u, 0.8)
        
        const baseX = (u - 0.5) * 1.2 
        const scrunchX = baseX - (Math.abs(z) * 0.5)
        
        pos.setZ(i, z)
        pos.setX(i, scrunchX)
      }
      pos.needsUpdate = true
      flagGeometryRef.current.computeVertexNormals()
    }
  })

  // ── Procedural Flag Texture (So text bends with cloth) ──
  const flagTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = '#111111' // Dark color
    ctx.fillRect(0, 0, 512, 256)
    
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Infinity Symbol
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText('∞', 256, 85)
    
    // Name
    ctx.font = 'bold 80px sans-serif'
    ctx.fillText('AMIT', 256, 175)

    // Erase ragged tears along the edges to physically cut the geometry
    ctx.globalCompositeOperation = 'destination-out'
    
    // Right Edge (Continuous frayed and torn edge)
    ctx.beginPath()
    ctx.moveTo(512, 0)
    for (let y = 0; y <= 256; y += 12) {
      let depth = Math.random() * 40 + 10
      
      // Occasional deep middle tear
      if (y > 80 && y < 150) {
        depth += Math.random() * 60
      }
      // Heavy tear at the bottom right
      if (y > 180) {
        depth += Math.random() * 80 + (y - 180) * 1.8 // Progressively deeper towards the bottom
      }
      
      ctx.lineTo(512 - depth, y + (Math.random() - 0.5) * 8)
    }
    ctx.lineTo(512, 256)
    ctx.lineTo(512, 0)
    ctx.fill()
    
    // Top Edge (Continuous shallow fray)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let x = 0; x <= 512; x += 20) {
      const depth = Math.random() * 15 + 2
      ctx.lineTo(x + (Math.random() - 0.5) * 10, depth)
    }
    ctx.lineTo(512, 0)
    ctx.fill()

    // Bottom Edge (Continuous shallow fray)
    ctx.beginPath()
    ctx.moveTo(0, 256)
    for (let x = 0; x <= 512; x += 20) {
      const depth = Math.random() * 15 + 2
      ctx.lineTo(x + (Math.random() - 0.5) * 10, 256 - depth)
    }
    ctx.lineTo(512, 256)
    ctx.fill()

    // Interior worn holes near the torn edge
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.arc(380 + Math.random() * 80, Math.random() * 256, Math.random() * 10 + 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'source-over'
    
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])

  // ── Procedural Sail Texture (Wear & Tear) ──
  const sailTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    
    // Fill base color
    ctx.fillStyle = SAIL
    ctx.fillRect(0, 0, 1024, 1024)
    
    // 1. Woven fabric texture lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    for (let i = 0; i < 1024; i += 4) {
      if (Math.random() > 0.3) ctx.fillRect(i, 0, 1, 1024)
      if (Math.random() > 0.3) ctx.fillRect(0, i, 1024, 1)
    }

    // 2. Grime and dirt
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(15, 15, 15, ${Math.random() * 0.4})`
      ctx.beginPath()
      ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 60 + 10, 0, Math.PI * 2)
      ctx.fill()
    }

    // 3. Patches / Stitches
    for (let p = 0; p < 8; p++) {
      const px = Math.random() * 800 + 100
      const py = Math.random() * 800 + 100
      const pw = Math.random() * 80 + 40
      const ph = Math.random() * 80 + 40
      ctx.fillStyle = '#2c2c2c' // darker patch
      ctx.fillRect(px, py, pw, ph)
      
      // Stitching along borders
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 3
      for (let x = 0; x < pw; x += 15) {
        ctx.beginPath(); ctx.moveTo(px + x, py - 5); ctx.lineTo(px + x, py + 5); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(px + x, py + ph - 5); ctx.lineTo(px + x, py + ph + 5); ctx.stroke()
      }
      for (let y = 0; y < ph; y += 15) {
        ctx.beginPath(); ctx.moveTo(px - 5, py + y); ctx.lineTo(px + 5, py + y); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(px + pw - 5, py + y); ctx.lineTo(px + pw + 5, py + y); ctx.stroke()
      }
    }

    // 4. Tears (Transparent holes)
    for (let t = 0; t < 10; t++) {
      const tx = Math.random() * 800 + 100
      const ty = Math.random() * 800 + 100
      ctx.globalCompositeOperation = 'destination-out' // Punch holes
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      for(let i = 0; i < 6; i++) {
         ctx.lineTo(tx + (Math.random() - 0.5) * 80, ty + (Math.random() - 0.5) * 150)
      }
      ctx.closePath()
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    const map = new THREE.CanvasTexture(canvas)
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    return map
  }, [])

  return (
    // Bow is built at local -Z, which is the forward travel direction
    <group scale={[0.6, 0.6, 0.6]}>

      {/* ══ 1. HULL STRUCTURE (Seamless Extruded) ════════════════════════ */}
      {/* Lower Hull Base (tapered bottom) */}
      <mesh castShadow receiveShadow position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[lowerHullShape, extrudeLower]} />
        <meshStandardMaterial color={HULL} roughness={0.8} />
      </mesh>
      {/* Main Hull Middle */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shipShape, extrudeHull]} />
        <meshStandardMaterial color={HULL} roughness={0.8} />
      </mesh>

      {/* ══ 2. TRIM & DECK (Seamless Extruded) ═══════════════════════════ */}
      {/* Main Trim (White Rail) */}
      <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[trimShape, extrudeTrim]} />
        <meshStandardMaterial color={TRIM} roughness={0.7} />
      </mesh>
      {/* Main Deck (Wood inside trim) */}
      <mesh receiveShadow position={[0, 1.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shipShape, extrudeDeck]} />
        <meshStandardMaterial color={DECK} roughness={0.9} />
      </mesh>

      {/* ══ 4. RAILINGS (Main Deck & Bow) ════════════════════════════════ */}
      <group position={[0, 1.6, 0]}>
        {/* Main Deck Side Ropes */}
        <mesh position={[-1.9, 0.35, -1.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 4.2, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        <mesh position={[1.9, 0.35, -1.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 4.2, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        {/* Main Deck Posts */}
        {[-3.3, -2.25, -1.2, -0.15, 0.9].map((z, i) => (
          <group key={`post_${i}`}>
            <mesh position={[-1.9, 0.1, z]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
            <mesh position={[1.9, 0.1, z]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
          </group>
        ))}
        {/* Bow Angled Ropes */}
        <group position={[-0.95, 0.35, -4.85]} rotation={[0, -0.549, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 3.636, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        </group>
        <group position={[0.95, 0.35, -4.85]} rotation={[0, 0.549, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 3.636, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        </group>
        {/* Bow Posts */}
        <mesh position={[-0.95, 0.1, -4.85]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
        <mesh position={[0.95, 0.1, -4.85]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
        <mesh position={[0, 0.1, -6.4]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
      </group>

      {/* ══ 3. STERN CABIN (Raised Back) ═══════════════════════════════ */}
      {/* Cabin Hull */}
      <mesh castShadow receiveShadow position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[cabinShape, extrudeHull]} />
        <meshStandardMaterial color={HULL} roughness={0.8} />
      </mesh>
      {/* Cabin Trim */}
      <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[cabinTrimShape, extrudeTrim]} />
        <meshStandardMaterial color={TRIM} roughness={0.7} />
      </mesh>
      {/* Cabin Deck */}
      <mesh receiveShadow position={[0, 3.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[cabinShape, extrudeDeck]} />
        <meshStandardMaterial color={DECK} roughness={0.9} />
      </mesh>
      {/* Cabin Door */}
      <mesh position={[0, 2.2, 0.99]}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.9} />
      </mesh>

      {/* Quarterdeck Railings */}
      <group position={[0, 3.11, 2.25]}>
        {/* Left/Right Side Ropes */}
        <mesh position={[-1.9, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 2.7, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        <mesh position={[1.9, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 2.7, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        {/* Back Rope */}
        <mesh position={[0, 0.5, 1.35]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 3.8, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
        {/* Side Posts */}
        {[-1.35, -0.45, 0.45, 1.35].map((z, i) => (
          <group key={`qd_post_side_${i}`}>
            <mesh position={[-1.9, 0.25, z]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
            <mesh position={[1.9, 0.25, z]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
          </group>
        ))}
        {/* Back Posts */}
        {[-1.2, 0, 1.2].map((x, i) => (
          <mesh key={`qd_post_back_${i}`} position={[x, 0.25, 1.35]}><cylinderGeometry args={[0.05, 0.05, 0.5, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
        ))}
      </group>

      {/* Steering Wheel (Helm) */}
      <group position={[0, 3.11, 1.4]}>
        {/* Helm Stand */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color={DARK_WOOD} roughness={0.9} />
        </mesh>
        {/* Wheel Hub & Rim */}
        <group position={[0, 0.6, 0.2]} ref={wheelRef}>
          {/* Axle (Horizontal, along Z) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
            <meshStandardMaterial color={"#3a2415"} roughness={0.9} />
          </mesh>
          {/* Wheel Rim (Vertical, in XY plane) */}
          <mesh castShadow>
            <torusGeometry args={[0.35, 0.03, 8, 24]} />
            <meshStandardMaterial color={"#2d1a0d"} roughness={0.9} />
          </mesh>
          {/* Wheel Spokes (Vertical, in XY plane) */}
          <mesh castShadow><cylinderGeometry args={[0.02, 0.02, 1.0, 8]} /><meshStandardMaterial color={"#a67c52"} roughness={0.9} /></mesh>
          <mesh castShadow rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.02, 0.02, 1.0, 8]} /><meshStandardMaterial color={"#a67c52"} roughness={0.9} /></mesh>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 1.0, 8]} /><meshStandardMaterial color={"#a67c52"} roughness={0.9} /></mesh>
          <mesh castShadow rotation={[0, 0, Math.PI * 0.75]}><cylinderGeometry args={[0.02, 0.02, 1.0, 8]} /><meshStandardMaterial color={"#a67c52"} roughness={0.9} /></mesh>
        </group>
      </group>

      {/* ══ 4. CANNONS ═════════════════════════════════════════════════ */}
      {/* Right (Starboard) Cannons */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <group key={`cannon_r_${i}`} position={[1.9, 0.6, z]}>
          <mesh><boxGeometry args={[0.2, 1.0, 1.0]} /><meshStandardMaterial color={TRIM} roughness={0.8} /></mesh>
          <mesh><boxGeometry args={[0.22, 0.6, 0.6]} /><meshStandardMaterial color={CANNON} roughness={1.0} /></mesh>
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.2, 0.7, 12]} />
            <meshStandardMaterial color={CANNON} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Left (Port) Cannons */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <group key={`cannon_l_${i}`} position={[-1.9, 0.6, z]}>
          <mesh><boxGeometry args={[0.2, 1.0, 1.0]} /><meshStandardMaterial color={TRIM} roughness={0.8} /></mesh>
          <mesh><boxGeometry args={[0.22, 0.6, 0.6]} /><meshStandardMaterial color={CANNON} roughness={1.0} /></mesh>
          <mesh position={[-0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.2, 0.7, 12]} />
            <meshStandardMaterial color={CANNON} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ══ 5. MASTS & SAILS ═══════════════════════════════════════════ */}
      {/* Foremast (Front) */}
      <group position={[0, 1.6, -2.5]}>
        <mesh castShadow position={[0, 1.75, 0]}><cylinderGeometry args={[0.1, 0.1, 3.5, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        {/* Top Yard */}
        <mesh castShadow position={[0, 3.0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 2.5, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        {/* Bottom Yard */}
        <mesh castShadow position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 2.5, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        {/* Curvy Sail */}
        <group position={[0, 2.1, 0]} rotation={[0, 0, 0]} ref={sailRefs[0]}>
          <mesh castShadow position={[0, 0, 1.65]}>
            <cylinderGeometry args={[2.0, 2.0, 1.8, 16, 1, true, 2.54, 1.2]} />
            <meshStandardMaterial map={sailTexture} roughness={0.9} side={2} alphaTest={0.5} />
          </mesh>
        </group>
        {/* Jib Sail (Billowing Triangle) */}
        <mesh castShadow geometry={jibGeometry}>
          <meshStandardMaterial map={sailTexture} roughness={0.9} side={2} alphaTest={0.5} />
        </mesh>
      </group>

      {/* Jib Sail (Front Rope) */}
      <group position={[0, 3.0, -4.4]} rotation={[0.90, 0, 0]}>
        {/* Rope */}
        <mesh><cylinderGeometry args={[0.02, 0.02, 4.84, 8]} /><meshStandardMaterial color={"#d4c2a5"} roughness={0.9} /></mesh>
      </group>

      {/* Mainmast (Center) */}
      <group position={[0, 1.6, 0.0]}>
        <mesh castShadow position={[0, 3.5, 0]}><cylinderGeometry args={[0.15, 0.15, 7.0, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        
        {/* Lower Sail Yards */}
        <mesh castShadow position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 3.8, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        <mesh castShadow position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 3.8, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        
        {/* Upper Sail Yards */}
        <mesh castShadow position={[0, 5.9, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 2.8, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        <mesh castShadow position={[0, 4.1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 2.8, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        
        {/* Lower Curvy Sail */}
        <group position={[0, 2.6, 0]} rotation={[0, 0, 0]} ref={sailRefs[1]}>
          <mesh castShadow position={[0, 0, 2.47]}>
            <cylinderGeometry args={[3.0, 3.0, 2.4, 16, 1, true, 2.54, 1.2]} />
            <meshStandardMaterial map={sailTexture} roughness={0.9} side={2} alphaTest={0.5} />
          </mesh>
        </group>
        
        {/* Upper Curvy Sail */}
        <group position={[0, 5.0, 0]} rotation={[0, 0, 0]} ref={sailRefs[2]}>
          <mesh castShadow position={[0, 0, 1.6]}>
            <cylinderGeometry args={[2.0, 2.0, 1.8, 16, 1, true, 2.50, 1.28]} />
            <meshStandardMaterial map={sailTexture} roughness={0.9} side={2} alphaTest={0.5} />
          </mesh>
        </group>

        {/* Crow's Nest */}
        <group position={[0, 7.1, 0]}>
          <mesh><cylinderGeometry args={[0.6, 0.4, 0.6, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
          <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.5, 0.3, 0.6, 8]} /><meshStandardMaterial color={DARK_WOOD} roughness={0.9} /></mesh>
        </group>
        
        {/* Mast Tip & Flag */}
        <mesh position={[0, 7.9, 0]}><cylinderGeometry args={[0.05, 0.05, 1.0, 8]} /><meshStandardMaterial color={MAST} roughness={0.8} /></mesh>
        
        {/* Animated Wavy Flag */}
        <mesh position={[0.6, 8.2, 0]}>
          <planeGeometry ref={flagGeometryRef} args={[1.2, 0.6, 15, 2]} />
          <meshStandardMaterial map={flagTexture} side={THREE.DoubleSide} roughness={0.7} transparent alphaTest={0.5} />
        </mesh>
      </group>

      {/* ══ 6. ANCHOR & PROPS ══════════════════════════════════════════ */}
      {/* Anchor (Port-Stern) */}
      <group position={[-1.9, 1.0, 3.0]}>
        <mesh position={[0, 0.6, 0]}><torusGeometry args={[0.15, 0.04, 8, 16]} /><meshStandardMaterial color={ANCHOR} roughness={0.5} metalness={0.7} /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 1.2, 8]} /><meshStandardMaterial color={ANCHOR} roughness={0.5} metalness={0.7} /></mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color={ANCHOR} roughness={0.5} metalness={0.7} /></mesh>
        <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}><cylinderGeometry args={[0.06, 0.02, 0.6, 8]} /><meshStandardMaterial color={ANCHOR} roughness={0.5} metalness={0.7} /></mesh>
        <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.06, 0.02, 0.6, 8]} /><meshStandardMaterial color={ANCHOR} roughness={0.5} metalness={0.7} /></mesh>
      </group>

      {/* Barrel on Deck */}
      <mesh castShadow position={[-0.8, 3.5, 2.5]}>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.9} />
      </mesh>

    </group>
  )
}

export function Ship() {
  const shipRef   = useRef<THREE.Group>(null!)
  const wheelRef  = useRef<THREE.Group>(null!)
  const sailRefs  = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)]
  const speedRef  = useRef(0)
  const yawRef    = useRef(0)     // current rotation (radians)
  const yawVelRef = useRef(0)     // angular velocity

  const input = useInputSystem()
  const setShipPosition = useGameStore((s) => s.setShipPosition)
  const setShipYaw      = useGameStore((s) => s.setShipYaw)
  const setShipSpeed    = useGameStore((s) => s.setShipSpeed)

  useFrame(({ clock }, delta) => {
    const inp = input.current
    const ship = shipRef.current
    if (!ship) return

    const dt = Math.min(delta, 0.05)   // cap delta to avoid physics explosions
    const t  = clock.getElapsedTime()

    // --- WHIRLPOOLS & TELEPORTATION ---
    const WHIRLPOOLS = [
      new THREE.Vector2(150, -100),
      new THREE.Vector2(-250, -350),
      new THREE.Vector2(200, -500),
      new THREE.Vector2(-100, 100)
    ]

    if (!shipRef.current.userData.sinkTimer) shipRef.current.userData.sinkTimer = 0

    if (shipRef.current.userData.isSinking) {
      shipRef.current.userData.sinkTimer += dt
      const st = shipRef.current.userData.sinkTimer
      const sinkType = shipRef.current.userData.sinkType

      if (sinkType === "bermuda") {
        if (st < 2.0) {
          yawRef.current += 5 * dt
          ship.rotation.x = THREE.MathUtils.lerp(ship.rotation.x, Math.PI / 3, 2 * dt)
          ship.position.y -= 10 * dt
        }
        if (st > 1.0 && st < 3.0) {
          const opacity = st < 2.0 ? (st - 1.0) : (3.0 - st)
          useGameStore.getState().setBlackScreenOpacity(opacity)
        }
        if (st > 3.0) {
          ship.position.set(0, 0, -10)
          ship.rotation.set(0, 0, 0)
          yawRef.current = 0
          speedRef.current = 0
          shipRef.current.userData.isSinking = false
          shipRef.current.userData.sinkTimer = 0
          useGameStore.getState().setBlackScreenOpacity(0)
          useGameStore.getState().unlockAchievement("ach-bermuda")
        }
      } else if (sinkType === "whirlpool") {
        // 0.0 - 1.5: Spin and sink into the hole
        if (st < 1.5) {
          yawRef.current -= 8 * dt // Spin matching whirlpool
          ship.rotation.x = THREE.MathUtils.lerp(ship.rotation.x, Math.PI / 2.5, 3 * dt)
          ship.position.y -= 15 * dt
        }
        
        // 1.0 - 2.0: Fade to black
        if (st > 1.0 && st < 2.0) {
          useGameStore.getState().setBlackScreenOpacity(st - 1.0)
        }

        // 2.0: Setup exit trajectory
        if (st > 2.0 && st < 2.1 && shipRef.current.userData.destWhirlpool !== undefined) {
          const destIdx = shipRef.current.userData.destWhirlpool
          const dest = WHIRLPOOLS[destIdx]
          shipRef.current.userData.destWhirlpool = undefined
          shipRef.current.userData.destCenter = dest.clone()
          shipRef.current.userData.exitAngle = Math.random() * Math.PI * 2
          
          // Move camera instantly by setting ship to the center underwater
          ship.position.set(dest.x, -20, dest.y)
        }

        // 2.0 - 3.0: Fade from black
        if (st > 2.0 && st < 3.0) {
          useGameStore.getState().setBlackScreenOpacity(3.0 - st)
        }

        // 2.0 - 4.0: Shoot up and spiral out!
        if (st > 2.0 && st < 4.0) {
          const progress = (st - 2.0) / 2.0 // 0 to 1
          const destCenter = shipRef.current.userData.destCenter
          const exitAngle = shipRef.current.userData.exitAngle
          
          // Expand radius from 0 to 60 (outside the 40 limit)
          const radius = progress * 60.0
          // Emerge from -20 up to 0, with a slight hop at the end
          const height = -20.0 * (1.0 - progress) + Math.sin(progress * Math.PI) * 2.0
          // Spin on the way up (2 full rotations)
          const currentAngle = exitAngle + (1.0 - progress) * Math.PI * 4
          
          ship.position.set(
            destCenter.x + Math.sin(currentAngle) * radius,
            height,
            destCenter.y + Math.cos(currentAngle) * radius
          )
          
          // Ship levels out
          ship.rotation.x = THREE.MathUtils.lerp(Math.PI / 3, 0, progress)
          yawRef.current = currentAngle + Math.PI / 2 // Point outwards along the spiral
          
          // Start full speed so when it ends, ship sails away
          speedRef.current = MAX_SPEED
        }

        // 4.0: Done!
        if (st > 4.0) {
          shipRef.current.userData.isSinking = false
          shipRef.current.userData.sinkTimer = 0
          useGameStore.getState().setBlackScreenOpacity(0)
        }
      }
      
      ship.rotation.y = yawRef.current
      return
    }

    // --- BERMUDA PULL ---
    const bermudaDist = Math.hypot(ship.position.x - 0, ship.position.z - 250)
    if (bermudaDist < 100.0) {
      const pullForce = (100.0 - bermudaDist) * 0.8
      const angleToCenter = Math.atan2(0 - ship.position.x, 250 - ship.position.z)
      ship.position.x += Math.sin(angleToCenter) * pullForce * dt
      ship.position.z += Math.cos(angleToCenter) * pullForce * dt
      yawRef.current -= pullForce * 0.02 * dt

      if (bermudaDist < 20.0 && !shipRef.current.userData.isSinking) {
        shipRef.current.userData.isSinking = true
        shipRef.current.userData.sinkType = "bermuda"
      }
    }

    // --- WHIRLPOOLS PULL ---
    for (let i = 0; i < WHIRLPOOLS.length; i++) {
      const wp = WHIRLPOOLS[i]
      const wpDist = Math.hypot(ship.position.x - wp.x, ship.position.z - wp.y)
      if (wpDist < 40.0) {
        const pullForce = (40.0 - wpDist) * 1.5
        const angleToCenter = Math.atan2(wp.x - ship.position.x, wp.y - ship.position.z)
        ship.position.x += Math.sin(angleToCenter) * pullForce * dt
        ship.position.z += Math.cos(angleToCenter) * pullForce * dt
        yawRef.current -= pullForce * 0.05 * dt

        if (wpDist < 10.0 && !shipRef.current.userData.isSinking) {
          shipRef.current.userData.isSinking = true
          shipRef.current.userData.sinkType = "whirlpool"
          let destIdx = Math.floor(Math.random() * WHIRLPOOLS.length)
          while (destIdx === i) destIdx = Math.floor(Math.random() * WHIRLPOOLS.length)
          shipRef.current.userData.destWhirlpool = destIdx
        }
      }
    }

    // 🌪️ Steering 🌪️──────────────────────────────────────────────────────────
    const steerDir = (inp.left ? 1 : 0) - (inp.right ? 1 : 0)
    const targetYawVel = steerDir * TURN_SPEED
    yawVelRef.current += (targetYawVel - yawVelRef.current) * TURN_INERTIA * dt
    yawRef.current += yawVelRef.current * dt

    // ── Animate Steering Wheel ────────────────────────────────────────────
    if (wheelRef.current) {
      // steerDir is 1 for left, -1 for right. Multiply by PI to turn half a circle.
      const targetWheelAngle = steerDir * Math.PI
      wheelRef.current.rotation.z = THREE.MathUtils.lerp(wheelRef.current.rotation.z, targetWheelAngle, 10 * dt)
    }

    // ── Acceleration ──────────────────────────────────────────────────────
    const topSpeed = inp.boost ? BOOST_MAX_SPEED : MAX_SPEED
    const targetSpeed = (inp.forward ? topSpeed : 0) - (inp.backward ? MAX_SPEED * 0.4 : 0)
    
    // Smoothly accelerate towards the target speed
    speedRef.current += (targetSpeed - speedRef.current) * DRAG * dt

    // ── Animate Sails (Bulge) ─────────────────────────────────────────────
    // Sail scales dynamically with speed. Base is 1.0. Max forward pushes it to ~1.8
    const targetSailScale = Math.max(0.6, 1.0 + (speedRef.current / MAX_SPEED) * 0.8)
    sailRefs.forEach(ref => {
      if (ref.current) {
        ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, targetSailScale, 5 * dt)
      }
    })

    // 🌪️ Move in facing direction with Boundary Check 🌪️
    const dir = new THREE.Vector3(
      Math.sin(yawRef.current),
      0,
      Math.cos(yawRef.current)
    )
    
    const newPos = ship.position.clone().addScaledVector(dir, -speedRef.current * dt)
    
    // Calculate distance from center of world (Z = -250)
    const dX = Math.abs(newPos.x)
    const dZ = Math.abs(newPos.z + 250.0)
    const dStraight = Math.max(dX, dZ)
    const dDiag = (dX + dZ) / 1.41421356
    const dist = Math.max(dStraight, dDiag)
    
    const WATERFALL_EDGE = 630.0 // The visual drop starts at 650, we stop just before it

    if (dist > WATERFALL_EDGE) {
      // Hit the invisible wall at the edge of the world
      speedRef.current *= -0.5; // Bounce back slightly
    } else {
      ship.position.copy(newPos)
    }

    // 🌊 Wave bobbing 🌊───────────────────────────────────────────────────────
    const bob =
      Math.sin(t * BOB_FREQUENCY * Math.PI * 2) *
      Math.sin(ship.position.z * 4 / 800 + t * BOB_FREQUENCY * Math.PI * 2) *
      BOB_AMPLITUDE
    ship.position.y = bob

    // Dynamic pitch/roll based on movement and waves
    const targetRoll = steerDir * 0.15
    const pitch = Math.sin(t * BOB_FREQUENCY * 0.8 * Math.PI * 2) * 0.05
    ship.rotation.set(pitch, yawRef.current, THREE.MathUtils.lerp(ship.rotation.z, targetRoll, 0.1))

    // Update global state for UI and camera tracking
    setShipPosition([ship.position.x, ship.position.y, ship.position.z])
    setShipYaw(yawRef.current)
    setShipSpeed(speedRef.current)
  })

  return (
    <group ref={shipRef}>
      <ShipMesh wheelRef={wheelRef} sailRefs={sailRefs} />
    </group>
  )
}

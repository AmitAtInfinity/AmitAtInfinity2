import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import oceanVert from '../../../shaders/ocean.vert.glsl?raw'
import oceanFrag from '../../../shaders/ocean.frag.glsl?raw'

const OCEAN_SIZE = 1600
const OCEAN_SEGMENTS = 512

export function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  // Leva debug controls - tweak in real-time
  const {
    depthColor, surfaceColor,
    bigWavesElevation, bigWavesFrequencyX, bigWavesFrequencyY, bigWavesSpeed,
    smallWavesElevation, smallWavesFrequency, smallWavesSpeed, smallIterations,
    colorOffset, colorMultiplier,
  } = useControls('Ocean', {
    depthColor:          { value: '#1e7aaa' },
    surfaceColor:        { value: '#63d0de' },
    bigWavesElevation:   { value: 0.25, min: 0, max: 1, step: 0.001 },
    bigWavesFrequencyX:  { value: 4,    min: 0, max: 10, step: 0.001 },
    bigWavesFrequencyY:  { value: 1.5,  min: 0, max: 10, step: 0.001 },
    bigWavesSpeed:       { value: 0.75, min: 0, max: 4, step: 0.001 },
    smallWavesElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
    smallWavesFrequency: { value: 3,    min: 0, max: 30, step: 0.001 },
    smallWavesSpeed:     { value: 0.2,  min: 0, max: 4, step: 0.001 },
    smallIterations:     { value: 4,    min: 1, max: 5, step: 1 },
    colorOffset:         { value: 0.4,  min: -1, max: 1, step: 0.001 },
    colorMultiplier:     { value: 2.5,  min: 0, max: 10, step: 0.001 },
  }, { collapsed: true })

  const uniforms = useRef({
    uTime:                { value: 0 },
    uBigWavesElevation:   { value: bigWavesElevation },
    uBigWavesFrequency:   { value: new THREE.Vector2(bigWavesFrequencyX, bigWavesFrequencyY) },
    uBigWavesSpeed:       { value: bigWavesSpeed },
    uSmallWavesElevation: { value: smallWavesElevation },
    uSmallWavesFrequency: { value: smallWavesFrequency },
    uSmallWavesSpeed:     { value: smallWavesSpeed },
    uSmallIterations:     { value: smallIterations },
    uDepthColor:          { value: new THREE.Color(depthColor) },
    uSurfaceColor:        { value: new THREE.Color(surfaceColor) },
    uColorOffset:         { value: colorOffset },
    uColorMultiplier:     { value: colorMultiplier },
    uCameraPosition:      { value: new THREE.Vector3() },
    uWhirlpools:          { value: [
      new THREE.Vector2(150, -100),
      new THREE.Vector2(-250, -350),
      new THREE.Vector2(200, -500),
      new THREE.Vector2(-100, 100)
    ] }
  })

  useFrame((state) => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uTime.value = state.clock.getElapsedTime()
    u.uBigWavesElevation.value   = bigWavesElevation
    u.uBigWavesFrequency.value.set(bigWavesFrequencyX, bigWavesFrequencyY)
    u.uBigWavesSpeed.value       = bigWavesSpeed
    u.uSmallWavesElevation.value = smallWavesElevation
    u.uSmallWavesFrequency.value = smallWavesFrequency
    u.uSmallWavesSpeed.value     = smallWavesSpeed
    u.uSmallIterations.value     = smallIterations
    u.uDepthColor.value.set(depthColor)
    u.uSurfaceColor.value.set(surfaceColor)
    u.uColorOffset.value         = colorOffset
    u.uColorMultiplier.value     = colorMultiplier
    u.uCameraPosition.value.copy(state.camera.position)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -250]}
    >
      <planeGeometry args={[OCEAN_SIZE, OCEAN_SIZE, OCEAN_SEGMENTS, OCEAN_SEGMENTS]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanVert}
        fragmentShader={oceanFrag}
        uniforms={uniforms.current}
        transparent
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

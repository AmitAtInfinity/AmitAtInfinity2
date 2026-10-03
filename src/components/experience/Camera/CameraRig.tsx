import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../../systems/gameStore'

const CAMERA_OFFSET   = new THREE.Vector3(0, 6, 14)   // behind and above ship
const CAMERA_LOOK_AHEAD = 4                              // look ahead of ship
const DAMPING         = 0.07                             // spring smoothness (lower = slower)

export function CameraRig() {
  const { camera } = useThree()
  const shipPosition = useGameStore((s) => s.shipPosition)
  const shipYaw = useGameStore((s) => s.shipYaw)
  const shipRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3())
  const cameraYawRef = useRef(0)

  useFrame((_state) => {
    // Current ship position
    const sp = new THREE.Vector3(...shipPosition)
    
    // Snap instantly if teleported
    if (shipRef.current.distanceTo(sp) > 50) {
      shipRef.current.copy(sp)
      cameraYawRef.current = shipYaw
    } else {
      shipRef.current.lerp(sp, DAMPING * 15 * 0.016)   // fast position tracking
      // Smooth the yaw specifically for the camera so it drifts dynamically during turns
      cameraYawRef.current = THREE.MathUtils.lerp(cameraYawRef.current, shipYaw, DAMPING * 30 * 0.016)
    }

    // Calculate rotated offset based on the lagging camera yaw
    const rotatedOffset = CAMERA_OFFSET.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYawRef.current)
    
    // Desired camera position: rotated offset relative to ship
    const desiredPos = shipRef.current.clone().add(rotatedOffset)
    targetPos.current.lerp(desiredPos, DAMPING * 15 * 0.016)
    camera.position.copy(targetPos.current)

    // Look at a point slightly ahead of the ship
    const lookOffset = new THREE.Vector3(0, 1, -CAMERA_LOOK_AHEAD).applyAxisAngle(new THREE.Vector3(0, 1, 0), shipYaw)
    const lookAt = shipRef.current.clone().add(lookOffset)
    targetLook.current.lerp(lookAt, DAMPING * 20 * 0.016)
    camera.lookAt(targetLook.current)
  })

  return null
}

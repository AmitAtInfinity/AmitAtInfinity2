// Input system — keyboard, gamepad, and mobile touch
// Returns a normalized input state each frame
import { useEffect, useRef } from 'react'

export interface InputState {
  forward:  boolean
  backward: boolean
  left:     boolean
  right:    boolean
  boost:    boolean
  interact: boolean
  map:      boolean
  escape:   boolean
}

const DEFAULT_STATE: InputState = {
  forward:  false,
  backward: false,
  left:     false,
  right:    false,
  boost:    false,
  interact: false,
  map:      false,
  escape:   false,
}

// Map raw keys to semantic actions
const KEY_MAP: Record<string, keyof InputState> = {
  KeyW:        'forward',
  ArrowUp:     'forward',
  KeyS:        'backward',
  ArrowDown:   'backward',
  KeyA:        'left',
  ArrowLeft:   'left',
  KeyD:        'right',
  ArrowRight:  'right',
  Space:       'boost',
  KeyE:        'interact',
  KeyM:        'map',
  Escape:      'escape',
}

export function useInputSystem() {
  const state = useRef<InputState>({ ...DEFAULT_STATE })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code]
      if (action) {
        e.preventDefault()
        state.current[action] = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code]
      if (action) state.current[action] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup',   handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup',   handleKeyUp)
    }
  }, [])

  return state
}

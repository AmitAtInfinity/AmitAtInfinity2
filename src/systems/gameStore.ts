// Global game state — shared across all systems via Zustand
import { create } from 'zustand'
import type { ACHIEVEMENTS, DESTINATIONS } from '../data/portfolio'

type DestinationId = typeof DESTINATIONS[number]['id']
type AchievementId = typeof ACHIEVEMENTS[number]['id']

interface GameState {
  // Ship
  shipPosition: [number, number, number]
  shipYaw: number
  shipSpeed: number
  setShipPosition: (pos: [number, number, number]) => void
  setShipYaw: (yaw: number) => void
  setShipSpeed: (speed: number) => void

  // Location
  currentDestination: DestinationId | null
  nearbyDestination: DestinationId | null
  discoveredDestinations: Set<DestinationId>
  setCurrentDestination: (id: DestinationId | null) => void
  setNearbyDestination: (id: DestinationId | null) => void
  discoverDestination: (id: DestinationId) => void

  // UI panels
  activePanel: 'about' | 'projects' | 'skills' | 'research' | 'experience' | 'achievements' | 'contact' | 'map' | 'settings' | null
  setActivePanel: (panel: GameState['activePanel']) => void
  closePanel: () => void

  // Achievements
  unlockedAchievements: Set<AchievementId>
  pendingAchievement: AchievementId | null
  unlockAchievement: (id: AchievementId) => void
  clearPendingAchievement: () => void

  // Audio
  audioEnabled: boolean
  toggleAudio: () => void

  // Cinematic / Effects
  blackScreenOpacity: number
  setBlackScreenOpacity: (opacity: number) => void

  // Debug
  debugMode: boolean
  toggleDebug: () => void
}

export const useGameStore = create<GameState>((set) => ({
  shipPosition: [0, 0, 0],
  shipYaw: 0,
  shipSpeed: 0,
  setShipPosition: (pos) => set({ shipPosition: pos }),
  setShipYaw: (yaw) => set({ shipYaw: yaw }),
  setShipSpeed: (speed) => set({ shipSpeed: speed }),

  currentDestination: null,
  nearbyDestination: null,
  discoveredDestinations: new Set(),
  setCurrentDestination: (id) => set({ currentDestination: id }),
  setNearbyDestination: (id) => set({ nearbyDestination: id }),
  discoverDestination: (id) => set((s) => ({
    discoveredDestinations: new Set([...s.discoveredDestinations, id])
  })),

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),

  unlockedAchievements: new Set(),
  pendingAchievement: null,
  unlockAchievement: (id) => set((s) => ({
    unlockedAchievements: new Set([...s.unlockedAchievements, id]),
    pendingAchievement: s.unlockedAchievements.has(id) ? s.pendingAchievement : id,
  })),
  clearPendingAchievement: () => set({ pendingAchievement: null }),

  audioEnabled: true,
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  blackScreenOpacity: 0,
  setBlackScreenOpacity: (opacity) => set({ blackScreenOpacity: opacity }),

  debugMode: false,
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),
}))

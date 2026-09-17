'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type PlatformMode = 'VAJRA' | 'SENTINEL' | 'SENTINA'

interface PlatformState {
  currentPlatform: PlatformMode
  setPlatform: (platform: PlatformMode) => void
  togglePlatform: () => void
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      currentPlatform: 'VAJRA',
      setPlatform: (currentPlatform) => set({ currentPlatform }),
      togglePlatform: () =>
        set((state) => ({
          currentPlatform: state.currentPlatform === 'VAJRA' ? 'SENTINEL' : 'VAJRA',
        })),
    }),
    {
      name: 'platform-mode-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
)

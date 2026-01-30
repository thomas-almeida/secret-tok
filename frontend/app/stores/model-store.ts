import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Video {
    _id: string
    videoUrl: string
    description: string
}

export interface Model {
    _id: string
    name: string
    profilePic: string
    description: string
    videos: Video[]
}

interface ModelStore {
    models: Model | null
    isHydrated: boolean
    setHydrated: () => void
}

export const useModelStore = create<ModelStore>()(
    persist(
        (set) => ({
            models: null,
            isHydrated: false,
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'model-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated()
                }
            },
        }
    )
)
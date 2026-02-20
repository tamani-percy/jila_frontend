import { defineStore } from 'pinia'

interface TripUpdate {
    id: number
    distance: number
    tripStatus: string
    fareTotal: number
}

interface TripState {
    activeTrip: TripUpdate | null
    initialDistance: number | null
    lastUpdateTime: string | null
}

export const useTripStore = defineStore('trip', {
    state: (): TripState => ({
        activeTrip: null,
        initialDistance: null,
        lastUpdateTime: null
    }),

    getters: {
        isTripActive: (state) => !!state.activeTrip,

        isCompleted: (state) => state.activeTrip?.tripStatus === 'COMPLETED',

        distanceRemaining: (state) => state.activeTrip?.distance ?? null,

        progressRatio: (state): number => {
            if (state.initialDistance == null || state.activeTrip == null) return 0
            if (state.initialDistance === 0) return 1
            const remaining = state.activeTrip.distance
            const ratio = 1 - remaining / state.initialDistance
            return Math.min(Math.max(ratio, 0), 1)
        }
    },

    actions: {
        setTripUpdate(update: TripUpdate) {
            // Capture the very first distance as the "full" distance for progress calc
            if (this.activeTrip === null) {
                this.initialDistance = update.distance
            }
            this.activeTrip = { ...this.activeTrip, ...update }
            this.lastUpdateTime = new Date().toLocaleTimeString()
        },

        clearTrip() {
            this.activeTrip = null
            this.initialDistance = null
            this.lastUpdateTime = null
        }
    }
})
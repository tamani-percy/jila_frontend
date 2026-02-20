import { defineStore } from 'pinia'

export const useRideRequestStore = defineStore('rideRequest', {
    state: (): RideRequestResponse => ({
        rideRequest: null
    }),

    getters: {
        isRideRequestCreated: (state): boolean => {
            return !!state.rideRequest
        },

        pickupLocation: (state) => state.rideRequest?.pickupLocation,
        dropOffLocation: (state) => state.rideRequest?.dropOffLocation
    },

    actions: {
        setRideRequest(request: RideRequest) {
            this.rideRequest = request
        },

        clearRideRequest() {
            this.rideRequest = null
        }
    },

    persist: {
        storage: localStorage
    }
})

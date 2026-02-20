import {defineStore} from "pinia";

export const useVehicleStore = defineStore("vehicle", {
    state: () => ({
        vehicleData: {
            id: 0,
            make: '',
            model: '',
            year: 0,
            color: '',
            plateNumber: '',
            chassisNumber: '',
            engineNumber: '',
            driverId: 0
        }
    }),

    getters: {
        getVehicleData: (state) => state.vehicleData,

        isVehicleAvailable: (state) => {
            return !!state.vehicleData && state.vehicleData.id !== 0
        }
    },

    actions: {
        setVehicleData(vehicle: VehicleResponse) {
            this.vehicleData = vehicle
        }
    },

    persist: {
        storage: localStorage,
        paths: ['vehicleData']
    }
})

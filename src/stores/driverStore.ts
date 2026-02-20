import {defineStore} from "pinia";

export const useDriverStore = defineStore("driver", {
    state: (): DriverResponse => ({
        driverData: {
            id: 0,
            name: '',
            nrc: '',
            email: '',
            phoneNumber: '',
            licenseNumber: '',
            driverStatus: ''
        }
    }),

    getters: {
        getDriverData: (state) => state.driverData,

        isDriverAvailable: (state) => {
            return !!state.driverData && state.driverData.id !== 0;
        }
    },

    actions: {
        setDriverData(driver: DriverResponse) {
            this.driverData = driver;
        }
    },

    persist: {
        storage: localStorage,
        paths: ['driverData']
    }
});

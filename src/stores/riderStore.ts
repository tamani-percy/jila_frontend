import {defineStore} from "pinia";

export const useRiderStore = defineStore("rider", {
    state: (): RiderResponse => ({
        riderData: {
            id: 0,
            name: '',
            nrc: '',
            email: '',
            phoneNumber: ''
        }
    }),

    getters: {
        getRiderData: (state) => state.riderData,

        isRiderAvailable: (state) => {
            return !!state.riderData && state.riderData.id !== 0;
        }
    },

    actions: {
        setRiderData(rider: RiderResponse) {
            this.riderData = rider;
        }
    },

    persist: {
        storage: localStorage,
        paths: ['riderData']
    }
});

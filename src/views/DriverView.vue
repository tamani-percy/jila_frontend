<template>
  <div class="flex h-full w-full h-screen bg-gray-900 rounded-lg">
    <UCard class="w-1/4 h-full overflow-y-auto" variant="outline">
      <template #header>
        <h1 class="inline-flex items-center font-bold text-xl">
          <UIcon
              name="i-lucide-car-front"
              class="size-8 text-white bg-[#135bec] p-1 rounded-lg"
          />
          &nbsp; Jila
        </h1>
      </template>

      <Transition name="fade">
        <DriverTripDetailsSidebar
            v-if="tripStore.isTripActive"
            :trip="tripStore.activeTrip"
        />
      </Transition>

      <template #footer>
        <DriverRideRequestsTable @acceptRide="onRideAccepted"/>
        <div class="text-right mt-5">
          <UButton label="Mark All As Completed" leading-icon="i-lucide-x" color="error" variant="outline"
                   @click="onMarkTripsAsCompleted()"/>
        </div>
      </template>
    </UCard>

    <Transition name="fade">
      <DriverMapContainer
          v-if="rideRequestStore.isRideRequestCreated"
          :rideRequest="rideRequestStore.rideRequest"
      />
    </Transition>
  </div>
  <CreateDriverModal :isCreateDriverModalOpen="!isSetupComplete"/>
</template>

<script setup lang="ts">
import {computed, onMounted, onBeforeUnmount, ref} from 'vue'
import {useDriverStore} from '@/stores/driverStore'
import {useVehicleStore} from '@/stores/vehicleStore'
import {useRideRequestStore} from '@/stores/rideRequestStore'
import {useTripStore} from '@/stores/tripStore'
import SockJS from 'sockjs-client/dist/sockjs'
import {Client} from '@stomp/stompjs'
import DriverRideRequestsTable from '@/components/Driver/components/DriverRideRequestsTable.vue'
import DriverMapContainer from '@/components/Driver/components/DriverMapContainer.vue'
import DriverTripDetailsSidebar from '@/components/Driver/components/DriverTripDetailsSidebar.vue'
import axios from "axios/index";
import {markTripsAsCompleted} from "@/api/services/TripService.ts";

const driverStore = useDriverStore()
const vehicleStore = useVehicleStore()
const rideRequestStore = useRideRequestStore()
const tripStore = useTripStore()
const toast = useToast()

const isSetupComplete = computed(() =>
    driverStore.isDriverAvailable && vehicleStore.isVehicleAvailable
)

// ── WebSocket ────────────────────────────────────────────────────
const stompClient = ref<Client | null>(null)
let tripSubscription: any = null

const connectWebSocket = () => {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    debug: (msg) => {
      if (msg.includes('CONNECTED')) console.log('✅ Driver WS Connected')
    }
  })
  client.onConnect = () => {
    stompClient.value = client
  }
  client.activate()
}

const subscribeToTrip = (tripId: number) => {
  if (!stompClient.value?.connected) {
    setTimeout(() => subscribeToTrip(tripId), 500)
    return
  }
  tripSubscription?.unsubscribe()

  tripSubscription = stompClient.value.subscribe(`/topic/trip/${tripId}`, (message) => {
    try {
      const update = JSON.parse(message.body)
      tripStore.setTripUpdate(update)

      if (update.tripStatus === 'COMPLETED') {
        toast.add({title: 'Trip Completed', description: 'You have arrived!', color: 'success'})
        setTimeout(() => {
          tripStore.clearTrip()
          rideRequestStore.clearRideRequest()
          tripSubscription?.unsubscribe()
          tripSubscription = null
        }, 3000)
      }
    } catch (e) {
      console.error('Error parsing driver trip update', e)
    }
  })
}

// Emitted by DriverRideRequestsTable after a successful createTrip call
const onRideAccepted = (payload: { tripId: number; rideRequest: RideRequestResponse }) => {
  rideRequestStore.setRideRequest(payload.rideRequest)
  subscribeToTrip(payload.tripId)
}

onMounted(() => connectWebSocket())
onBeforeUnmount(() => {
  tripSubscription?.unsubscribe()
  stompClient.value?.deactivate()
})

const onMarkTripsAsCompleted = async () => {
  try {
    const res = await markTripsAsCompleted(driverStore?.getDriverData?.id)
    if (res.data) {
      toast.add({title: 'Success', description: 'Trips mark as completed', color: 'success'})
    } else {
      toast.add({title: 'Error', description: 'Unable to mark trips as completed.', color: 'error'})
    }
  } catch (e) {
    toast.add({title: 'Error', description: 'An error occurred. Please try again.', color: 'error'})
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
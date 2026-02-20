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
      <RideRequestForm
          v-if="!rideRequestStore.isRideRequestCreated"
          v-model:selectedPickUpLocation="selectedPickUpLocation"
          v-model:selectedDropOffLocation="selectedDropOffLocation"
          v-model:searchTerm="searchTerm"
          :locations="locations"
          :isSearchLoading="isSearchLocationLoading"
          :isLoading="isCreateRideRequestLoading"
          @submit="onSubmitRideRequest"
      />
      <RideDetailsSidebar
          v-else
          :rideRequest="rideRequestStore.rideRequest"
          :isCreateRideRequestLoading="isCreateRideRequestLoading"
          :isCancelRideRequestLoading="isCancelRideRequestLoading"
          @cancel="onCancelRideRequest"
      />
      <template #footer>
        <AllRiderRideRequests :rideRequestTrigger="rideRequestTrigger"/>
      </template>
    </UCard>

    <Transition name="fade">
      <RideMapContainer
          v-if="rideRequestStore.isRideRequestCreated"
          :rideRequest="rideRequestStore.rideRequest"
      />
    </Transition>
  </div>
  <CreateRiderModal :isCreateRiderModalOpen="!riderStore.isRiderAvailable"/>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { searchLocation } from '@/composables/useLocationSearch'
import { useRiderStore } from '@/stores/riderStore'
import { useRideRequestStore } from '@/stores/rideRequestStore'
import { useTripStore } from '@/stores/tripStore'
import { cancelRideRequest, createRideRequest } from '@/api/services/RideRequestService'
import type { OpenStreetMapResponse } from '@/api/interfaces/OpenStreetMap'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from '@stomp/stompjs'
import RideRequestForm from '@/components/Rider/components/RideRequestForm.vue'
import RideDetailsSidebar from '@/components/Rider/components/RideDetailsSidebar.vue'
import RideMapContainer from '@/components/Rider/components/RideMapContainer.vue'
import AllRiderRideRequests from '@/components/Rider/components/AllRiderRideRequests.vue'

let tripSubscription: any = null

const riderStore = useRiderStore()
const rideRequestStore = useRideRequestStore()
const tripStore = useTripStore()
const toast = useToast()

const stompClient = ref<Client | null>(null)

const selectedPickUpLocation = ref<OpenStreetMapResponse>()
const selectedDropOffLocation = ref<OpenStreetMapResponse>()
const searchTerm = ref('')
const searchTermDebounced = refDebounced(searchTerm, 300)

const locations = ref<any[]>([])
const isSearchLocationLoading = ref(false)
const isCreateRideRequestLoading = ref(false)
const isCancelRideRequestLoading = ref(false)
const rideRequestTrigger = ref(0)

// ── WebSocket ────────────────────────────────────────────────────
const connectWebSocket = () => {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    debug: (msg) => {
      if (msg.includes('CONNECTED')) console.log('✅ Rider WS Connected')
    }
  })
  client.onConnect = () => {
    stompClient.value = client
  }
  client.activate()
}

const subscribeToTrip = (rideRequestId: number) => {
  if (!stompClient.value?.connected) {
    setTimeout(() => subscribeToTrip(rideRequestId), 500)
    return
  }

  tripSubscription?.unsubscribe()

  const topic = `/topic/trip/ride-request/${rideRequestId}`

  tripSubscription = stompClient.value.subscribe(topic, (message) => {
    try {
      const update = JSON.parse(message.body)
      tripStore.setTripUpdate(update)

      if (update.tripStatus === 'COMPLETED') {
        toast.add({ title: 'You have arrived!', description: 'Your ride is complete.', color: 'success' })
        setTimeout(() => {
          tripStore.clearTrip()
          rideRequestStore.clearRideRequest()
          tripSubscription?.unsubscribe()
          tripSubscription = null
        }, 3000)
      }
    } catch (e) {
      console.error('Error parsing rider trip update', e)
    }
  })
}

const onSubmitRideRequest = async () => {
  try {
    isCreateRideRequestLoading.value = true

    const request = {
      pickupLocation: `${selectedPickUpLocation.value?.value?.lat},${selectedPickUpLocation.value?.value?.lon}`,
      dropOffLocation: `${selectedDropOffLocation.value?.value?.lat},${selectedDropOffLocation.value?.value?.lon}`,
      riderId: riderStore?.getRiderData?.id
    }
    const res = await createRideRequest(request)
    rideRequestTrigger.value++
    rideRequestStore.setRideRequest(res)
    subscribeToTrip(res.id)
  } catch (e) {
    console.error(e)
  } finally {
    isCreateRideRequestLoading.value = false
  }
}

const onCancelRideRequest = async () => {
  try {
    isCancelRideRequestLoading.value = true
    const res = await cancelRideRequest(rideRequestStore?.rideRequest?.id)
    if (res) {
      toast.add({ title: 'Success', description: 'Cancelled current ride request successfully.', color: 'success' })
      rideRequestStore.clearRideRequest()
      tripStore.clearTrip()
      selectedPickUpLocation.value = undefined
      selectedDropOffLocation.value = undefined
      searchTerm.value = ''
      locations.value = []
      tripSubscription?.unsubscribe()
      tripSubscription = null
    }
  } catch {
    toast.add({ title: 'Failed', description: 'Failed to cancel ride request.', color: 'error' })
  } finally {
    isCancelRideRequestLoading.value = false
  }
}

watch(searchTermDebounced, async (query) => {
  if (!query?.trim()) { locations.value = []; return }
  isSearchLocationLoading.value = true
  try {
    const results = await searchLocation(query)
    locations.value = results.map(location => ({ label: location.display_name, value: location }))
  } catch {
    locations.value = []
  } finally {
    isSearchLocationLoading.value = false
  }
})

onMounted(() => connectWebSocket())
onBeforeUnmount(() => {
  tripSubscription?.unsubscribe()
  stompClient.value?.deactivate()
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
:deep(#map) { filter: invert(0.9) hue-rotate(200deg); }
</style>
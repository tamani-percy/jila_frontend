<template>
  <UButton label="Mark Current Ride As Completed" @click="markTripsAsCompleted"/>
  <div class="grid grid-cols-2 gap-6 p-6">

    <!-- 🟢 AVAILABLE RIDE REQUESTS -->
    <div class="p-6 shadow rounded-xl border">
      <h2 class="text-xl font-bold mb-4">Available Ride Requests</h2>

      <div v-if="rideRequests.length > 0">
        <div
            v-for="request in rideRequests"
            :key="request.id"
            class="border p-4 rounded mb-4"
        >
          <p><strong>ID:</strong> {{ request.id }}</p>
          <p><strong>Pickup:</strong> {{ request.pickupLocation }}</p>
          <p><strong>Dropoff:</strong> {{ request.dropOffLocation }}</p>

          <button
              @click="acceptRide(request)"
              class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              :disabled="activeTrip !== null"
          >
            Accept Ride
          </button>
        </div>
      </div>

      <div v-else class="text-gray-500">
        No available rides
      </div>
    </div>

    <!-- 🔵 ACTIVE TRIP -->
    <div class="p-6 shadow rounded-xl border">
      <h2 class="text-xl font-bold mb-4">Active Trip</h2>

      <div v-if="activeTrip">
        <p><strong>Trip ID:</strong> {{ activeTrip.id }}</p>
        <p><strong>Status:</strong> {{ activeTrip.tripStatus }}</p>
        <p><strong>Fare:</strong> ZMW {{ activeTrip.fareTotal }}</p>

        <p class="text-2xl font-bold text-blue-600 mt-2">
          Distance: {{ activeTrip.distance }} KM
        </p>

        <p class="text-sm text-gray-600 mt-2">
          Last update: {{ lastUpdateTime }}
        </p>
      </div>

      <div v-else class="text-gray-500">
        No active trip
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEventSource } from '@vueuse/core'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from "@stomp/stompjs"
import axios from "axios"

/* ---------------------------
   STATE
---------------------------- */

const rideRequests = ref<any[]>([])
const activeTrip = ref<any | null>(null)
const lastUpdateTime = ref<string>('Never')

const stompClient = ref<Client | null>(null)
let tripSubscription: any = null

/* ---------------------------
   SSE — RIDE REQUEST STREAM
---------------------------- */

const { data, event } = useEventSource(
    'http://localhost:8080/api/ride-requests/stream',
    ['ride-requests-batch']
)

watch(event, (evt) => {
  if (evt === 'ride-requests-batch') {
    try {
      const list = JSON.parse(data.value!)
      rideRequests.value = list
      console.log('📨 Updated ride request list:', list)
    } catch (e) {
      console.error('Error parsing SSE data', e)
    }
  }
})

/* ---------------------------
   ACCEPT RIDE
---------------------------- */

const acceptRide = async (request: any) => {
  try {
    const tripRequest = {
      driverId: 1,
      rideRequestId: request.id,
      vehicleId: 2,
      fareTotal: 120.25
    }

    const response = await axios.post(
        "http://localhost:8080/api/v1/trips/",
        tripRequest
    )

    activeTrip.value = response.data

    // Remove accepted ride immediately
    rideRequests.value = rideRequests.value.filter(
        r => r.id !== request.id
    )

    subscribeToTrip(activeTrip.value.id)

  } catch (err) {
    console.error('❌ Accept failed', err)
  }
}

/* ---------------------------
   WEBSOCKET
---------------------------- */

onMounted(() => {
  connectWebSocket()
})

const connectWebSocket = () => {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    debug: (msg) => {
      if (msg.includes('CONNECTED')) {
        console.log('✅ WebSocket Connected')
      }
    }
  })

  client.onConnect = () => {
    stompClient.value = client
  }

  client.activate()
}

const markTripsAsCompleted = async () => {
  try {
    const res = await axios.post("http://localhost:8080/api/v1/trips/1")
    if (res.data) {
      console.log('✅ Trip marked as completed')
      activeTrip.value = null
      lastUpdateTime.value = 'Never'
    } else {
      alert("Failed to mark trip as completed")
    }
  } catch (e) {
    console.error(`❌ Error marking trip complete: ${e}`)
  }
}

const subscribeToTrip = (tripId: number) => {

  if (!stompClient.value || !stompClient.value.connected) {
    console.warn("WebSocket not connected yet")
    return
  }

  if (tripSubscription) {
    tripSubscription.unsubscribe()
  }

  const topic = `/topic/trip/${tripId}`
  console.log(`📡 Subscribing to ${topic}`)

  tripSubscription = stompClient.value.subscribe(topic, (message) => {
    try {
      const update = JSON.parse(message.body)

      activeTrip.value = {
        ...activeTrip.value,
        ...update
      }

      lastUpdateTime.value = new Date().toLocaleTimeString()

      if (update.tripStatus === 'COMPLETED') {
        console.log('🏁 Trip completed')

        setTimeout(() => {
          activeTrip.value = null
          if (tripSubscription) {
            tripSubscription.unsubscribe()
          }
        }, 2000)
      }

    } catch (e) {
      console.error("Error parsing trip update", e)
    }
  })
}
</script>

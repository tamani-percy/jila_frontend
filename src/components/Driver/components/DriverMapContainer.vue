<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTripStore } from '@/stores/tripStore'
import { fetchRoadRoute, interpolateAlongRoute } from '@/composables/useRoadRoute'

const props = defineProps<{
  rideRequest: RideRequestResponse
}>()

const tripStore = useTripStore()

const map = ref<L.Map | null>(null)
const driverMapContainer = ref<HTMLElement | null>(null)
const isLoadingRoute = ref(false)

let carMarker: L.Marker | null = null
let routePolyline: L.Polyline | null = null
let roadWaypoints: L.LatLng[] = []

const mapPinIcon = () => L.icon({
  iconUrl: '/images/svgs/map-pin.svg',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20]
})

const carIcon = () => L.icon({
  iconUrl: '/images/svgs/car.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

const initializeMap = async () => {
  if (!props.rideRequest || !driverMapContainer.value) return

  const [pickupLat, pickupLon] = props.rideRequest.pickupLocation.split(',').map(Number)
  const [dropoffLat, dropoffLon] = props.rideRequest.dropOffLocation.split(',').map(Number)

  const pickupLatLng = L.latLng(pickupLat, pickupLon)
  const dropoffLatLng = L.latLng(dropoffLat, dropoffLon)

  if (map.value) { map.value.remove(); map.value = null }
  carMarker = null
  routePolyline = null
  roadWaypoints = []

  map.value = L.map(driverMapContainer.value).setView([pickupLat, pickupLon], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    className: 'grayscale'
  }).addTo(map.value)

  L.marker([pickupLat, pickupLon], { icon: mapPinIcon() })
      .addTo(map.value).bindPopup('Pickup')

  L.marker([dropoffLat, dropoffLon], { icon: mapPinIcon() })
      .addTo(map.value).bindPopup('Drop Off')

  // Car starts at pickup while route loads
  carMarker = L.marker([pickupLat, pickupLon], { icon: carIcon() })
      .addTo(map.value).bindPopup('Driver')

  // Fit to bounds immediately with a straight line as placeholder
  const fallbackLine = L.polyline([pickupLatLng, dropoffLatLng], {
    color: '#334155',
    weight: 4,
    dashArray: '8 6'
  }).addTo(map.value)

  map.value.fitBounds(
      L.latLngBounds([pickupLatLng, dropoffLatLng]),
      { padding: [50, 50] }
  )

  // Fetch real road route
  isLoadingRoute.value = true
  const route = await fetchRoadRoute(pickupLatLng, dropoffLatLng)
  isLoadingRoute.value = false

  if (!map.value) return // unmounted while fetching

  // Remove placeholder, draw actual road geometry
  fallbackLine.remove()

  if (route && route.waypoints.length > 1) {
    roadWaypoints = route.waypoints

    routePolyline = L.polyline(roadWaypoints, {
      color: '#00c950',
      weight: 5
    }).addTo(map.value)

    map.value.fitBounds(routePolyline.getBounds(), { padding: [50, 50] })
  } else {
    // Fallback to straight line if OSRM fails
    roadWaypoints = [pickupLatLng, dropoffLatLng]
    routePolyline = L.polyline(roadWaypoints, { color: '#00c950', weight: 5 }).addTo(map.value)
  }

  // Snap car to current progress position if a trip is already in progress
  updateCarPosition(tripStore.progressRatio)
}

const updateCarPosition = (progress: number) => {
  if (!carMarker || roadWaypoints.length < 2) return
  carMarker.setLatLng(interpolateAlongRoute(roadWaypoints, progress))
}

onMounted(() => initializeMap())

watch(() => props.rideRequest, async () => {
  await nextTick()
  initializeMap()
}, { deep: true })

watch(() => tripStore.progressRatio, (ratio) => {
  updateCarPosition(ratio)
})

watch(() => tripStore.isCompleted, (done) => {
  if (done) updateCarPosition(1)
})

onBeforeUnmount(() => {
  if (map.value) { map.value.remove(); map.value = null }
})
</script>

<template>
  <div class="flex-1 relative bg-gray-800">
    <div ref="driverMapContainer" class="w-full h-full"></div>

    <!-- Route loading indicator -->
    <Transition name="fade">
      <div
          v-if="isLoadingRoute"
          class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2"
      >
        <svg class="animate-spin size-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span class="text-xs text-gray-300">Loading road route…</span>
      </div>
    </Transition>

    <!-- Live Trip Overlay -->
    <Transition name="fade">
      <div
          v-if="tripStore.isTripActive"
          class="absolute top-6 right-6 bg-gray-900/90 backdrop-blur rounded-xl p-4 max-w-xs space-y-2 shadow-lg"
      >
        <p class="text-xs text-blue-400 uppercase font-semibold tracking-wide flex items-center gap-1">
          <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
          Live Tracking
        </p>
        <p class="text-white font-medium">Driver is en route to drop-off</p>
        <div class="text-2xl font-bold text-white tabular-nums">
          {{ typeof tripStore.distanceRemaining === 'number'
            ? tripStore.distanceRemaining.toFixed(2)
            : tripStore.distanceRemaining }}
          <span class="text-sm font-normal text-gray-400">km remaining</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-1.5">
          <div
              class="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
              :style="{ width: `${Math.round(tripStore.progressRatio * 100)}%` }"
          />
        </div>
      </div>
    </Transition>

    <!-- Completed overlay -->
    <Transition name="fade">
      <div
          v-if="tripStore.isCompleted"
          class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div class="bg-gray-900 rounded-2xl p-8 text-center shadow-2xl">
          <UIcon name="i-lucide-check-circle" class="size-12 text-green-400 mx-auto"/>
          <p class="text-white text-xl font-bold mt-2">Trip Completed!</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
:deep(.grayscale) { filter: grayscale(100%); }
</style>
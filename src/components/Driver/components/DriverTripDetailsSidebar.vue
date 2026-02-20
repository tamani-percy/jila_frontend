<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '@/stores/tripStore'

defineProps<{
  trip: {
    id: number
    distance: number
    tripStatus: string
    fareTotal: number
  } | null
}>()

const tripStore = useTripStore()

const progressPercent = computed(() =>
    Math.round(tripStore.progressRatio * 100)
)

const statusColor = computed(() => {
  switch (tripStore.activeTrip?.tripStatus) {
    case 'COMPLETED': return 'text-green-400'
    case 'IN_PROGRESS': return 'text-blue-400'
    default: return 'text-yellow-400'
  }
})
</script>

<template>
  <div v-if="trip" class="w-full text-white space-y-4 p-2">
    <!-- Status Badge -->
    <div class="flex items-center justify-between">
      <span class="text-xs text-gray-400 uppercase font-semibold">Active Trip #{{ trip.id }}</span>
      <span :class="['text-xs font-bold uppercase', statusColor]">{{ trip.tripStatus }}</span>
    </div>

    <!-- Distance Banner -->
    <div class="bg-gray-800 rounded-xl p-4 space-y-2">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-navigation" class="size-5 text-blue-400" />
        <span class="text-sm text-gray-300">Distance Remaining</span>
      </div>
      <p class="text-3xl font-bold text-white">
        {{ typeof trip.distance === 'number' ? trip.distance.toFixed(2) : trip.distance }}
        <span class="text-base font-normal text-gray-400">km</span>
      </p>

      <!-- Progress bar -->
      <div class="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-linear"
            :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <p class="text-xs text-gray-400 text-right">{{ progressPercent }}% complete</p>
    </div>

    <!-- Fare -->
    <div class="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-dollar-sign" class="size-5 text-green-400" />
        <span class="text-sm text-gray-300">Fare Total</span>
      </div>
      <span class="text-xl font-bold text-green-400">
        ZMW{{ typeof trip.fareTotal === 'number' ? trip.fareTotal.toFixed(2) : trip.fareTotal }}
      </span>
    </div>

    <!-- Completion Banner -->
    <Transition name="fade">
      <div
          v-if="trip.tripStatus === 'COMPLETED'"
          class="bg-green-900/50 border border-green-500 rounded-xl p-4 text-center"
      >
        <UIcon name="i-lucide-check-circle" class="size-8 text-green-400 mx-auto" />
        <p class="text-green-300 font-semibold mt-1">Trip Completed!</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
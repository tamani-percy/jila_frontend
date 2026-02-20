<script setup lang="ts">
import {computed} from 'vue'
import {useTripStore} from '@/stores/tripStore'

defineProps<{
  rideRequest: RideRequestResponse
  isCreateRideRequestLoading: boolean
  isCancelRideRequestLoading: boolean
}>()

defineEmits(['cancel'])

const tripStore = useTripStore()

const progressPercent = computed(() =>
    Math.round(tripStore.progressRatio * 100)
)
</script>

<template>
  <div class="w-full text-white space-y-6">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-circle" class="size-5 text-blue-500 mt-1"/>
        <div>
          <p class="text-xs text-gray-400 uppercase">Pickup</p>
          <p class="text-sm font-medium text-black">{{ rideRequest.pickupLocation }}</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-circle" class="size-5 text-blue-500 mt-1 bg-blue-500 rounded-full"/>
        <div>
          <p class="text-xs text-gray-400 uppercase">Drop Off</p>
          <p class="text-sm font-medium text-black">{{ rideRequest.dropOffLocation }}</p>
        </div>
      </div>
    </div>

    <!-- Waiting for driver -->
    <div v-if="!tripStore.isTripActive">
      <UAlert
          color="info"
          title="Heads up!"
          description="Waiting for a driver to accept your request."
          icon="i-lucide-car"
      />
    </div>

    <!-- Live Trip Banner (shown once driver accepts and WS updates start) -->
    <Transition name="slide-down">
      <div v-if="tripStore.isTripActive" class="space-y-3">

        <!-- Distance Countdown Banner -->
        <div class="bg-gray-800 border border-blue-500/30 rounded-xl p-4 space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-navigation" class="size-5 text-blue-400 animate-pulse"/>
            <span class="text-xs text-blue-300 uppercase font-semibold tracking-wide">Driver En Route</span>
          </div>

          <div class="flex items-end gap-2">
            <span class="text-4xl font-bold tabular-nums text-white transition-all duration-500">
              {{
                typeof tripStore.distanceRemaining === 'number'
                    ? tripStore.distanceRemaining.toFixed(2)
                    : tripStore.distanceRemaining
              }}
            </span>
            <span class="text-base text-gray-400 mb-1">km away</span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div
                class="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-linear"
                :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <p class="text-xs text-gray-400 text-right">{{ progressPercent }}% complete</p>
        </div>

        <!-- Fare -->
        <div class="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
          <span class="text-sm text-gray-400">Estimated Fare</span>
          <span class="font-bold text-green-400">
            ZMW{{
              typeof tripStore.activeTrip?.fareTotal === 'number'
                  ? tripStore.activeTrip.fareTotal.toFixed(2)
                  : tripStore.activeTrip?.fareTotal
            }}
          </span>
        </div>

        <!-- Completed Banner -->
        <Transition name="fade">
          <div
              v-if="tripStore.isCompleted"
              class="bg-green-900/50 border border-green-500 rounded-xl p-4 text-center"
          >
            <UIcon name="i-lucide-check-circle" class="size-8 text-green-400 mx-auto"/>
            <p class="text-green-300 font-semibold mt-1">You have arrived!</p>
          </div>
        </Transition>
      </div>
    </Transition>

    <UButton
        @click="$emit('cancel')"
        :loading="isCreateRideRequestLoading"
        :disabled="isCancelRideRequestLoading || tripStore.isTripActive"
        class="w-fit"
        color="error"
        variant="outline"
        label="CANCEL RIDE REQUEST"
        size="lg"
    />
  </div>
</template>

<style scoped>
.slide-down-enter-active {
  transition: all 0.4s ease;
}

.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
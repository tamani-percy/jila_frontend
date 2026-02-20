<script setup lang="ts">
import type {TabsItem} from '@nuxt/ui'
import DriverView from "@/views/DriverView.vue";
import RiderView from "@/views/RiderView.vue";

const items = [
  {
    label: 'Rider',
    description: 'This view demonstrates a rider making a ride request',
    icon: 'i-lucide-user-round-search',
    slot: 'rider' as const
  },
  {
    label: 'Driver',
    description: 'This view demonstrates a driver getting a ride request, and beginning a trip.',
    icon: 'i-lucide-car-front',
    slot: 'driver' as const
  }
] satisfies TabsItem[]

</script>

<template>
  <UTabs :items="items" :ui="{ trigger: 'grow' }" class="w-full h-screen" :unmount-on-hide="false">
    <template #rider="{ item }">
      <RiderView/>
    </template>

    <template #driver="{ item }">
      <DriverView/>
    </template>
  </UTabs>
</template>


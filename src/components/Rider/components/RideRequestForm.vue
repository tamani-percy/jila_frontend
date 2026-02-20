<script setup lang="ts">
defineProps<{
  selectedPickUpLocation: any
  selectedDropOffLocation: any
  searchTerm: string
  locations: any[]
  isSearchLoading: boolean
  isLoading: boolean
}>()

defineEmits([
  'update:selectedPickUpLocation',
  'update:selectedDropOffLocation',
  'update:searchTerm',
  'submit'
])
</script>

<template>
  <div class="w-full text-white text-center">
    <UFormField label="Pick Up Location" required>
      <UInputMenu
          highlight
          variant="outline"
          :model-value="selectedPickUpLocation"
          @update:model-value="$emit('update:selectedPickUpLocation', $event)"
          :search-term="searchTerm"
          @update:search-term="$emit('update:searchTerm', $event)"
          :items="locations"
          :loading="isSearchLoading"
          class="w-full"
          ignore-filter
          placeholder="Search Pick Up Location"
          icon="i-lucide-map-pin"
      />
    </UFormField>

    <Transition>
      <div class="w-full mt-4" v-if="selectedPickUpLocation">
        <UFormField label="Drop Off Location" required>
          <UInputMenu
              highlight
              variant="ghost"
              :model-value="selectedDropOffLocation"
              @update:model-value="$emit('update:selectedDropOffLocation', $event)"
              :search-term="searchTerm"
              @update:search-term="$emit('update:searchTerm', $event)"
              :items="locations"
              :loading="isSearchLoading"
              class="w-full"
              placeholder="Search Drop Off Location"
              ignore-filter
              icon="i-lucide-map-pin"
          />
        </UFormField>
      </div>
    </Transition>

    <Transition>
      <UButton
          v-if="selectedPickUpLocation && selectedDropOffLocation"
          @click="$emit('submit')"
          class="mt-5 w-fit"
          :disabled="isLoading"
          :loading="isLoading"
          label="MAKE RIDE REQUEST"
          size="xl"
          leading-icon="i-lucide-car"
      />
    </Transition>
  </div>
</template>

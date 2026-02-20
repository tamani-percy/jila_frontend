<script setup lang="ts">
import {h, onMounted, type Ref, ref, resolveComponent, watch} from 'vue'
import type {TableColumn} from '@nuxt/ui/components/Table.vue'
import {dateTimeFormatter} from '@/utils/DateTimeFormatter.ts'
import type {AccordionItem} from '@nuxt/ui'
import {getAllRideRequests} from '@/api/services/RideRequestService.ts'
import {useDriverStore} from '@/stores/driverStore.ts'
import {useVehicleStore} from '@/stores/vehicleStore.ts'
import {createTrip} from '@/api/services/TripService.ts'

const props = defineProps<{
  rideRequestTrigger?: number
}>()

const emits = defineEmits<{
  // Emits the trip id and the updated ride request so DriverView can
  // wire up the WS subscription and set rideRequestStore in one shot.
  acceptRide: [value: { tripId: number; rideRequest: RideRequestResponse }]
}>()

watch(
    () => props.rideRequestTrigger,
    () => onFetchRideRequestByStatus()
)

const rideRequests: Ref<RideRequestResponse[] | undefined> = ref([])
const isRideRequestsLoading: Ref<boolean> = ref(false)
const isAcceptingId = ref<number | null>(null)

const toast = useToast()
const driverStore = useDriverStore()
const vehicleStore = useVehicleStore()
const UButton = resolveComponent('UButton')

const onFetchRideRequestByStatus = async () => {
  try {
    isRideRequestsLoading.value = true
    const res = await getAllRideRequests()
    rideRequests.value = res.filter(r => r.rideRequestStatus === 'AVAILABLE')
  } catch {
    toast.add({title: 'Failed', description: 'Failed to fetch ride requests.', color: 'error'})
  } finally {
    isRideRequestsLoading.value = false
  }
}

onMounted(() => onFetchRideRequestByStatus())

const columns: TableColumn<RideRequestResponse>[] = [
  {
    accessorKey: 'id',
    header: '',
    cell: ({row}) => {
      const id = row.getValue('id') as number
      return h(UButton, {
        loading: isAcceptingId.value === id,
        disabled: isAcceptingId.value !== null,
        color: 'info',
        variant: 'subtle',
        onClick() {
          acceptRide(id, row.original)
        }
      }, () => 'ACCEPT RIDE')
    }
  },
  {
    accessorKey: 'pickupLocation',
    header: 'Pickup Location',
    cell: ({row}) => `${row.getValue('pickupLocation')}`
  },
  {
    accessorKey: 'dropOffLocation',
    header: 'Drop Off Location',
    cell: ({row}) => `${row.getValue('dropOffLocation')}`
  },
  {
    accessorKey: 'requestedAt',
    header: 'Requested At',
    cell: ({row}) => `${dateTimeFormatter(row.getValue('requestedAt'))}`
  }
]

const items = [
  {label: 'Ride Requests', icon: 'i-lucide-car'}
] satisfies AccordionItem[]

const acceptRide = async (rideRequestId: number, rideRequest: RideRequestResponse) => {
  try {
    isAcceptingId.value = rideRequestId

    const tripRequest: TripRequest = {
      driverId: driverStore?.getDriverData?.id,
      rideRequestId,
      vehicleId: vehicleStore?.getVehicleData?.id,
      fareTotal: parseFloat((Math.random() * 50 + 5).toFixed(2))
    }

    // createTrip returns the new TripResponse
    const trip = await createTrip(tripRequest)

    // Remove accepted request from the local list
    rideRequests.value = rideRequests.value?.filter(r => r.id !== rideRequestId)

    // Build an updated rideRequest object that includes the trip
    const updatedRideRequest: RideRequestResponse = {
      ...rideRequest,
      trip,
      rideRequestStatus: 'ACCEPTED'
    }

    // Let DriverView handle WS subscription & store updates
    emits('acceptRide', {tripId: trip.id, rideRequest: updatedRideRequest})

    toast.add({title: 'Success', description: 'Accepted ride. Trip is now active.', color: 'success'})
  } catch {
    toast.add({title: 'Failed', description: 'Failed to accept ride.', color: 'error'})
  } finally {
    isAcceptingId.value = null
  }
}
</script>

<template>
  <UAccordion :items="items">
    <template #content="{ item }">
      <UCard>
        <UTable
            sticky
            :data="rideRequests"
            class="flex-1 max-h-[312px]"
            :loading="isRideRequestsLoading"
            :columns="columns"
        />
      </UCard>
    </template>
  </UAccordion>
</template>
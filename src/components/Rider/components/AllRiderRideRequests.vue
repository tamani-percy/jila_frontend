<script setup lang="ts">
import {h, onMounted, type Ref, ref, resolveComponent, watch} from "vue";
import {cancelRideRequest, getRideRequestsByRider} from "@/api/services/RideRequestService.ts";
import {useRiderStore} from "@/stores/riderStore.ts";
import type {TableColumn} from "@nuxt/ui/components/Table.vue";
import {formatRideRequestStatus} from "@/utils/RideRequestUtil.ts";
import {dateTimeFormatter} from "@/utils/DateTimeFormatter.ts";
import type {AccordionItem} from '@nuxt/ui'

const props = defineProps<{
  rideRequestTrigger: number
}>()

watch(
    () => props.rideRequestTrigger,
    () => {
      onFetchRideRequestByStatus()
    }
)

const rideRequests: Ref<RideRequestResponse[] | undefined> = ref<RideRequestResponse[] | undefined>([])
const isRideRequestsLoading: Ref<boolean> = ref<boolean>(false)

const toast = useToast()
const riderStore = useRiderStore()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const isCancelRideRequestLoading: Ref<boolean> = ref<boolean>(false)
const onFetchRideRequestByStatus = async () => {
  try {
    isRideRequestsLoading.value = true
    rideRequests.value = await getRideRequestsByRider(riderStore?.getRiderData?.id,)
  } catch (e) {
    toast.add({
      title: 'Failed',
      description: 'Failed to fetch ride requests.',
      color: 'error'
    })
  } finally {
    isRideRequestsLoading.value = false
  }
}


onMounted(() => {
  onFetchRideRequestByStatus()
})

const columns: TableColumn<RideRequestResponse>[] = [
  {
    accessorKey: 'id',
    header: '',
    cell: ({row}) => {
      const rideRequestStatus = row.getValue('rideRequestStatus')
      return h(UButton, {
            loading: isCancelRideRequestLoading.value,
            disabled: rideRequestStatus === "CANCELLED_BY_RIDER" || rideRequestStatus === "CANCELLED_BY_DRIVER",
            color: 'error', variant: 'subtle', onClick() {
              cancelRide(row.getValue("id"))
            }
          }, () =>
              "CANCEL"
      )
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
  },
  {
    accessorKey: 'rideRequestStatus',
    header: 'Ride Request Status',
    cell: ({row}) => {
      const color = {
        AVAILABLE: 'info' as const,
        CREATED: 'neutral' as const,
        ACCEPTED: 'neutral' as const
      }[row.getValue('rideRequestStatus') as string]

      return h(UBadge, {class: 'capitalize', variant: 'subtle', color}, () =>
          formatRideRequestStatus(row.getValue('rideRequestStatus'))
      )
    }
  },
]

const cancelRide = async (rideRequestId: number) => {
  try {
    isCancelRideRequestLoading.value = true

    const res = await cancelRideRequest(rideRequestId)

    if (res) {
      const ride = rideRequests.value.find(r => r.id === rideRequestId)
      if (ride) {
        ride.rideRequestStatus = "CANCELLED_BY_RIDER"
      }

      toast.add({
        title: 'Success',
        description: 'Cancelled ride request successfully.',
        color: 'success'
      })
    }

  } finally {
    isCancelRideRequestLoading.value = false
  }
}


const items = [
  {
    label: 'Ride Requests',
    icon: 'i-lucide-car'
  },
] satisfies AccordionItem[]
</script>

<template>
  <UAccordion :items="items">
    <template #content="{ item }">
      <UCard>
        <UTable sticky :data="rideRequests" class="flex-1 max-h-[312px]" :loading="isRideRequestsLoading"
                :columns="columns"/>
      </UCard>
    </template>
  </UAccordion>

</template>

<style scoped>

</style>
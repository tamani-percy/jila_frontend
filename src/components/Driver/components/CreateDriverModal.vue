<script setup lang="ts">
import {computed, onMounted, reactive, type Ref, ref} from "vue";
import * as z from 'zod'
import type {FormSubmitEvent, StepperItem} from '@nuxt/ui'
import {useDriverStore} from "@/stores/driverStore.ts";
import {DriverStatus} from "@/api/schemas/DriverSchema.ts";
import {createDriver} from "@/api/services/DriverService.ts";
import {VehicleMake} from "@/api/schemas/VehicleSchema.ts";
import {createVehicle} from "@/api/services/VehicleService.ts";
import {useVehicleStore} from "@/stores/vehicleStore.ts";

const toast = useToast()
const driverStore = useDriverStore()
const vehicleStore = useVehicleStore()

const driverId: Ref<number> = ref<number>(0)
const currentStep: Ref<number> = ref<number>(0)
const driverStatusOptions: Ref<Record<string, string>[]> = ref<Record<string, string>[]>(DriverStatus)
const vehicleMakeOptions: Ref<Record<string, string>[]> = ref<Record<string, string>[]>(VehicleMake)
const selectedDriverStatus: Ref<string> = ref<string>('')
const selectedVehicleMake: Ref<string> = ref<string>('')
const isCreateDriverLoading = ref<boolean>(false)
const isCreateVehicleLoading = ref<boolean>(false)

const items = [
  {
    slot: 'driver' as const,
    title: 'Create Driver',
    description: 'Create a driver to simulate confirming ride requests.',
    icon: 'i-lucide-user'
  }, {
    slot: 'vehicle' as const,
    title: 'Create Vehicle',
    description: 'Create a vehicle that will be attached to the driver.',
    icon: 'i-lucide-car-front'
  },
] satisfies StepperItem[]

const driverSchema = z.object({
  email: z.email('Invalid email'),
  name: z.string('Name is required')
      .min(5, 'Must be at least 5 characters'),
  nrc: z.string('NRC is required')
      .regex(/^\d{6}\/\d{2}\/\d{1}$/, 'NRC must be in format 000000/00/0'),
  phoneNumber: z.string('Phone Number is required')
      .regex(/^(?:\+260|0)?9\d{8}$/, 'Phone number must be valid (e.g. 097XXXXXXX or +26097XXXXXXX)'),
  password: z.string('Password is required')
      .min(8, 'Must be at least 8 characters'),
  licenseNumber: z.string('License Number is required')
      .min(5, 'Must be at least 5 characters'),
})

const vehicleSchema = z.object({
  model: z.string('Vehicle Model is required')
      .min(1, 'Must be at least 1 character'),
  year: z
      .number(
          "Vehicle Year is required"
      )
      .min(1999, "Vehicle Year must be at least 1999")
      .max(2026, "Vehicle Year cannot be greater than 2026"),
  color: z.string('Vehicle Color is required')
      .min(1, 'Must be at least 1 character'),
  plateNumber: z
      .string("Vehicle Plate Number is required"
      )
      .min(1, "Vehicle Plate Number is required")
      .regex(
          /^(?=(?:.*[A-Za-z]){3,})(?=.*\d).*$/,
          "Plate number must contain at least 3 letters and 1 number"
      ),
  chassisNumber: z.string('Vehicle Chassis Number is required')
      .min(1, 'Must be at least 1 character'),
  engineNumber: z.string('Vehicle Engine Number is required')
      .min(1, 'Must be at least 1 character'),

})

type DriverSchema = z.output<typeof driverSchema>

type VehicleSchema = z.output<typeof vehicleSchema>

const driverState = reactive<Partial<DriverSchema>>({
  email: undefined,
  name: undefined,
  nrc: undefined,
  phoneNumber: undefined,
  password: undefined,
  licenseNumber: undefined
})

const vehicleState = reactive<Partial<VehicleSchema>>({
  year: undefined,
  model: undefined,
  color: undefined,
  plateNumber: undefined,
  chassisNumber: undefined,
  engineNumber: undefined
})


async function onSubmitDriver(event: FormSubmitEvent<DriverSchema>) {
  try {
    isCreateDriverLoading.value = true
    const driverRequest: DriverRequest = {
      email: event.data.email,
      phoneNumber: event.data.phoneNumber,
      password: event.data.password,
      nrc: event.data.nrc,
      name: event.data.name,
      licenseNumber: event.data.licenseNumber,
      driverStatus: selectedDriverStatus.value
    }
    const driverResponse: DriverResponse = await createDriver(driverRequest)
    driverId.value = driverResponse.id
    driverStore.setDriverData(driverResponse)
    currentStep.value = 1
    toast.add({title: 'Success', description: 'Created driver successfully.', color: 'success'})
  } catch (e) {
    toast.add({title: 'Failed', description: 'Failed to create driver.', color: 'error'})
  } finally {
    isCreateDriverLoading.value = false
  }
}

async function onSubmitVehicle(event: FormSubmitEvent<VehicleSchema>) {
  try {
    isCreateVehicleLoading.value = true

    const fallbackDriverId =
        driverId.value || driverStore.driverData?.id

    if (!fallbackDriverId) {
      toast.add({
        title: 'Error',
        description: 'No driver found.',
        color: 'error'
      })
      return
    }
    const vehicleRequest: VehicleRequest = {
      make: selectedVehicleMake.value,
      model: event.data.model,
      year: event.data.year,
      color: event.data.color,
      plateNumber: event.data.plateNumber,
      chassisNumber: event.data.chassisNumber,
      engineNumber: event.data.engineNumber,
      driverId: fallbackDriverId
    }
    const vehicleResponse = await createVehicle(vehicleRequest)
    vehicleStore.setVehicleData(vehicleResponse)
    toast.add({
      title: 'Success',
      description: 'Created vehicle successfully.',
      color: 'success'
    })

  } catch (e) {
    toast.add({
      title: 'Failed',
      description: 'Failed to create vehicle.',
      color: 'error'
    })
  } finally {
    isCreateVehicleLoading.value = false
  }
}


const uppercaseColor = computed({
  get: () => vehicleState.color,
  set: (val: string | undefined) => {
    vehicleState.color = val?.toUpperCase()
  }
})

const uppercasePlateNumber = computed({
  get: () => vehicleState.plateNumber,
  set: (val: string | undefined) => {
    vehicleState.plateNumber = val?.toUpperCase()
  }
})

const uppercaseEngineNumber = computed({
  get: () => vehicleState.engineNumber,
  set: (val: string | undefined) => {
    vehicleState.engineNumber = val?.toUpperCase()
  }
})

const uppercaseChassisNumber = computed({
  get: () => vehicleState.chassisNumber,
  set: (val: string | undefined) => {
    vehicleState.chassisNumber = val?.toUpperCase()
  }
})

onMounted(() => {
  if (driverStore.driverData?.id) {
    driverId.value = driverStore.driverData.id
    currentStep.value = 1
  }
})

const props = defineProps<{
  isCreateDriverModalOpen: boolean
}>()

</script>

<template>
  <UModal v-model:open="props.isCreateDriverModalOpen">
    <template #content>
      <UStepper :items="items" class="w-full p-5" :model-value="currentStep">
        <template #driver>
          <div class="">
            <UForm :schema="driverSchema" :state="driverState" class="space-y-4" @submit="onSubmitDriver">
              <UFormField label="Name" name="name">
                <UInput v-model="driverState.name" class="w-full"/>
              </UFormField>
              <UFormField label="Email" name="email">
                <UInput v-model="driverState.email" type="email" class="w-full"/>
              </UFormField>
              <UFormField label="NRC" name="nrc">
                <UInput v-model="driverState.nrc" class="w-full"/>
              </UFormField>
              <UFormField label="License Number" name="licenseNumber">
                <UInput v-model="driverState.licenseNumber" class="w-full"/>
              </UFormField>
              <UFormField label="Phone Number" name="phoneNumber">
                <UInput v-model="driverState.phoneNumber" class="w-full"/>
              </UFormField>
              <UFormField label="Password" name="password">
                <UInput v-model="driverState.password" class="w-full"/>
              </UFormField>
              <UFormField label="Driver Status" name="driverStatus">
                <USelect
                    name="driverStatus"
                    :items="driverStatusOptions"
                    label-key="name"
                    value-key="value"
                    class="w-full"
                    placeholder="Select driver status"
                    v-model="selectedDriverStatus"
                />
              </UFormField>
              <UButton type="submit">
                Submit
              </UButton>
            </UForm>
          </div>

        </template>
        <template #vehicle>
          <div class="">
            <UForm :schema="vehicleSchema" :state="vehicleState" class="space-y-4" @submit="onSubmitVehicle">
              <UFormField label="Make" name="make">
                <USelect
                    name="make"
                    :items="vehicleMakeOptions"
                    label-key="name"
                    value-key="value"
                    class="w-full"
                    placeholder="Select vehicle make"
                    v-model="selectedVehicleMake"
                />
              </UFormField>
              <UFormField label="Model" name="model">
                <UInput v-model="vehicleState.model" class="w-full" placeholder="Enter model"/>
              </UFormField>
              <UFormField label="Year" name="year">
                <UInputNumber v-model="vehicleState.year" class="w-full" default-value="1999" min="1999" max="2026"
                              :format-options="{useGrouping:false}" placeholder="Enter year"/>
              </UFormField>
              <UFormField label="Color" name="color">
                <UInput v-model="uppercaseColor" class="w-full capitalize" placeholder="Enter color" />
              </UFormField>
              <UFormField label="Plate Number" name="plateNumber">
                <UInput v-model="uppercasePlateNumber" class="w-full capitalize" placeholder="Enter plate number"/>
              </UFormField>
              <UFormField label="Chassis Number" name="chassisNumber">
                <UInput v-model="uppercaseChassisNumber" class="w-full" placeholder="Enter chassis number"/>
              </UFormField>
              <UFormField label="Engine Number" name="engineNumber">
                <UInput v-model="uppercaseEngineNumber" class="w-full" placeholder="Enter engine number"/>
              </UFormField>
              <UButton type="submit">
                Submit
              </UButton>
            </UForm>
          </div>

        </template>
      </UStepper>
    </template>
  </UModal>
</template>


shammahtwikatane@gmail.com


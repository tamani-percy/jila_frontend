<script setup lang="ts">
import {reactive, ref} from "vue";
import * as z from 'zod'
import type {FormSubmitEvent} from '@nuxt/ui'
import {createRider} from "@/api/services/RiderService.ts";
import {useRiderStore} from "@/stores/riderStore.ts";

const isCreateRiderLoading = ref<boolean>(false)

const toast = useToast()
const riderStore = useRiderStore()

const schema = z.object({
  email: z.email('Invalid email'),
  name: z.string('Name is required')
      .min(5, 'Must be at least 5 characters'),
  nrc: z.string('NRC is required')
      .regex(/^\d{6}\/\d{2}\/\d{1}$/, 'NRC must be in format 000000/00/0'),
  phoneNumber: z.string('Phone Number is required')
      .regex(/^(?:\+260|0)?9\d{8}$/, 'Phone number must be valid (e.g. 097XXXXXXX or +26097XXXXXXX)'),
  password: z.string('Password is required')
      .min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  name: undefined,
  nrc: undefined,
  phoneNumber: undefined,
  password: undefined
})

async function onSubmitRider(event: FormSubmitEvent<Schema>) {
  try {
    isCreateRiderLoading.value = true
    const riderRequest: RiderRequest = {
      email: event.data.email,
      phoneNumber: event.data.phoneNumber,
      password: event.data.password,
      nrc: event.data.nrc,
      name: event.data.name
    }
    const riderResponse: RiderResponse = await createRider(riderRequest)
    riderStore.setRiderData(riderResponse)
    toast.add({title: 'Success', description: 'Created rider successfully.', color: 'success'})
  } catch (e) {
    toast.add({title: 'Failed', description: 'Failed to create rider.', color: 'error'})
  } finally {
    isCreateRiderLoading.value = false
  }
}

const props = defineProps<{
  isCreateRiderModalOpen: boolean
}>()
</script>

<template>
  <UModal v-model:open="props.isCreateRiderModalOpen">
    <template #content>
      <div class="w-full justify-center items-center flex p-5 flex-col">
        <h1 class="text-xl font-bold mb-5">Create A Rider</h1>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmitRider">
          <UFormField label="Name" name="name">
            <UInput v-model="state.name" class="w-full"/>
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="state.email" type="email" class="w-full"/>
          </UFormField>
          <UFormField label="NRC" name="nrc">
            <UInput v-model="state.nrc" class="w-full"/>
          </UFormField>
          <UFormField label="Phone Number" name="phoneNumber">
            <UInput v-model="state.phoneNumber" class="w-full"/>
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="state.password" class="w-full"/>
          </UFormField>
          <UButton type="submit">
            Submit
          </UButton>
        </UForm>
      </div>
    </template>
  </UModal>
</template>


<template>
  <div>
    <UCard>
      <template #header>
        <h2 class="text-xl font-medium">Register</h2>
      </template>
      <UForm :state="state" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField
          label="Email"
          name="email"
          :error="errors.email || undefined"
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="jonh@jonh.com"
          />
        </UFormField>
        <UFormField
          label="Username"
          name="username"
          :error="errors.username || undefined"
        >
          <UInput
            v-model="state.username"
            type="text"
            placeholder="jonh@jonh.com"
          />
        </UFormField>
        <UFormField
          label="First name"
          name="firstName"
          :error="errors.firstName || undefined"
        >
          <UInput
            v-model="state.firstName"
            type="text"
            placeholder="jonh_jonh"
          />
        </UFormField>
        <UFormField
          label="Last name"
          name="lastName"
          :error="errors.lastName || undefined"
        >
          <UInput
            v-model="state.lastName"
            type="text"
            placeholder="jonh_jonh"
          />
        </UFormField>
        <UFormField
          label="Password"
          name="password"
          :error="errors.password || undefined"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
          />
        </UFormField>
        <UFormField
          label="Phone"
          name="phone"
          :error="errors.phone || undefined"
        >
          <UInput v-model="state.phone" type="tel" placeholder="+84912345678" />
        </UFormField>
        <UFormField
          label="Address"
          name="address"
          :error="errors.address || undefined"
        >
          <UInput
            v-model="state.address"
            type="text"
            placeholder="123 street 1"
          />
        </UFormField>
        <div class="flex items-center gap-2">
          <UButton type="submit" :loading="submitting || loading"
            >Create account</UButton
          >
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "../../composables/useForm";
import { useAuth } from "../../composables/useAuth";
// @ts-ignore Nuxt auto-import
definePageMeta({ layout: "auth" });

const { state, errors, submitting, submit, validate } = useForm({
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  password: "",
  phone: "",
  address: "",
});
const { register, loading } = useAuth();

async function onSubmit() {
  await submit(
    async (values) => {
      await register(values);
    },
    [
      "email",
      "username",
      "firstName",
      "lastName",
      "password",
      "phone",
      "address",
    ],
  );
}
</script>

<style scoped></style>

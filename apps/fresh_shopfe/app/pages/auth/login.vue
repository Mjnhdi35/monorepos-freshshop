<template>
  <div>
    <UCard>
      <template #header>
        <h2 class="text-xl font-medium">Login</h2>
      </template>
      <UForm :state="state" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField
          label="Email or Username"
          name="emailOrUsername"
          :error="errors.emailOrUsername || undefined"
        >
          <UInput
            v-model="state.emailOrUsername"
            type="text"
            placeholder="example@example.com or example"
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
        <div class="flex items-center gap-2">
          <UButton type="submit" :loading="submitting || loading"
            >Login</UButton
          >
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "../../composables/useForm";
import { useAuth } from "../../composables/useAuth";
import { toRaw } from "vue";
// @ts-ignore Nuxt auto-import
definePageMeta({ layout: "auth" });

const { state, errors, submitting, submit } = useForm({
  emailOrUsername: "",
  password: "",
});
const { login, loading } = useAuth();

async function onSubmit() {
  await submit(
    async (values) => {
      console.log("values after validate:", values);
      await login(values);
    },
    ["emailOrUsername", "password"],
  );
}
</script>

<style scoped></style>

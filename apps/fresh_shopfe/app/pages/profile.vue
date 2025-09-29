<template>
  <div>
    <UCard>
      <template #header>
        <h2 class="text-xl font-medium">Profile</h2>
      </template>
      <div v-if="loading">Loading...</div>
      <pre v-else class="text-xs whitespace-pre-wrap">{{
        JSON.stringify(currentUser, null, 2)
      }}</pre>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "../composables/useAuth";

const { ensureProfile, currentUser, loading } = useAuth();

onMounted(async () => {
  const user = await ensureProfile();
  console.log("[FE] navigated to /profile, user id:", user?.id);
});
</script>

<style scoped></style>

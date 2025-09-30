<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Chào mừng đến với Fresh Shop!
          </h1>

          <div v-if="isLoggedIn" class="space-y-4">
            <p class="text-lg text-gray-600">
              Xin chào, {{ user?.firstName }} {{ user?.lastName }}!
            </p>
            <p class="text-sm text-gray-500">Email: {{ user?.email }}</p>
            <p class="text-sm text-gray-500">Role: {{ user?.role }}</p>

            <UButton @click="logout" variant="outline"> Đăng xuất </UButton>
          </div>

          <div v-else class="space-y-4">
            <p class="text-lg text-gray-600">Bạn chưa đăng nhập</p>

            <div class="flex space-x-4">
              <UButton @click="navigateTo('/auth/login')" color="primary">
                Đăng nhập
              </UButton>
              <UButton @click="navigateTo('/auth/register')" variant="outline">
                Đăng ký
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: "default",
});

// Auth composable
const { user, isLoggedIn, logout } = useAuth();
</script>

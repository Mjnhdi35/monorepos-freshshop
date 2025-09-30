<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-gray-900">
              Fresh Shop
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <div v-if="isLoggedIn" class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">
                {{ user?.firstName }} {{ user?.lastName }}
              </span>
              <UButton @click="logout" size="sm" variant="outline">
                Đăng xuất
              </UButton>
            </div>

            <div v-else class="flex items-center space-x-2">
              <UButton @click="navigateTo('/auth/login')" size="sm">
                Đăng nhập
              </UButton>
              <UButton
                @click="navigateTo('/auth/register')"
                size="sm"
                variant="outline"
              >
                Đăng ký
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Auth composable
const { user, isLoggedIn, logout } = useAuth();
</script>

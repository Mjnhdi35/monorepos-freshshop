<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Tạo tài khoản mới
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Hoặc
          <NuxtLink
            to="/auth/login"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            đăng nhập vào tài khoản hiện có
          </NuxtLink>
        </p>
      </div>

      <UForm
        :schema="schema"
        :state="state"
        class="mt-8 space-y-6"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Họ" name="firstName">
            <UInput
              v-model="state.firstName"
              placeholder="Nhập họ"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Tên" name="lastName">
            <UInput
              v-model="state.lastName"
              placeholder="Nhập tên"
              :disabled="loading"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Email" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="Nhập email"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Username" name="username">
          <UInput
            v-model="state.username"
            placeholder="Nhập username"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Mật khẩu" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Nhập mật khẩu"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Xác nhận mật khẩu" name="confirmPassword">
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            :disabled="loading"
          />
        </UFormGroup>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-x-circle" class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            Tạo tài khoản
          </UButton>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/auth/google"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <UIcon name="i-logos-google-icon" class="w-5 h-5 mr-2" />
            Đăng ký với Google
          </NuxtLink>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

// Define page meta
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

// Auth composable
const { register } = useAuth();

// Form state
const state = reactive({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
});

// Form validation schema
const schema = z
  .object({
    firstName: z.string().min(1, "Họ là bắt buộc"),
    lastName: z.string().min(1, "Tên là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// UI state
const loading = ref(false);
const error = ref("");

// Form submit handler
async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  loading.value = true;
  error.value = "";

  try {
    const { confirmPassword, ...registerData } = event.data;
    await register(registerData);

    // Redirect to dashboard or home
    await navigateTo("/");
  } catch (err: any) {
    error.value = err.message || "Đăng ký thất bại";
  } finally {
    loading.value = false;
  }
}
</script>

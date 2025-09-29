import { ref } from "vue";

type AuthResponse = {
  accessToken?: string;
  user?: any;
  message?: string;
};

export function useAuth() {
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);
  const currentUser = ref<any | null>(null);
  const router = useRouter();

  async function register(payload: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    phone: string;
    address: string;
  }) {
    loading.value = true;
    errorMessage.value = null;
    try {
      const res = await $fetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: payload,
      });
      await profile();
      router.push("/profile");
      return res;
    } catch (err: any) {
      errorMessage.value =
        err?.data?.message || err?.message || "Unknown error";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(payload: { emailOrUsername: string; password: string }) {
    loading.value = true;
    errorMessage.value = null;
    try {
      const res = await $fetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: payload,
      });
      console.log("[FE] login response:", res);
      await profile();
      router.push("/profile");
      return res;
    } catch (err: any) {
      errorMessage.value =
        err?.data?.message || err?.message || "Unknown error";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function profile() {
    try {
      const res = await $fetch<any>("/api/auth/profile");
      console.log("[FE] profile response:", res);
      currentUser.value = res;
      return res;
    } catch (err) {
      currentUser.value = null;
      throw err;
    }
  }

  // Convenience: attempt refresh flow and retry profile on 401
  async function ensureProfile() {
    try {
      return await profile();
    } catch (err: any) {
      if (err?.status === 401) {
        try {
          await $fetch("/api/auth/refresh", { method: "POST" });
          return await profile();
        } catch (e) {
          throw e;
        }
      }
      throw err;
    }
  }

  return {
    loading,
    errorMessage,
    currentUser,
    register,
    login,
    profile,
    ensureProfile,
  };
}

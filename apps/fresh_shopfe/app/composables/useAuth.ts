export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const useAuth = () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (process.client) {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("access_token");

      if (storedUser && storedToken) {
        user.value = JSON.parse(storedUser);
        accessToken.value = storedToken;
      }
    }
  };

  // Login function
  const login = async (
    credentials: LoginCredentials,
  ): Promise<AuthResponse> => {
    try {
      const { data } = await $fetch<{ data: AuthResponse }>("/api/auth/login", {
        method: "POST",
        body: credentials,
        credentials: "include", // Important for cookies
      });

      // Store auth data
      user.value = data.user;
      accessToken.value = data.access_token;

      if (process.client) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("access_token", data.access_token);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.data?.message || "Login failed");
    }
  };

  // Register function
  const register = async (
    registerData: RegisterData,
  ): Promise<AuthResponse> => {
    try {
      const { data } = await $fetch<{ data: AuthResponse }>(
        "/api/auth/register",
        {
          method: "POST",
          body: registerData,
          credentials: "include",
        },
      );

      // Store auth data
      user.value = data.user;
      accessToken.value = data.access_token;

      if (process.client) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("access_token", data.access_token);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.data?.message || "Registration failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (accessToken.value) {
        await $fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state
      user.value = null;
      accessToken.value = null;

      if (process.client) {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }

      // Redirect to login
      await navigateTo("/auth/login");
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const { data } = await $fetch<{ data: AuthResponse }>(
        "/api/auth/refresh",
        {
          method: "POST",
          credentials: "include",
        },
      );

      accessToken.value = data.access_token;

      if (process.client) {
        localStorage.setItem("access_token", data.access_token);
      }

      return data.access_token;
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      if (!accessToken.value) {
        throw new Error("No access token");
      }

      const { data } = await $fetch<{ data: User }>("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });

      user.value = data;
      if (process.client) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      // If profile fetch fails, try to refresh token
      try {
        await refreshToken();
        return await getProfile();
      } catch (refreshError) {
        await logout();
        throw error;
      }
    }
  };

  // Initialize auth on composable creation
  initAuth();

  return {
    user: readonly(user),
    accessToken: readonly(accessToken),
    isLoggedIn,
    login,
    register,
    logout,
    refreshToken,
    getProfile,
  };
};

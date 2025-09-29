export default defineNuxtRouteMiddleware(async (to) => {
  // Protect /profile and any route with meta.requiresAuth
  const requires =
    to.path.startsWith("/profile") || (to.meta as any)?.requiresAuth;
  if (!requires) return;

  // Try profile first (works server/client with httpOnly cookies), then refresh on 401
  try {
    await $fetch("/api/auth/profile");
    return;
  } catch (err: any) {
    if (err?.status === 401) {
      try {
        await $fetch("/api/auth/refresh", { method: "POST" });
        await $fetch("/api/auth/profile");
        return;
      } catch {
        return navigateTo("/auth/login");
      }
    }
    return navigateTo("/auth/login");
  }
});

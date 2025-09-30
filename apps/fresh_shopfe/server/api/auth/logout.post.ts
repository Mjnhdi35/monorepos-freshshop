export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const authorization = getHeader(event, "authorization");

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/logout`, {
      method: "POST",
      headers: authorization ? { Authorization: authorization } : {},
      credentials: "include",
    });

    // Clear cookies
    deleteCookie(event, "refresh_token");
    deleteCookie(event, "csrf_token");

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.statusMessage || "Logout failed",
    });
  }
});

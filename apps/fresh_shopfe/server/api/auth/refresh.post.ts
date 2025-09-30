export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    // Forward cookies from backend to client
    const setCookieHeaders = getHeader(event, "set-cookie");
    if (setCookieHeaders) {
      setHeader(event, "set-cookie", setCookieHeaders);
    }

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.statusMessage || "Token refresh failed",
    });
  }
});

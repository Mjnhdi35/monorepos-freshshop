export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/login`, {
      method: "POST",
      body,
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
      statusCode: error.statusCode || 400,
      statusMessage: error.statusMessage || "Login failed",
    });
  }
});

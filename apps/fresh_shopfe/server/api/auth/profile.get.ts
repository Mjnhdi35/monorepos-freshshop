export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const authorization = getHeader(event, "authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authorization header required",
    });
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/profile`, {
      headers: {
        Authorization: authorization,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.statusMessage || "Unauthorized",
    });
  }
});

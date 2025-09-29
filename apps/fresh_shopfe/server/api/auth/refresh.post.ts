export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const refreshToken = getCookie(event, "refresh_token");
  const sessionId = getCookie(event, "session_id");

  const data: any = await $fetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    body: { refresh_token: refreshToken, session_id: sessionId },
  });

  // Update cookies if tokens rotated
  // @ts-ignore
  if (data?.access_token || data?.accessToken) {
    // @ts-ignore
    setCookie(event, "access_token", data.access_token ?? data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
    });
  }
  // @ts-ignore
  if (data?.refresh_token) {
    // @ts-ignore
    setCookie(event, "refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
    });
  }
  // @ts-ignore
  if (data?.session_id) {
    // @ts-ignore
    setCookie(event, "session_id", data.session_id, {
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return data;
});

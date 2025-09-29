export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const body = await readBody(event);

  const data: any = await $fetch(`${apiBase}/auth/register`, {
    method: "POST",
    body,
  });

  // If backend returns tokens, persist access token in cookie for FE usage
  // This is optional and depends on your BE response shape
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

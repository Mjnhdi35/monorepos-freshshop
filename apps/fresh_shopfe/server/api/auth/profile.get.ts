export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const token = getCookie(event, "access_token");

  const data: any = await $fetch(`${apiBase}/auth/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return data;
});

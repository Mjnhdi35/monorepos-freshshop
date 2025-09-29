export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const $api = $fetch.create({
    baseURL: apiBase,
  });

  return {
    provide: { api: $api },
  };
});

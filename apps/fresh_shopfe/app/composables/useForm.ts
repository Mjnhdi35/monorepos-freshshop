import { reactive, ref } from "vue";

export function useForm<T extends Record<string, any>>(initial: T) {
  const state = reactive({ ...initial }) as T;
  const errors = reactive<Record<string, string | null>>({});
  const submitting = ref(false);

  function setError(field: string, message: string | null) {
    errors[field] = message;
  }

  function validate(requiredFields: (keyof T)[]) {
    let valid = true;
    for (const field of requiredFields) {
      const value = state[field];
      const empty =
        value === undefined || value === null || String(value).trim() === "";
      errors[String(field)] = empty ? "Required" : null;
      if (empty) valid = false;
    }
    return valid;
  }

  async function submit(
    handler: (values: T) => Promise<any>,
    required: (keyof T)[] = [],
  ) {
    if (required.length && !validate(required)) return;
    submitting.value = true;
    try {
      await handler(state);
    } finally {
      submitting.value = false;
    }
  }

  return { state, errors, submitting, setError, validate, submit };
}

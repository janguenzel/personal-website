// Pure, framework-agnostic translation helper shared by server + client.
// Resolves a dot-path against a (possibly nested) dictionary and interpolates
// {placeholders}. Falls back to the key itself so the UI never renders blank.

export type Messages = Record<string, unknown>;

export type TFunction = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

function resolve(dict: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (
      acc &&
      typeof acc === "object" &&
      part in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Build a `t(key, vars?)` function bound to a dictionary. */
export function createTranslator(dict: Messages): TFunction {
  return (key, vars) => {
    const value = resolve(dict, key);
    if (typeof value === "string") return interpolate(value, vars);
    if (process.env.NODE_ENV !== "production" && value === undefined) {
      console.warn(`[i18n] missing key: ${key}`);
    }
    return key;
  };
}

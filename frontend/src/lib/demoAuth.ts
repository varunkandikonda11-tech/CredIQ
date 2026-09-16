export const LENDER_AUTH_KEY = "creditiq-lender-demo";
export const DEMO_EMAIL = "lender@creditiq.demo";
export const DEMO_PASSWORD = "demo";

function storage(): Storage | null {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

export function isLenderAuthed(): boolean {
  return storage()?.getItem(LENDER_AUTH_KEY) === "1";
}

export function signIn(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
  if (!ok) return false;
  storage()?.setItem(LENDER_AUTH_KEY, "1");
  return true;
}

export function signOut(): void {
  storage()?.removeItem(LENDER_AUTH_KEY);
}

export function lenderEntryPath(): string {
  return isLenderAuthed() ? "/lender" : "/login";
}

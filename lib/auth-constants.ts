export const PENDING_VERIFICATION_KEY = "pcfo.pendingVerificationEmail";

export function setPendingVerification(email: string) {
  try {
    localStorage.setItem(PENDING_VERIFICATION_KEY, email);
  } catch (_) {
    // ignore storage access errors
  }
}

export function clearPendingVerification() {
  try {
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch (_) {
    // ignore storage access errors
  }
}

export function getPendingVerification(): string {
  try {
    return localStorage.getItem(PENDING_VERIFICATION_KEY) || "";
  } catch (_) {
    return "";
  }
}

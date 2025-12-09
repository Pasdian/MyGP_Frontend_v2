// Pull static build version
export const APP_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION || "dev";

const VERSION_KEY = "app_version";

export function reloadIfNeeded() {
  if (typeof window === "undefined") return;

  try {
    const stored = window.localStorage.getItem(VERSION_KEY);

    // If same version → do nothing
    if (stored === APP_VERSION) return;

    // Save new version so it won't re-run after reload
    window.localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Soft reload (no hard reset)
    window.location.reload();
  } catch (err) {
    console.error("sendVersionPingIfNeeded failed:", err);
  }
}

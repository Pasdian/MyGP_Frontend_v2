// Pull version from env. This is static at build time.
export const APP_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION || "dev";

// Store key
const VERSION_KEY = "app_version";

export function runHardResetIfNeeded() {
  if (typeof window === "undefined") return;

  try {
    const stored = window.localStorage.getItem(VERSION_KEY);

    // Nothing to do if same version
    if (stored === APP_VERSION) return;

    // Hard reset everything
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Wipe IndexedDB if supported (best effort)
    if ("indexedDB" in window && typeof indexedDB.databases === "function") {
      indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => db.name && indexedDB.deleteDatabase(db.name));
      });
    }

    // Set new version so it won't re-run after reload
    window.localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Hard reload with clean URL
    window.location.replace(window.location.origin + window.location.pathname);
  } catch (err) {
    console.error("Hard reset failed:", err);
  }
}

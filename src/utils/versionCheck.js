import { dispatch } from '../state.js';

const VERSION_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let launchVersion = null;

async function fetchVersion() {
  const res = await fetch('/version.json?t=' + Date.now());
  if (!res.ok) return null;
  const { version } = await res.json();
  return version;
}

export async function initVersionCheck() {
  launchVersion = await fetchVersion();
  if (!launchVersion) return; // version.json not present (dev environment)

  setInterval(async () => {
    const current = await fetchVersion();
    if (current && current !== launchVersion) {
      dispatch({ type: 'UPDATE_AVAILABLE' });
    }
  }, VERSION_CHECK_INTERVAL_MS);
}

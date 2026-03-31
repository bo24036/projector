import { dispatch } from '../state.js';

const VERSION_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

export function getLaunchVersion() {
  return launchVersion;
}

let launchVersion = null;

async function fetchVersion() {
  const res = await fetch('/version.json?t=' + Date.now());
  if (!res.ok) return null;
  const { version } = await res.json();
  return version;
}

// Effect: check current version against launch version, dispatch if changed,
// then schedule itself to run again after the interval.
export function scheduleVersionCheck() {
  setTimeout(async () => {
    const current = await fetchVersion();
    if (current && current !== launchVersion) {
      dispatch({ type: 'UPDATE_AVAILABLE' });
    } else {
      dispatch({ type: 'SCHEDULE_VERSION_CHECK' });
    }
  }, VERSION_CHECK_INTERVAL_MS);
}

export async function initVersionCheck() {
  launchVersion = await fetchVersion();
  if (!launchVersion) return; // version.json not present (dev environment)
  dispatch({ type: 'SCHEDULE_VERSION_CHECK' });
}

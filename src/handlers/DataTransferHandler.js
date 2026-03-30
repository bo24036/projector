import { registerHandler } from '../state.js';
import { exportData, importData } from '../effects/DataTransferEffects.js';
import { scheduleVersionCheck } from '../utils/versionCheck.js';
import { createNoOpLoadedHandler } from '../utils/handlerFactory.js';

registerHandler('EXPORT_DATA', (state) => {
  return { state, effects: [exportData] };
});

registerHandler('IMPORT_DATA', (state, action) => {
  const { file } = action.payload;
  return { state, effects: [() => importData(file)] };
});

// Triggers a full re-render after caches have been reloaded by importData
createNoOpLoadedHandler('IMPORT_COMPLETE');

registerHandler('UPDATE_AVAILABLE', (state) => {
  return { state: { ...state, updateAvailable: true } };
});

// Re-queues the next version check as an effect, keeping it inside the pipeline.
// Only fires if no update has been found yet — once UPDATE_AVAILABLE is set,
// there's no point continuing to poll.
registerHandler('SCHEDULE_VERSION_CHECK', (state) => {
  if (state.updateAvailable) return { state };
  return { state, effects: [scheduleVersionCheck] };
});

import { registerHandler } from '../state.js';
import { exportData, importData } from '../effects/DataTransferEffects.js';
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

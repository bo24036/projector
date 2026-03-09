import './handlers/ProjectHandler.js';
import { initSidebarConnector } from './ui/connectors/SidebarConnector.js';
import { initProjectDetailConnector } from './ui/connectors/ProjectDetailConnector.js';
import { initRouter } from './utils/router.js';

function initApp() {
  // Initialize router first so it can dispatch initial navigation
  initRouter();

  // Initialize connectors
  initSidebarConnector('#sidebar');
  initProjectDetailConnector('#main-content');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

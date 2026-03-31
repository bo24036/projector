import { registerHandler } from '../state.js';

registerHandler('SELECT_YEAR_END_REPORT', (state) => ({
  state: {
    ...state,
    currentPage: 'yearEndReport',
    currentProjectId: null,
  },
}));

registerHandler('SET_YEAR_END_REPORT_YEAR', (state, action) => ({
  state: { ...state, yearEndReportYear: action.payload.year },
}));

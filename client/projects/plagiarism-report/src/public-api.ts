/*
 * Public API Surface of plagiarism-report
 */

// services
export * from './lib/plagiarism-report/services/copyleaks.service';
export * from './lib/plagiarism-report/services/copyleaks-translate.service';
// components
export * from './lib/plagiarism-report/copyleaks-report.component';
// modules
export * from './lib/plagiarism-report/copyleaks-report.module';
// models
export * from './lib/plagiarism-report/models';
// validation helpers
export * from './lib/plagiarism-report/utils/validation';

// pre-defined configurations
export { DEFAULT_REPORT_CONFIG, DEFAULT_OPTIONS, DEFAULT_TEXT_CONFIG } from './lib/plagiarism-report/utils/constants';

// injection tokens
export {
	COPYLEAKS_CONFIG_INJECTION_TOKEN,
	COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN,
} from './lib/plagiarism-report/utils/constants';

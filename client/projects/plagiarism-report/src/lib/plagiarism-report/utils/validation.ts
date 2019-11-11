import { CopyleaksReportConfig, CopyleaksReportOptions } from '../models';

/**
 * Utility function to test whether a CopyleaksReportOptions object is valid
 * @param options the options object to test
 * @param logErrors  whether to show errors or not. defaults to false
 */
export const isCopyleaksReportOptions = (options: CopyleaksReportOptions, logErrors = false) => {
	if (!options) {
		logErrors && console.warn('config.options can not be null');
		return false;
	}
	if (options.showIdentical && typeof options.showIdentical !== 'boolean') {
		logErrors && console.warn('config.options.showIdentical should be a boolean');
		return false;
	}
	if (options.showMinorChanges && typeof options.showMinorChanges !== 'boolean') {
		logErrors && console.warn('config.options.showMinorChanges should be a boolean');
		return false;
	}
	if (options.showRelated && typeof options.showRelated !== 'boolean') {
		logErrors && console.warn('config.options.showRelated should be a boolean');
		return false;
	}
	if (options.showOnlyTopResults && typeof options.showOnlyTopResults !== 'boolean') {
		logErrors && console.warn('config.options.showOnlyTopResults should be a boolean');
		return false;
	}
	if (options.showPageSources && typeof options.showPageSources !== 'boolean') {
		logErrors && console.warn('config.options.showPageSources should be a boolean');
		return false;
	}
	if (options.setAsDefault && typeof options.setAsDefault !== 'boolean') {
		logErrors && console.warn('config.options.setAsDefault should be a boolean');
		return false;
	}
	return true;
};

/**
 * Utility function to test whether a CopyleaksReportConfig object is valid
 * @param config the config object to test
 * @param logErrors whether to show errors or not. defaults to false
 */
export const isCopyleaksReportConfig = (config: CopyleaksReportConfig, logErrors = false) => {
	if (!config) {
		logErrors && console.warn('config.options can not be null');
		return false;
	}
	if (config.viewMode !== undefined && typeof config.viewMode !== 'string') {
		logErrors && console.warn('config.viewMode should be a string');
		return false;
	}
	if (config.contentMode && typeof config.contentMode !== 'string') {
		logErrors && console.warn('config.contentMode should be a string');
		return false;
	}
	if (config.disableSuspectBackButton && typeof config.disableSuspectBackButton !== 'boolean') {
		logErrors && console.warn('config.disableSuspectBackButton should be a boolean');
		return false;
	}
	if (config.share !== undefined && typeof config.share !== 'boolean') {
		logErrors && console.warn('config.share should be a boolean');
		return false;
	}
	if (config.download !== undefined && typeof config.download !== 'boolean') {
		logErrors && console.warn('config.download should be a boolean');
		return false;
	}
	if (config.options !== undefined && !isCopyleaksReportOptions(config.options, logErrors)) {
		return false;
	}
	if (config.suspectId !== undefined && config.suspectId !== null && typeof config.suspectId !== 'string') {
		logErrors && console.warn('config.suspectId should be a string');
		return false;
	}
	if (config.scanId !== undefined && config.scanId !== null && typeof config.scanId !== 'string') {
		logErrors && console.warn('config.scanId should be a string');
		return false;
	}
	if (config.sourcePage !== undefined && typeof config.sourcePage !== 'number') {
		logErrors && console.warn('config.sourcePage should be a number');
		return false;
	}
	if (config.suspectPage !== undefined && typeof config.suspectPage !== 'number') {
		logErrors && console.warn('config.suspectPage should be a number');
		return false;
	}

	return true;
};

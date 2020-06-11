import { ResultPreview } from './api-models/CompleteResult';

/**
 * Type that holds the options for a report
 * @todo implement `showPageSources`
 * @todo implement `showOnlyTopResults`
 */
export interface CopyleaksReportOptions {
	/**  Display results that are actually visible in the current source page */
	showPageSources?: boolean;
	/** Display only the top 100 results of a scan */
	showOnlyTopResults?: boolean;
	/** Display identical highlights */
	showIdentical?: boolean;
	/** Display minor changes highlights */
	showMinorChanges?: boolean;
	/** Display related meaning highlights */
	showRelated?: boolean;
	/** Set the current options as default using local storage */
	setAsDefault?: boolean;
}

export interface CopyleaksResultCardAction {
	name: string;
	action: (result: ResultPreview) => void;
}

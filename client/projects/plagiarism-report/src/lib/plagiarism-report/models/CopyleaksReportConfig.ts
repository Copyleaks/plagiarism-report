import { CopyleaksReportOptions, CopyleaksResultCardAction } from './ResultsSettings';
import { Type } from '@angular/core';
import { IScanSummeryComponent } from './ScanProperties';

/** possible view modes of the report */
export type ViewMode = 'one-to-many' | 'one-to-one';
/** possible content modes of the report */
export type ContentMode = 'text' | 'html';
/** possible text direction modes of the report */
export type DirectionMode = 'rtl' | 'ltr';

/** Type representing the report configuration and options */
export interface CopyleaksReportConfig {
	resultCardActions?: CopyleaksResultCardAction[];
	/** The content mode the report is displaying */
	contentMode?: ContentMode;
	/** The page of the source document */
	sourcePage?: number;
	/** The page of the suspect document */
	suspectPage?: number;
	/** The view mode of the report is displaying */
	viewMode?: ViewMode;
	/** The report results options */
	options?: CopyleaksReportOptions;
	/** The visibility state of the help button in properties section */
	help?: boolean;
	/** The visibility state of the share button in properties section */
	share?: boolean;
	/** The visibility state of the download button in properties section */
	download?: boolean;
	/** The visibility state of the back button in `one-to-one` view */
	disableSuspectBackButton?: boolean;
	/** The id of the scan the report is displaying */
	scanId?: string;
	/** The init state of the properties expand */
	propertiesExpanded?: boolean;
	/** The suspect that is focused in the report */
	suspectId?: string;
	/** The passed component will be displayed over the results, the Results and Scan Properties sections will be hidden */
	resultsOverlayComponent?: Type<any>;
	/** The passed component will be displayed on scan summary section at the properties bar when the scan is done */
	scanSummaryComponent?: Type<IScanSummeryComponent>;
}

import { MatDialogConfig } from '@angular/material';
import { CopyleaksReportOptions } from './ResultsSettings';

export type ViewMode = 'one-to-many' | 'one-to-one';
export type ContentMode = 'text' | 'html';
export type DirectionMode = 'rtl' | 'ltr';

export interface CopyleaksReportConfig {
	/** The initial content mode */
	contentMode?: ContentMode;
	/** The initial view mode */
	viewMode?: ViewMode;
	/** The initial results options */
	options?: CopyleaksReportOptions;
	/** Flag to display the share button */
	share?: boolean;
	/** Flag to display the download button */
	download?: boolean;
	/** Angular Material Dialog config override for share */
	filterDialogConfig?: MatDialogConfig<any>;
	/** Angular Material Dialog config override for download */
	resultsDialogConfig?: MatDialogConfig<any>;
	/** time in milliseconds to throttle incoming results to prevent calculation */
	throttleResults?: number;
	/** current suspect to focus on */
	suspectId?: string;
}

import { CopyleaksReportOptions } from './ResultsSettings';

export type ViewMode = 'one-to-many' | 'one-to-one';
export type ContentMode = 'text' | 'html';
export type DirectionMode = 'rtl' | 'ltr';

export interface CopyleaksReportConfig {
	contentMode?: ContentMode;
	sourcePage?: number;
	suspectPage?: number;
	viewMode?: ViewMode;
	options?: CopyleaksReportOptions;
	share?: boolean;
	download?: boolean;
	scanId?: string;
	suspectId?: string;
}

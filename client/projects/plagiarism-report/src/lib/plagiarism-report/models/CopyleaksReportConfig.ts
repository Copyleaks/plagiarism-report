import { CopyleaksReportOptions } from './ResultsSettings';

export type ViewMode = 'one-to-many' | 'one-to-one';
export type ContentMode = 'text' | 'html';
export type DirectionMode = 'rtl' | 'ltr';

export interface OneToOneProp<T> {
	source?: T;
	suspect?: T;
}

export interface CopyleaksReportConfig {
	contentMode?: ContentMode | OneToOneProp<ContentMode>;
	page?: number | OneToOneProp<number>;
	viewMode?: ViewMode;
	options?: CopyleaksReportOptions;
	share?: boolean;
	download?: boolean;
	suspectId?: string;
}

export interface InternalCopyleaksReportConfig extends CopyleaksReportConfig {
	contentMode: OneToOneProp<ContentMode>;
	page: OneToOneProp<number>;
}

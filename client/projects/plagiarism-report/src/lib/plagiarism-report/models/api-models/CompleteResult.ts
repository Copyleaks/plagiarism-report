export interface BasicResponse {
	status: ScanStatus;
	error?: ScanError;
	developerPayload?: string;
}

export interface ScanError {
	message?: string;
	code: number;
}

export interface CompleteResult extends BasicResponse {
	scannedDocument: ScannedDocument;
	results: ResultPreviews;
}

export interface ResultPreviews {
	internet: InternetResultPreview[];
	database: DatabaseResultPreview[];
	batch: BatchResultPreview[];
	score: Score;
}
export enum ScanStatus {
	Success = 0,
	Error = 1,
	CreditsChecked = 2,
	Indexed = 3,
}

export interface ScannedDocument {
	scanId: string;
	totalWords: number;
	totalExcluded: number;
	credits: number;
	creationTime: string;
}

export interface Score {
	identicalWords: number;
	minorChangedWords: number;
	relatedMeaningWords: number;
	aggregatedScore: number;
}

interface ResultPreviewBase {
	id: string;
	title: string;
	introduction: string;
	matchedWords: number;
	scanId?: string | void;
	url?: string | void;
}

export interface InternetResultPreview extends ResultPreviewBase {
	url: string;
	scanId: void;
}
export interface DatabaseResultPreview extends ResultPreviewBase {
	url: void;
	scanId?: string;
}
export interface BatchResultPreview extends ResultPreviewBase {
	scanId: string;
	url: void;
}

export type ResultPreview = InternetResultPreview | DatabaseResultPreview | BatchResultPreview;

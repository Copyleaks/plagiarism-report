/** A basic response from Copyleaks api */
export interface BasicResponse {
	status: ScanStatus;
	error?: ScanError;
	developerPayload?: string;
}

/** An error response from Copyleaks api */
export interface ScanError {
	message?: string;
	code: number;
}

/** A scan complete response from Copyleaks api */
export interface CompleteResult extends BasicResponse {
	scannedDocument: ScannedDocument;
	results: ResultPreviews;
}

/**
 * A result preview of a complete response from Copyleaks api
 */
export interface ResultPreviews {
	internet: InternetResultPreview[];
	database: DatabaseResultPreview[];
	batch: BatchResultPreview[];
	score: Score;
}

/** Enum representing the status of a scan */
export enum ScanStatus {
	Success = 0,
	Error = 1,
	CreditsChecked = 2,
	Indexed = 3,
}

/** Type representing a summary of the scanned document from Copyleaks api */
export interface ScannedDocument {
	scanId: string;
	totalWords: number;
	totalExcluded: number;
	credits: number;
	creationTime: string;
}

/** Type representing a summary of the reuslts of a scanned document */
export interface Score {
	identicalWords: number;
	minorChangedWords: number;
	relatedMeaningWords: number;
	aggregatedScore: number;
}

/** Base type for a result preview  */
interface ResultPreviewBase {
	id: string;
	title: string;
	introduction: string;
	matchedWords: number;
	scanId?: string | void;
	url?: string | void;
}

/** Type containing a preview of a result from the internet */
export interface InternetResultPreview extends ResultPreviewBase {
	url: string;
	scanId: void;
}
/** Type containing a preview of a result from the copyleaks database */
export interface DatabaseResultPreview extends ResultPreviewBase {
	url: void;
	scanId?: string;
}
/** Type containing a preview of a result from a batch scan */
export interface BatchResultPreview extends ResultPreviewBase {
	scanId: string;
	url: void;
}
/** Type containing some preview of a result from copyleaks api */
export type ResultPreview = InternetResultPreview | DatabaseResultPreview | BatchResultPreview;

/** Enum representing the access of a result */
export enum ResultAccess {
	full,
	locked,
}

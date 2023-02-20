import { Match } from './Matches';

export interface AIScanResult {
	results: AIScanResultItem[];
	summary: AIScanResultSummary;
	scannedDocument: AIScannedDocument;
}

export interface AIScannedDocument {
	scanId: string;
	creationTime: string;
}

export interface AIScanResultSummary {
	human: number;
	ai: number;
	unknown: number;
	another_writer_score: number;
}

export interface AIScanResultItem {
	classification: EMatchClassification;
	probability: number;
	matches: AIScanResultMatch[];
}

export interface AIScanResultMatch {
	text: {
		chars: AIScanResultMatchChar;
		words: AIScanResultMatchChar;
	};
}

export interface AIScanResultMatchChar {
	starts: number[];
	lengths: number[];
}

export enum EMatchClassification {
	Unknown = 0,
	Human = 1,
	AI = 2,
	SameWriter = 3,
	AnotherWriter = 4,
}

export interface AIMatch extends Match {
	totalWords: number;
	classification: EMatchClassification;
	probability: number;
}

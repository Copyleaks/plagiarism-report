export interface ScanResult {
	statistics: Statistics;
	text: ResultTextSection;
	html: ResultHtmlSection;
	version: number;
}

interface Statistics {
	identical: number;
	minorChanges: number;
	relatedMeaning: number;
}

interface ResultBase {
	comparison: ComparisonCollection;
	value?: string;
}
export interface ResultHtmlSection extends ResultBase {
	value?: string;
}
export interface ResultTextSection extends ResultBase {
	value: string;
	pages: {
		startPosition: number[];
	};
}

export interface ComparisonCollection {
	identical: Comparison;
	minorChanges: Comparison;
	relatedMeaning: Comparison;
}

interface ComparisonBase {
	source: ComparisonData;
	suspected: ComparisonData;
}
export interface TextComparison extends ComparisonBase {
	groupId: void;
}
export interface HtmlComparison extends ComparisonBase {
	groupId: number[];
}

export type Comparison = TextComparison | HtmlComparison;
export interface ComparisonData {
	chars: ComparisonRange;
	words: ComparisonRange;
}
export interface ComparisonRange {
	starts: number[];
	lengths: number[];
}

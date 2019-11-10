/** Type representing a scan result from copyleaks api */
export interface ScanResult {
	statistics: Statistics;
	text: ResultTextSection;
	html: ResultHtmlSection;
	version: number;
}

/** Type representing the statistics section of a scan result */
interface Statistics {
	identical: number;
	minorChanges: number;
	relatedMeaning: number;
}

/** Base type of a result of some content */
interface ResultBase {
	comparison: ComparisonCollection;
	value?: string;
}

/** Type representing a result of `html` content */
export interface ResultHtmlSection extends ResultBase {
	value?: string;
}
/** Type representing a result of `text` content */
export interface ResultTextSection extends ResultBase {
	value: string;
	pages: {
		startPosition: number[];
	};
}

/** Base type of a comparison */
interface ComparisonBase {
	source: ComparisonData;
	suspected: ComparisonData;
}
/** Type representing a `text` comparison of a scan result */
export interface TextComparison extends ComparisonBase {
	groupId: void;
}
/** Type representing an `html` comparison of a scan result */
export interface HtmlComparison extends ComparisonBase {
	groupId: number[];
}

/** Type representing a comparison of some content */
export type Comparison = TextComparison | HtmlComparison;

/** Type representing a bunch of comparisons of a scan result */
export interface ComparisonCollection {
	identical: Comparison;
	minorChanges: Comparison;
	relatedMeaning: Comparison;
}

/** Type representing the data of a comparison */
export interface ComparisonData {
	chars: ComparisonRange;
	words: ComparisonRange;
}
/** Type representing the matches of a comparison of some kind */
export interface ComparisonRange {
	starts: number[];
	lengths: number[];
}

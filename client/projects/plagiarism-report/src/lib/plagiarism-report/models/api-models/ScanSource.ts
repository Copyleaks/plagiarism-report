/** Type representing the crawled version of a source document from Copyleaks api */
export interface ScanSource {
	metadata: SourceMetadataSection;
	text: SourceTextSection;
	html: SourceHtmlSection;
	version?: number;
}

/** Type representing the metadata of a source document */
export interface SourceMetadataSection {
	words: number;
	excluded: number;
}

/** Type representing `html` data of a source document */
export interface SourceHtmlSection {
	exclude: HtmlExclude;
	value: string;
}

/** Type representing `text` data of a source document */
export interface SourceTextSection {
	exclude: TextExclude;
	pages: {
		startPosition: number[];
	};
	value: string;
}

/** Base type for representing an excluded part of source document's content */
export interface BaseExclude {
	starts: number[];
	lengths: number[];
	reasons: ExcludeReason[];
}

/** Type representing excluded `html` of a source document */
export interface HtmlExclude extends BaseExclude {
	groupIds: number[];
}

/** Type representing excluded `text` of a source document */
export interface TextExclude extends BaseExclude {
	groupIds: void;
}

/** Enum representing reasons for exclusion */
export enum ExcludeReason {
	Quotation = 1,
	Reference = 2,
	Header = 3,
	Footer = 4,
	HtmlTemplate = 5,
	TableOfContent = 6,
	CodeComments = 7,
	PartialScan = 8,
}

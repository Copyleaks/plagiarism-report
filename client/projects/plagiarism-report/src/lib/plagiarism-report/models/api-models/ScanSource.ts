export interface ScanSource {
	metadata: SourceMetadataSection;
	text: SourceTextSection;
	html?: SourceHtmlSection;
	version?: number;
}

export interface SourceMetadataSection {
	words: number;
	excluded: number;
}

export interface SourceHtmlSection {
	exclude: HtmlExclude;
	value: string;
}

export interface SourceTextSection {
	exclude: TextExclude;
	pages: {
		startPosition: number[];
	};
	value: string;
}

export interface BaseExclude {
	starts: number[];
	lengths: number[];
	reasons: ExcludeReason[];
}

export interface HtmlExclude extends BaseExclude {
	groupIds: number[];
}

export interface TextExclude extends BaseExclude {
	groupIds: void;
}

export enum ExcludeReason {
	Quotation = 1,
	Reference = 2,
	Header = 3,
	Footer = 4,
	HtmlTemplate = 5,
	TableOfContent = 6,
}

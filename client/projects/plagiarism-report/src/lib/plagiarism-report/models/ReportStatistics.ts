/**
 * Type that holds the statistic for a scan process
 */
export interface ReportStatistics {
	/** Total percentage of similar content compared to original submission. */
	aggregatedScore?: number;
	/** Number of identical words matched in this scan */
	identical: number;
	/** Number of minor changed words matched in this scan */
	minorChanges: number;
	/** Number of related meaning words matched in this scan */
	relatedMeaning: number;
	/** Number of omitted words matched in this scan */
	omittedWords: number;
	/** Number of words in this scan */
	total?: number;
}

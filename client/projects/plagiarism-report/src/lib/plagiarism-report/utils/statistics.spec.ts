import { CompleteResult, ResultItem, CopyleaksReportOptions } from '../models';

describe('calculateStatistics', () => {
	fdescribe('test #1', () => {
		const complete: CompleteResult = {
			scannedDocument: {
				totalWords: 0,
				totalExcluded: 0,
			},
		} as CompleteResult;
		const options: CopyleaksReportOptions = {
			showIdentical: true,
			showMinorChanges: true,
			showRelated: true,
		} as CopyleaksReportOptions;
		const results: ResultItem[] = [
			{
				id: 'x',
				result: {
					text: {
						comparison: {
							identical: {
								source: {
									words: {
										starts: [
											1,
											16,
											29,
											82,
											88,
											90,
											116,
											137,
											145,
											149,
											154,
											160,
											213,
											235,
											267,
											285,
											331,
											335,
											350,
											359,
											363,
											409,
											423,
											460,
											498,
											544,
											558,
											578,
											595,
											623,
											629,
										],
										lengths: [
											3,
											5,
											4,
											2,
											0,
											3,
											19,
											6,
											2,
											2,
											3,
											51,
											20,
											30,
											16,
											44,
											0,
											4,
											3,
											3,
											44,
											12,
											35,
											31,
											45,
											3,
											3,
											3,
											4,
											3,
											3,
										],
									},
								},
							},
							minorChanges: {
								source: {
									words: {
										starts: [22, 25, 34, 85, 86, 95, 144, 152, 158, 212, 284, 422],
										lengths: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
									},
								},
							},
							relatedMeaning: {
								source: {
									words: {
										starts: [
											5,
											24,
											35,
											87,
											89,
											94,
											98,
											330,
											333,
											340,
											355,
											408,
											492,
											548,
											549,
											562,
											583,
											600,
											601,
											627,
										],
										lengths: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
									},
								},
							},
						},
					},
				},
			} as ResultItem,
			{
				id: 'y',
				result: {
					text: {
						comparison: {
							identical: {
								source: {
									words: {
										starts: [1, 5, 11, 16, 60, 64, 88, 137, 145, 149, 213, 235, 267, 285, 356, 409, 423, 460, 494, 566],
										lengths: [2, 4, 2, 25, 2, 20, 47, 6, 2, 62, 20, 30, 16, 68, 51, 12, 35, 32, 70, 67],
									},
								},
							},
							minorChanges: {
								source: {
									words: {
										starts: [0, 85, 144, 212, 284, 354, 422, 565],
										lengths: [0, 0, 0, 0, 0, 0, 0, 0],
									},
								},
							},
							relatedMeaning: {
								source: {
									words: {
										starts: [4, 63, 87, 136, 234, 355, 408, 459],
										lengths: [0, 0, 0, 0, 0, 0, 0, 0],
									},
								},
							},
						},
					},
				},
			} as ResultItem,
		];
	});
});

import { ComparisonCollection } from '../models';
import { Match, MatchType } from '../models/Matches';
import * as helpers from './highlight-helpers';

describe('Highlight Helpers', () => {
	describe('findRespectivePage', () => {
		it(`should find the correct page`, () => {
			expect(helpers.findRespectivePage(0, [0, 50, 100])).toBe(1);
			expect(helpers.findRespectivePage(49, [0, 50, 100])).toBe(1);
			expect(helpers.findRespectivePage(50, [0, 50, 100])).toBe(2);
			expect(helpers.findRespectivePage(99, [0, 50, 100])).toBe(2);
			expect(helpers.findRespectivePage(100, [0, 50, 100])).toBe(3);
			expect(helpers.findRespectivePage(500, [0, 50, 100])).toBe(3);
		});
	});
	describe('findPartial', () => {
		const comparisons = {
			identical: {
				source: {
					chars: {
						starts: [50, 0, 100],
						lengths: [49, 49, 1000],
					},
				},
			},
		} as ComparisonCollection;
		it(`should find the correct start position`, () => {
			expect(helpers.findPartialMatch({ start: 0, end: 25 } as Match, comparisons)).toBe(0);
			expect(helpers.findPartialMatch({ start: 25, end: 49 } as Match, comparisons)).toBe(0);
			expect(helpers.findPartialMatch({ start: 50, end: 75 } as Match, comparisons)).toBe(50);
			expect(helpers.findPartialMatch({ start: 75, end: 99 } as Match, comparisons)).toBe(50);
			expect(helpers.findPartialMatch({ start: 100, end: 500 } as Match, comparisons)).toBe(100);
			expect(helpers.findPartialMatch({ start: 500, end: 1100 } as Match, comparisons)).toBe(100);
		});
	});

	describe('findRespectiveMatch', () => {
		const type = MatchType.identical;
		const comparisons = {
			identical: {
				source: {
					chars: {
						starts: [0, 50, 100],
						lengths: [5, 5, 5],
					},
				},
				suspected: {
					chars: {
						starts: [70, 20, 120],
						lengths: [5, 5, 5],
					},
				},
			},
		} as ComparisonCollection;
		it(`should find the correct start position`, () => {
			expect(helpers.findRespectiveMatch({ type, start: 0 } as Match, comparisons, true)).toEqual([0, 70]);
			expect(helpers.findRespectiveMatch({ type, start: 50 } as Match, comparisons, true)).toEqual([50, 20]);
			expect(helpers.findRespectiveMatch({ type, start: 100 } as Match, comparisons, true)).toEqual([100, 120]);

			expect(helpers.findRespectiveMatch({ type, start: 20 } as Match, comparisons, false)).toEqual([20, 50]);
			expect(helpers.findRespectiveMatch({ type, start: 70 } as Match, comparisons, false)).toEqual([70, 0]);
			expect(helpers.findRespectiveMatch({ type, start: 120 } as Match, comparisons, false)).toEqual([120, 100]);
		});
	});
});

import { MatchType, Match } from '../models/Matches';
import { mergeMatches, fillMissingGaps } from './match-helpers';
describe('match-helpers', () => {
	describe('mergeMatches', () => {
		describe('for two simple overlaping matches - ', () => {
			const data: Match[] = [
				{ start: 0, end: 7, type: 0, ids: ['A'] },
				{ start: 5, end: 12, type: 1, ids: ['B'] },
			];
			it('it should group matches correctly', () => {
				const result: Match[] = mergeMatches(data);
				expect(result).toEqual(
					expect.arrayContaining([
						expect.objectContaining({ start: 0, end: 5, type: 0, ids: expect.arrayContaining(['A']) }),
						expect.objectContaining({ start: 5, end: 7, type: 0, ids: expect.arrayContaining(['A', 'B']) }),
						expect.objectContaining({ start: 7, end: 12, type: 1, ids: expect.arrayContaining(['B']) }),
					])
				);
			});
		});
		describe('pdf case', () => {
			const data: Match[] = [
				{ start: 213, end: 228, type: 1, ids: ['A'] },
				{ start: 221, end: 246, type: 0, ids: ['A'] },
			];
			it('same ids but different types', () => {
				const result: Match[] = mergeMatches(data);
				expect(result).toEqual(
					expect.arrayContaining([
						expect.objectContaining({ start: 213, end: 221, type: 1, ids: expect.arrayContaining(['A']) }),
						expect.objectContaining({ start: 221, end: 246, type: 0, ids: expect.arrayContaining(['A']) }),
					])
				);
			});
		});
	});

	describe('groupIntervals', () => {
		it(`should internal overlaping intervals`, () => {
			const result = mergeMatches([
				{ start: 0, end: 7, type: 0, ids: ['A'] },
				{ start: 5, end: 12, type: 0, ids: ['B'] },
			]);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ start: 0, end: 5, type: 0, ids: expect.arrayContaining(['A']) }),
					expect.objectContaining({ start: 5, end: 7, type: 0, ids: expect.arrayContaining(['A', 'B']) }),
					expect.objectContaining({ start: 7, end: 12, type: 0, ids: expect.arrayContaining(['B']) }),
				])
			);
		});

		it(`should transform overlaping intervals`, () => {
			const result = mergeMatches([
				{ start: 0, end: 7, type: MatchType.identical, ids: ['A'] },
				{ start: 0, end: 3, type: MatchType.identical, ids: ['B'] },
			]);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						start: 0,
						end: 3,
						type: MatchType.identical,
						ids: expect.arrayContaining(['A', 'B']),
					}),
					expect.objectContaining({
						start: 3,
						end: 7,
						type: MatchType.identical,
						ids: expect.arrayContaining(['A']),
					}),
				])
			);
		});
	});
	describe('withGapIntervals', () => {
		const content = 'what is this';
		it(`for content "${content}" and intervals: (2,4,i) (5,7,i) to (0,2,n) (2,4,i) (4,5,n) (5,7,i) (7,12,n)`, () => {
			const data: Match[] = [
				{ start: 2, end: 4, type: MatchType.identical },
				{ start: 5, end: 7, type: MatchType.identical },
			];
			const result = fillMissingGaps(data, content.length);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ start: 0, end: 2, type: MatchType.none }),
					expect.objectContaining({ start: 2, end: 4, type: MatchType.identical }),
					expect.objectContaining({ start: 4, end: 5, type: MatchType.none }),
					expect.objectContaining({ start: 5, end: 7, type: MatchType.identical }),
					expect.objectContaining({ start: 7, end: 12, type: MatchType.none }),
				])
			);
		});

		it(`for content "${content}" and intervals: (5,7,i) to (0,5,n) (5,7,i) (7,12,n)`, () => {
			const data: Match[] = [{ start: 5, end: 7, type: MatchType.identical }];
			const result = fillMissingGaps(data, content.length);
			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ start: 0, end: 5, type: MatchType.none }),
					expect.objectContaining({ start: 5, end: 7, type: MatchType.identical }),
					expect.objectContaining({ start: 7, end: 12, type: MatchType.none }),
				])
			);
		});
	});
});

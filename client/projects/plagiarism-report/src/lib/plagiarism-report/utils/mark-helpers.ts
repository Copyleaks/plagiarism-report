import { SlicedMatch, MatchType, ComparisonCollection, Match, Comparison } from '../models';

/**
 * Find the respective match for a given match directive element containing a match object
 * If the match is from the source, the return value will contain the source index first, and
 * then the suspect's index, and vice versa.
 * @param match the match directive element
 * @param result the suspect currently viewed
 * @returns pair of indices.
 */
export const findRespectiveMatch = (
	match: Match,
	comparisons: ComparisonCollection,
	isSource = true
): [number, number] => {
	const { type, start } = match;
	const { source: original, suspected: suspect } = comparisons[MatchType[type]] as Comparison;
	const [source, target] = isSource ? [original, suspect] : [suspect, original];
	const index = source.chars.starts.findIndex((s, i) => s <= start && start <= s + source.chars.lengths[i]);
	return [source.chars.starts[index], target.chars.starts[index]];
};

/**
 * Calculates the 1-based page number of where the start position should be
 * @param start the start position
 * @param pages array of start positions
 */
export const findRespectivePage = (start: number, pages: number[]): number => {
	let page: number;
	for (page = 1; page < pages.length; page++) {
		if (start < pages[page]) {
			break;
		}
	}
	return page;
};

/**
 * Search source for a match containing the given match's start position and return that match's start position
 * @param start the match to look for
 * @param source the scan source object.
 */
export const findPartialMatch = (match: Match, suspect: ComparisonCollection): number => {
	const { start, end } = match;
	const { identical, minorChanges, relatedMeaning } = suspect;
	for (const comparison of [identical, minorChanges, relatedMeaning]) {
		if (!comparison) {
			continue;
		}
		const { source } = comparison;
		const found = source.chars.starts.find((s, i) => s <= start && end <= s + source.chars.lengths[i]);
		if (found !== undefined) {
			return found;
		}
	}
};

/**
 * Locate the index of the next page that contains some match
 * @param matches the matches to look up in
 * @param current the index of the current match
 */
export const findNextPageWithMatch = (matches: SlicedMatch[][], current: number): number => {
	for (let i = current; i < matches.length; i++) {
		if (matches[i].some(match => match.match.type !== MatchType.none)) {
			return i + 1;
		}
	}
	return current;
};

/**
 * Locate the index of the previouse page that contains some match
 * @param matches the current active matches
 * @param current the index of the current match
 */
export const findPrevPageWithMatch = (matches: SlicedMatch[][], current: number): number => {
	for (let i = current - 2; i >= 0; i--) {
		if (matches[i].some(match => match.match.type !== MatchType.none)) {
			return i + 1;
		}
	}
	return current;
};

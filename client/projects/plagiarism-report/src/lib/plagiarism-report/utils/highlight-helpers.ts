import {
	Comparison,
	ComparisonKey,
	ContentKey,
	EndpointKind,
	Match,
	MatchEndpoint,
	MatchType,
	ResultItem,
	ScanSource,
	SlicedMatch,
	SubjectResultKey,
	CopyleaksReportOptions,
} from '../models';

/** A reduce function to extrace `MatchEndpoint`s */
const extractMatchEndpoints = (acc: MatchEndpoint[], curr: Match): MatchEndpoint[] => {
	acc.push({
		index: curr.start,
		type: curr.type,
		kind: EndpointKind.start,
		ids: [...curr.ids],
		gid: curr.gid,
		reason: curr.reason,
	});
	acc.push({
		index: curr.end,
		type: curr.type,
		kind: EndpointKind.end,
		ids: [...curr.ids],
		gid: curr.gid,
		reason: curr.reason,
	});
	return acc;
};
/**
 * Takes a list of matches and push the missing gaps as matches with type of MatchType.none
 */
export const fillMissingGaps = (intervals: Match[], length: number): Match[] => {
	let start = 0;
	const end = length;
	if (intervals.length === 0) {
		return [{ start, end, type: MatchType.none }];
	}
	for (let i = 0; i < intervals.length; i++) {
		const current = intervals[i];
		if (start < current.start) {
			intervals.splice(i, 0, { start, end: current.start, type: MatchType.none });
			i++;
		}
		start = current.end;
	}
	const last = intervals[intervals.length - 1];
	if (intervals[intervals.length - 1].end < end) {
		intervals.push({ start: last.end || 0, end, type: MatchType.none });
	}
	return intervals;
};

/**
 * TODO
 */
const mergeMathchesInNestFast = (matches: Match[]): Match[] => {
	const uniqueMatches = matches.slice(1).reduce(
		(prev: Match[], curr: Match) => {
			const last = prev[prev.length - 1];
			if (last.start === curr.start && last.end === curr.end) {
				last.type = Math.min(last.type, curr.type);
				last.ids = [...new Set([...curr.ids, ...last.ids])];
			} else {
				prev.push(curr);
			}
			return prev;
		},
		[matches[0]]
	);
	if (uniqueMatches.length === 1) {
		return uniqueMatches;
	}
};
/**
 * divide a list of `matches` into nests of none distinct ranges
 * @param matches the base `matches` to process
 */
export const findNests = (matches: Match[]): Match[][] => {
	if (matches.length === 0) {
		return [];
	}
	matches.sort((a, b) => a.start - b.start || a.end - b.end || a.type - b.type);
	const nests: Match[][] = [[matches[0]]];
	let nestFurthestEnd = matches[0].end;
	for (const interval of matches.slice(1)) {
		if (interval.start > nestFurthestEnd) {
			nests.push([interval]);
			nestFurthestEnd = interval.end;
		} else {
			nests[nests.length - 1].push(interval);
			nestFurthestEnd = Math.max(nestFurthestEnd, interval.end);
		}
	}
	return nests;
};

/**
 * merge the overlapping ranges (matches) within a list of none distinct ranges
 * preserving the match ids and deciding the match type based on priority
 * @param matches the matches to merge - should not include distinct ranges (gaps)
 */
const mergeMatchesInNest = (matches: Match[]): Match[] => {
	const uniqueMatches = matches.slice(1).reduce(
		(prev: Match[], curr: Match) => {
			const last = prev[prev.length - 1];
			if (last.start === curr.start && last.end === curr.end) {
				last.type = Math.min(last.type, curr.type);
				if (last.ids.indexOf(curr.ids[0]) === -1) {
					last.ids.push(curr.ids[0]);
				}
			} else {
				prev.push(curr);
			}
			return prev;
		},
		[matches[0]]
	);

	if (uniqueMatches.length === 1) {
		return uniqueMatches;
	}

	const endpoints = uniqueMatches
		.reduce(extractMatchEndpoints, [])
		.sort((a, b) => a.index - b.index || b.kind - a.kind);

	const results: Match[] = [];
	const idsSet = new Set<string>();
	const types: number[] = [0, 0, 0, 0];
	let start: number;
	for (const { index, type, ids, kind, gid, reason } of endpoints) {
		if (kind === EndpointKind.start) {
			if (start !== undefined) {
				if (index !== start) {
					results.push({ start, end: index, type: types.findIndex(x => x > 0), ids: [...idsSet], gid, reason });
				}
			}
			ids.forEach(id => idsSet.add(id));
			types[type]++;
			start = index;
		}
		if (kind === EndpointKind.end) {
			if (index !== start) {
				results.push({ start, end: index, type: types.findIndex(x => x > 0), ids: [...idsSet], gid, reason });
			}
			ids.forEach(id => idsSet.delete(id));
			types[type]--;
			start = idsSet.size === 0 ? undefined : index;
		}
	}

	return results;
};

/**
 * merge a list of matches , removing overlaps while preserving the match attributes
 * @param matches the list of matches
 */
export const mergeMatches = (matches: Match[]): Match[] => {
	const nests = findNests(matches);
	const merged = nests.reduce((prev: Match[], nest: Match[]) => {
		const joined = mergeMatchesInNest(nest);
		return prev.concat(joined);
	}, []);
	return merged;
};

/**
 * split `content` according to the given `matches` the result should contain a list of matches
 * for every page according to `pages`
 * @param content a string representing scan **text** or **html**
 * @param pages an array where every element is a start position of a page
 * @param matches `matches` containing the data to slice the `content`
 */
export const paginateMatches = (content: string, pages: number[], matches: Match[]): SlicedMatch[][] => {
	const result: SlicedMatch[][] = [[]];
	let page = 0;
	for (let match of matches) {
		if (match.start >= pages[page + 1]) {
			page++;
			result[page] = [];
		}
		if (match.end < pages[page + 1]) {
			result[page].push({ content: content.slice(match.start, match.end), match });
		} else {
			while (match.end > pages[page + 1]) {
				const complement = { ...match, start: pages[page + 1] };
				match.end = pages[page + 1] - 1;
				result[page].push({ content: content.slice(match.start, match.end), match });
				match = complement;
				page++;
				result[page] = [];
			}
			result[page].push({ content: content.slice(match.start, match.end), match });
		}
	}
	return result;
};
/**
 * Higher order function that returns a function that extracts Match Intervals from a Result
 * @param comparison name of the comparison type to extract ( identical | minorChanges | relatedMeaning)
 * @param content name of the content to extract from ( text | html )
 * @param subject name of the subject to extract from ( source | suspected)
 */
const extractMatches = (comparison: ComparisonKey, content: ContentKey, subject: SubjectResultKey) => (
	item: ResultItem
) => {
	const { result, id } = item;
	const gids = result[content].comparison[comparison].groupId || [];
	const { starts, lengths } = result[content].comparison[comparison][subject].chars;
	return starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i],
			type: MatchType[comparison],
			ids: [id],
			gid: gids[i],
		})
	);
};

/**
 * Higher order function that returns a function that extracts Excluded intervals from the source document
 * @param content name of the content to extract from (text | html)
 */
const extractExcluded = (content: ContentKey) => (source: ScanSource) => {
	const { starts, lengths, groupIds, reasons } = source[content].exclude;
	return starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i],
			type: MatchType.excluded,
			reason: reasons[i],
			ids: [],
			gid: groupIds && groupIds[i],
		})
	);
};
/** A function to extract `identical` matches from the `text` of a `source` document */
export const extractIdenticalFromSourceText = extractMatches('identical', 'text', 'source');
/** A function to extract `relatedMeaning` matches from the `text` of a `source` document */
export const extractRelatedMeaningFromSourceText = extractMatches('relatedMeaning', 'text', 'source');
/** A function to extract `minorChanges` matches from the `text` of a `source` document */
export const extractMinorChangesFromSourceText = extractMatches('minorChanges', 'text', 'source');
/** A function to extract `identical` matches from the `html` of a `source` document */
export const extractIdenticalFromSourceHtml = extractMatches('identical', 'html', 'source');
/** A function to extract `relatedMeaning` matches from the `html` of a `source` document */
export const extractRelatedMeaningFromSourceHtml = extractMatches('relatedMeaning', 'html', 'source');
/** A function to extract `minorChanges` matches from the `html` of a `source` document */
export const extractMinorChangesFromSourceHtml = extractMatches('minorChanges', 'html', 'source');
/** A function to extract `identical` matches from the `text` of a `suspect` document */
export const extractIdenticalFromSuspectText = extractMatches('identical', 'text', 'suspected');
/** A function to extract `relatedMeaning` matches from the `text` of a `suspect` document */
export const extractRelatedMeaningFromSuspectText = extractMatches('relatedMeaning', 'text', 'suspected');
/** A function to extract `minorChanges` matches from the `text` of a `suspect` document */
export const extractMinorChangesFromSuspectText = extractMatches('minorChanges', 'text', 'suspected');
/** A function to extract `identical` matches from the `html` of a `suspect` document */
export const extractIdenticalFromSuspectHtml = extractMatches('identical', 'html', 'suspected');
/** A function to extract `relatedMeaning` matches from the `html` of a `suspect` document */
export const extractRelatedMeaningFromSuspectHtml = extractMatches('relatedMeaning', 'html', 'suspected');
/** A function to extract `minorChanges` matches from the `html` of a `suspect` document */
export const extractMinorChangesFromSuspectHtml = extractMatches('minorChanges', 'html', 'suspected');
/** A function to extract `excluded` matches from the `text` of a `source` document */
export const extractExcludedFromSourceText = extractExcluded('text');
/** A function to extract `excluded` matches from the `html` of a `source` document */
export const extractExcludedFromSourceHtml = extractExcluded('html');

/**
 * Locate the respective match start index for a given index in the given comparison.
 * If `fromSource` is set to true, the initial index is assumed to be from the comparison source
 * and therefore will search in the respective `ComparisonData`. Returns a tuple of two indices
 * where the first number is start index of the respective match, and the second is the start index
 * of the closest match to the initially given index
 * @param index a position on the text/html that covers a match
 * @param comparison comparison relevant to the match type and associated content
 * @param fromSource flag indicating that `index` is coming from the source suspect
 */
export const findRespectiveStart = (index: number, comparison: Comparison, fromSource = true): [number, number] => {
	const { source, suspected } = comparison;
	const [from, to] = fromSource ? [source, suspected] : [suspected, source];
	const found = from.chars.starts.findIndex((s, i) => s <= index && index <= s + source.chars.lengths[i]);
	return [to.chars.starts[found], from.chars.starts[found]];
};

/**
 * This function will process one or more results and generate a list of match intervals that will help
 * highlight the source html with respect to user settings and match type priority
 * @param results one or more result item on which the calculation will be based on
 * @param settings the current user settings
 * @param source the scan source
 */
export const processSourceText = (
	results: ResultItem | ResultItem[],
	settings: CopyleaksReportOptions,
	source: ScanSource
) => {
	if (!source || !source.text) {
		return null;
	}
	const items = [].concat(results);
	const identical = settings.showIdentical
		? items.reduce((acc, res) => acc.concat(extractIdenticalFromSourceText(res)), [])
		: [];
	const minor = settings.showMinorChanges
		? items.reduce((acc, res) => acc.concat(extractMinorChangesFromSourceText(res)), [])
		: [];
	const related = settings.showRelated
		? items.reduce((acc, res) => acc.concat(extractRelatedMeaningFromSourceText(res)), [])
		: [];
	const excluded = extractExcludedFromSourceText(source);
	const grouped = mergeMatches([...identical, ...minor, ...related, ...excluded]);
	const filled = fillMissingGaps(grouped, source.text.value.length);
	return paginateMatches(source.text.value, source.text.pages.startPosition, filled);
};

/**
 * This function will process one result and generate a list of match intervals that will help
 * highlight the suspect text with respect to user settings and match type priority
 * @param suspect the suspect result item
 * @param settings the current user settings
 */
export const processSuspectText = (suspect: ResultItem, settings: CopyleaksReportOptions): SlicedMatch[][] => {
	if (!suspect) {
		return null;
	}
	const identical = settings.showIdentical ? extractIdenticalFromSuspectText(suspect) : [];
	const minor = settings.showMinorChanges ? extractMinorChangesFromSuspectText(suspect) : [];
	const related = settings.showRelated ? extractRelatedMeaningFromSuspectText(suspect) : [];
	const grouped = mergeMatches([...identical, ...minor, ...related]);
	const filled = fillMissingGaps(grouped, suspect.result.text.value.length);
	return paginateMatches(suspect.result.text.value, suspect.result.text.pages.startPosition, filled);
};

/**
 * This function will process one or more results and generate a list of match intervals that will help
 * highlight the source html with respect to user settings and match type priority
 * @param results one or more result item on which the calculation will be based on
 * @param settings the current user settings
 * @param source the scan source
 */
export const processSourceHtml = (
	results: ResultItem | ResultItem[],
	settings: CopyleaksReportOptions,
	source: ScanSource
) => {
	if (!source || !source.html) {
		return null;
	}
	const items = [].concat(results);
	const identical = settings.showIdentical
		? items.reduce((acc, res) => acc.concat(extractIdenticalFromSourceHtml(res)), [])
		: [];
	const minor = settings.showMinorChanges
		? items.reduce((acc, res) => acc.concat(extractMinorChangesFromSourceHtml(res)), [])
		: [];
	const related = settings.showRelated
		? items.reduce((acc, res) => acc.concat(extractRelatedMeaningFromSourceHtml(res)), [])
		: [];
	const excluded = extractExcludedFromSourceHtml(source);
	const grouped = mergeMatches([...identical, ...minor, ...related, ...excluded]);
	const final = fillMissingGaps(grouped, source.html.value.length);
	return final;
};

/**
 * This function will process one result and generate a list of match intervals that
 * will help highlight the suspect html with respect to user settings and match type priority
 * @param suspect the suspect result item
 * @param settings the current user settings
 */
export const processSuspectHtml = (suspect: ResultItem, settings: CopyleaksReportOptions): Match[] => {
	if (!suspect || !suspect.result.html) {
		return null;
	}
	const identical = settings.showIdentical ? extractIdenticalFromSuspectHtml(suspect) : [];
	const minor = settings.showMinorChanges ? extractMinorChangesFromSuspectHtml(suspect) : [];
	const related = settings.showRelated ? extractRelatedMeaningFromSuspectHtml(suspect) : [];
	const grouped = mergeMatches([...identical, ...minor, ...related]);
	return fillMissingGaps(grouped, suspect.result.html.value.length);
};

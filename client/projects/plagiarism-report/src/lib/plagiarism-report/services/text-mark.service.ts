import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { Comparison, ComparisonCollection, Match, MatchType, SlicedMatch } from '../models';
import { MatchComponent } from '../components/match/match.component';

/** the boolean represents if the respective match should be marked */

export type MatchClickEvent = [MatchComponent, boolean];

@Injectable({ providedIn: 'root' })
export class TextMarkService {
	private readonly _clicked = new BehaviorSubject<MatchClickEvent>([null, false]);
	private readonly _unmark = new Subject();
	private readonly _jump = new Subject<boolean>();

	public jump$ = this._jump.asObservable();
	public clicked$ = this._clicked.asObservable();
	public unmark$ = this._unmark.asObservable();

	/**
	 * jump to the next/prev match
	 * @param forward `true` if jumping to the next match `false` if jumping to the previous
	 */
	public jump(forward = true) {
		this._jump.next(forward);
	}
	/** unmark currently marked matches */
	public unmark() {
		this._unmark.next();
	}
	/** handle match click  //TODO */
	public onMatchClick(match: MatchComponent, shouldMarkOther = false) {
		this._clicked.next([match, shouldMarkOther]);
	}

	/**
	 * convert the first letter of a string into lowercase
	 * @param str the string to modify
	 */
	public toLowerFirst(str: string) {
		return str[0].toLowerCase() + str.substring(1);
	}

	/**
	 * Find the respective match for a given match directive element containing a match object
	 * If the match is from the source, the return value will contain the source index first, and
	 * then the suspect's index, and vice versa.
	 * @param match the match directive element
	 * @param result the suspect currently viewed
	 * @returns pair of indices.
	 */
	findRespectiveMatch(match: Match, comparisons: ComparisonCollection, isSource = true): [number, number] {
		const { type, start } = match;
		const key = this.toLowerFirst(MatchType[type]);
		const { source: original, suspected: suspect } = comparisons[key] as Comparison;
		const [source, target] = isSource ? [original, suspect] : [suspect, original];
		const index = source.chars.starts.findIndex((s, i, _) => s <= start && start <= s + source.chars.lengths[i]);
		return [source.chars.starts[index], target.chars.starts[index]];
	}
	/**
	 * Calculates the 1-based page number of where the start position should be
	 * @param start the start position
	 * @param pages array of start positions
	 */
	findRespectivePage(start: number, pages: number[]): number {
		let page: number;
		for (page = 1; page < pages.length; page++) {
			if (start < pages[page]) {
				break;
			}
		}

		return page;
	}

	/**
	 * Search source for a match containing the given match's start position and return that match's start position
	 * @param start the match to look for
	 * @param source the scan source object.
	 */
	findPartialMatch(match: Match, suspect: ComparisonCollection): number {
		const { start, end } = match;
		const { identical, minorChanges, relatedMeaning } = suspect;
		for (const comparison of [identical, minorChanges, relatedMeaning]) {
			if (!comparison) {
				continue;
			}
			const { source } = comparison;
			const found = source.chars.starts.find((s, i, _) => s <= start && end <= s + source.chars.lengths[i]);
			if (found !== undefined) {
				return found;
			}
		}
	}
	/**
	 * Locate the index of the next page that contains some match
	 * @param matches the matches to look up in
	 * @param current the index of the current match
	 */
	findNextPageWithMatch(matches: SlicedMatch[][], current: number): number {
		for (let i = current; i < matches.length; i++) {
			if (matches[i].some(match => match.match.type !== MatchType.none)) {
				return i + 1;
			}
		}
		return current;
	}
	/**
	 * Locate the index of the previouse page that contains some match
	 * @param matches the current active matches
	 * @param current the index of the current match
	 */
	findPrevPageWithMatch(matches: SlicedMatch[][], current: number): number {
		for (let i = current - 2; i >= 0; i--) {
			if (matches[i].some(match => match.match.type !== MatchType.none)) {
				return i + 1;
			}
		}
		return current;
	}
}

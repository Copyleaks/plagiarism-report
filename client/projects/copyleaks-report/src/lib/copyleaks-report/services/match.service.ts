import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, withLatestFrom, tap, pairwise } from 'rxjs/operators';
import { MatchComponent } from '../components/match/match.component';
import { Match, ViewMode } from '../models';
import { ReportService } from './report.service';

export interface TextMatchClickEvent {
	match: MatchComponent;
	broadcast: boolean;
}

export interface HtmlMatchClickEvent {
	match: Match;
	isSource: boolean;
	broadcast: boolean;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
	constructor(private reportService: ReportService) {
		this.oneToManyTextMatchClick$.subscribe(event => this.onOneToManyTextMatchClick(event));
		this.oneToOneTextMatchClick$.subscribe(event => this.onOneToOneTextMatchClick(event));
		this.originalText$.pipe(pairwise()).subscribe(([prev, next]) => this.onTextMatchChange(prev, next));
	}
	private readonly _jump = new Subject<boolean>();

	/** Unused  at the moment */
	private readonly _clear = new Subject<ViewMode>();

	private readonly _textMatchClicked = new Subject<TextMatchClickEvent>();
	private readonly _htmlMatchClicked = new Subject<HtmlMatchClickEvent>();

	public readonly _originalText = new BehaviorSubject<MatchComponent>(null);
	public readonly _sourceText = new BehaviorSubject<MatchComponent>(null);
	public readonly _suspectText = new BehaviorSubject<MatchComponent>(null);

	private readonly _originalHtml = new BehaviorSubject<Match>(null);
	private readonly _sourceHtml = new BehaviorSubject<Match>(null);
	private readonly _suspectHtml = new BehaviorSubject<Match>(null);

	public readonly jump$ = this._jump.asObservable();
	public readonly clear$ = this._clear.asObservable();

	public readonly oneToManyTextMatchClick$ = this._textMatchClicked.asObservable().pipe(
		withLatestFrom(this.reportService.viewMode$),
		filter(([_, mode]) => mode === 'one-to-many'),
		map(([event]) => event)
	);

	public readonly oneToOneTextMatchClick$ = this._textMatchClicked.asObservable().pipe(
		withLatestFrom(this.reportService.viewMode$),
		filter(([_, mode]) => mode === 'one-to-one'),
		map(([event]) => event)
	);

	public readonly oneToManyHtmlMatchClick$ = this._htmlMatchClicked.asObservable().pipe(
		withLatestFrom(this.reportService.viewMode$),
		filter(([_, mode]) => mode === 'one-to-many'),
		map(([event]) => event)
	);

	public readonly oneToOneHtmlMatchClick$ = this._htmlMatchClicked.asObservable().pipe(
		withLatestFrom(this.reportService.viewMode$),
		filter(([_, mode]) => mode === 'one-to-one'),
		map(([event]) => event)
	);

	public readonly originalText$ = this._originalText.asObservable();
	public readonly sourceText$ = this._sourceText.asObservable();
	public readonly suspectText$ = this._suspectText.asObservable();

	public readonly originalHtml$ = this._originalHtml.asObservable();
	public readonly sourceHtml$ = this._sourceHtml.asObservable();
	public readonly suspectHtml$ = this._suspectHtml.asObservable();

	/**
	 * Pushes a new `TextMatchClickEvent` to the text match click observer
	 * @param match The match component that was clicked
	 */
	public textMatchClicked(match: MatchComponent) {
		this._textMatchClicked.next({ match, broadcast: true });
	}
	/**
	 * Pushes a new `HtmlMatchClickEvent` to the html match click observer
	 * @param match the match data of the clicked element
	 * @param isSource `true` if the match comes from the `source` and `false` if it comes from the `suspect`
	 */
	public htmlMatchClicked(match: Match, isSource: boolean) {
		this._htmlMatchClicked.next({ match, isSource, broadcast: true });
	}
	/**
	 * Pushes the match that should be marked to the original text match observer
	 * This will mark/unmark the text match in the original component while in `one-to-many` view mode
	 * @param match The match to mark/unmark
	 */
	public setOriginalTextMatch(match: MatchComponent) {
		this._originalText.next(match);
	}

	/**
	 * Pushes the match that should be marked to the source text match observer
	 * This will mark/unmark the text match in the original component while in `one-to-one` view mode
	 * @param match The match to mark/unmark
	 */
	public setSourceTextMatch(match: MatchComponent) {
		this._sourceText.next(match);
	}
	/**
	 * Pushes the match that should be marked to the suspect text match observer
	 * This will mark/unmark the text match in the suspect component while in `one-to-one` view mode
	 * @param match The match to mark/unmark
	 */
	public setSuspectTextMatch(match: MatchComponent) {
		this._suspectText.next(match);
	}

	/**
	 * Pushes the match that should be marked to the original html match observer
	 * This will mark/unmark the html match in the original component while in `one-to-many` view mode
	 * @param match The match to mark/unmark
	 */
	public setOriginalHtmlMatch(match: Match) {
		this._originalHtml.next(match);
	}
	/**
	 * Pushes the match that should be marked to the source html match observer
	 * This will mark/unmark the html match in the original component while in `one-to-one` view mode
	 * @param match The match to mark/unmark
	 */
	public setSourceHtmlMatch(match: Match) {
		this._sourceHtml.next(match);
	}
	/**
	 * Pushes the match that should be marked to the suspect html match observer
	 * This will mark/unmark the html match in the suspect component while in `one-to-one` view mode
	 * @param match The match to mark/unmark
	 */
	public setSuspectHtmlMatch(match: Match) {
		this._suspectHtml.next(match);
	}

	/**
	 * Push a new jump event to the jump observer
	 *
	 * @param next `true` to jump to the next match and `false` to jump to the previous match
	 */
	public jump(next: boolean) {
		this._jump.next(next);
	}

	/**
	 * Mark/Unmark the next match component based on the previously marked component
	 * @param prev the previously marked/unmarked match
	 * @param next the match to mark/unmark next
	 */
	private onTextMatchChange(prev: MatchComponent, next: MatchComponent) {
		if (next) {
			if (prev && prev !== next) {
				prev.focused = false;
			}
			next.focused = !next.focused;
		} else {
			if (prev) {
				prev.focused = false;
			}
		}
	}

	/**
	 * Executes when a `text` match component is clicked in `one-to-one` view
	 * @param event information about
	 */
	private onOneToOneTextMatchClick(event: TextMatchClickEvent) {
		if (event.match.isSource) {
			this.setSourceTextMatch(event.match);
		} else {
			this.setSuspectTextMatch(event.match);
		}
	}

	/**
	 * Executes when a `text` match component is clicked in `one-to-many` view
	 * @param event
	 */
	private onOneToManyTextMatchClick(event: TextMatchClickEvent) {
		this.setOriginalTextMatch(event.match);
	}
}

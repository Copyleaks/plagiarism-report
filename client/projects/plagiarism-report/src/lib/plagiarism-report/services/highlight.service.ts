import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../shared/operators/untilDestroy';
import { MatchComponent } from '../components/match/match.component';
import { ContentMode, Match, ViewMode } from '../models';
import * as helpers from '../utils/highlight-helpers';
import { ReportService } from './report.service';

export type ReportOrigin = 'original' | 'source' | 'suspect';
export interface TextMatchHighlightEvent {
	elem: MatchComponent;
	origin: ReportOrigin;
	broadcast: boolean;
}

export interface HtmlMatchClickEvent {
	match: Match;
	isSource: boolean;
	broadcast: boolean;
}

@Injectable()
export class HighlightService implements OnDestroy {
	private readonly _originalText = new BehaviorSubject<MatchComponent>(null);
	private readonly _sourceText = new BehaviorSubject<MatchComponent>(null);
	private readonly _suspectText = new BehaviorSubject<MatchComponent>(null);
	private readonly _originalHtml = new BehaviorSubject<Match>(null);
	private readonly _sourceHtml = new BehaviorSubject<Match>(null);
	private readonly _suspectHtml = new BehaviorSubject<Match>(null);
	private readonly _textMatchClick = new Subject<TextMatchHighlightEvent>();
	private readonly _htmlMatchClick = new Subject<HtmlMatchClickEvent>();
	private readonly _jump = new Subject<boolean>();
	private readonly _clear = new Subject<ViewMode>();

	constructor(private reportService: ReportService) {
		this.textMatchClick$.pipe(untilDestroy(this)).subscribe(event => {
			switch (event.origin) {
				case 'original':
					this.setOriginalTextMatch(event.elem);
					break;
				case 'source':
					this.setSourceTextMatch(event.elem);
					break;
				case 'suspect':
					this.setSuspectTextMatch(event.elem);
					break;
			}
		});
	}

	public get jump$() {
		return this._jump.asObservable();
	}

	public get clear$() {
		return this._clear.asObservable();
	}

	public get oneToManyTextMatchClick$() {
		return this.textMatchClick$.pipe(filter(ev => ev.origin === 'original'));
	}

	public get oneToOneTextMatchClick$() {
		return this.textMatchClick$.pipe(filter(ev => ev.origin === 'source' || ev.origin === 'suspect'));
	}

	public get oneToManyHtmlMatchClick$() {
		return this._htmlMatchClick.asObservable().pipe(
			withLatestFrom(this.reportService.viewMode$),
			filter(([, mode]) => mode === 'one-to-many'),
			map(([event]) => event)
		);
	}

	public get oneToOneHtmlMatchClick$() {
		return this._htmlMatchClick.asObservable().pipe(
			withLatestFrom(this.reportService.viewMode$),
			filter(([, mode]) => mode === 'one-to-one'),
			map(([event]) => event)
		);
	}

	public get originalText$() {
		return this._originalText.asObservable();
	}
	public get sourceText$() {
		return this._sourceText.asObservable();
	}
	public get suspectText$() {
		return this._suspectText.asObservable();
	}

	public get originalHtml$() {
		return this._originalHtml.asObservable();
	}
	public get sourceHtml$() {
		return this._sourceHtml.asObservable();
	}
	public get suspectHtml$() {
		return this._suspectHtml.asObservable();
	}
	public get textMatchClick$() {
		return this._textMatchClick.asObservable();
	}

	/**
	 * Clear the currently selected matches
	 * @param mode the mode to clear, leave empty for both
	 */
	public clear(mode?: ContentMode) {
		if (!mode || mode === 'html') {
			this.textMatchClicked({ elem: null, broadcast: false, origin: 'original' });
			this.textMatchClicked({ elem: null, broadcast: false, origin: 'source' });
			this.textMatchClicked({ elem: null, broadcast: false, origin: 'suspect' });
		}
		if (!mode || mode === 'text') {
			this.htmlMatchClicked(null, true);
			this.htmlMatchClicked(null, false);
		}
	}

	/**
	 * Pushes a new `TextMatchClickEvent` to the text match click observer
	 * @param event The match component that was clicked
	 */
	public textMatchClicked(event: TextMatchHighlightEvent) {
		this._textMatchClick.next(event);
	}

	/**
	 * Pushes a new `HtmlMatchClickEvent` to the html match click observer
	 * @param match the match data of the clicked element
	 * @param isSource `true` if the match comes from the `source` and `false` if it comes from the `suspect`
	 */
	public htmlMatchClicked(match: Match, isSource: boolean) {
		this._htmlMatchClick.next({ match, isSource, broadcast: true });
	}
	/**
	 * Pushes the match that should be marked to the original text match observer
	 * This will mark/unmark the text match in the original component while in `one-to-many` view mode
	 * @param match The match to mark/unmark
	 */
	public setOriginalTextMatch(next: MatchComponent) {
		const prev = this._originalText.value;
		if (prev === next) {
			next = null;
		}
		setTimeout(() => {
			helpers.onTextMatchChange([prev, next]);
		});
		this._originalText.next(next);
	}

	/**
	 * Pushes the match that should be marked to the source text match observer
	 * This will mark/unmark the text match in the original component while in `one-to-one` view mode
	 * @param match The match to mark/unmark
	 */
	public setSourceTextMatch(next: MatchComponent) {
		const prev = this._sourceText.value;
		if (prev === next) {
			next = null;
		}
		setTimeout(() => {
			helpers.onTextMatchChange([prev, next]);
		});
		this._sourceText.next(next);
	}
	/**
	 * Pushes the match that should be marked to the suspect text match observer
	 * This will mark/unmark the text match in the suspect component while in `one-to-one` view mode
	 * @param next The match to mark/unmark
	 */
	public setSuspectTextMatch(next: MatchComponent) {
		const prev = this._suspectText.value;
		if (prev === next) {
			next = null;
		}
		setTimeout(() => {
			helpers.onTextMatchChange([prev, next]);
		});
		this._suspectText.next(next);
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
	 * clear all selected matches
	 */
	public clearAllMatchs() {
		this.setOriginalTextMatch(null);
		this.setSuspectTextMatch(null);
		this.setOriginalHtmlMatch(null);
		this.setSourceHtmlMatch(null);
		this.setSuspectHtmlMatch(null);
		this.setSourceTextMatch(null);
	}

	/**
	 * Push a new jump event to the jump observer
	 *
	 * @param next `true` to jump to the next match and `false` to jump to the previous match
	 */
	public jump(next: boolean) {
		this._jump.next(next);
	}

	/** dtor */
	ngOnDestroy() {
		this._originalText.complete();
		this._sourceText.complete();
		this._suspectText.complete();
		this._originalHtml.complete();
		this._sourceHtml.complete();
		this._suspectHtml.complete();
		this._jump.complete();
		this._textMatchClick.complete();
		this._htmlMatchClick.complete();
		this._jump.complete();
		this._clear.complete();
	}
}

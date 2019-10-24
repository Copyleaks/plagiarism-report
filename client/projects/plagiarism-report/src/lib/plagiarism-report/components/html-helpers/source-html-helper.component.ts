import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { filter, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchJumpEvent, MatchSelectEvent, MatchType } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { findRespectiveStart } from '../../utils/highlight-helpers';
import { truthy } from '../../utils/operators';
import { HtmlHelperBase } from './HtmlHelperBase';
import iframeScript from './one-to-one-iframe-logic';

@Component({
	selector: 'iframe[cr-source-html-helper]',
	template: '',
	styleUrls: ['./html-helper.scss'],
})
export class SourceHtmlHelperComponent extends HtmlHelperBase implements OnInit, OnDestroy {
	constructor(
		renderer: Renderer2,
		element: ElementRef<HTMLIFrameElement>,
		private reportService: ReportService,
		private matchService: MatchService,
		private highlightService: HighlightService
	) {
		super(renderer, element);
		const js = renderer.createElement('script') as HTMLScriptElement;
		js.textContent = iframeScript;
		this.script = js.outerHTML;
	}

	/**
	 * Handle `match-select` event
	 * @param event the event object
	 */
	handleMatchSelect(event: MatchSelectEvent) {
		this.matchService.setSourceHtmlMatch(event.index !== -1 ? this.matches[event.index] : null);
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - source and suspect html matches
	 * - report metadata source and suspect objects
	 * - viewmode changes
	 * - jump events
	 */
	ngOnInit() {
		const { source$, viewMode$, suspect$ } = this.reportService;
		const { suspectHtml$, jump$ } = this.matchService;
		const { sourceHtmlMatches$ } = this.highlightService;
		source$
			.pipe(
				untilDestroy(this),
				truthy()
			)
			.subscribe(source => (this.html = source.html && source.html.value));
		sourceHtmlMatches$.pipe(untilDestroy(this)).subscribe(matches => this.renderMatches(matches));
		jump$
			.pipe(
				untilDestroy(this),
				withLatestFrom(viewMode$),
				filter(([, mode]) => mode === 'one-to-one')
			)
			.subscribe(([forward]) => this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent));

		suspectHtml$
			.pipe(
				untilDestroy(this),
				withLatestFrom(suspect$)
			)
			.subscribe(([match, suspect]) => {
				if (match) {
					const comparison = suspect.result.html.comparison[MatchType[match.type]];
					const [start] = findRespectiveStart(match.start, comparison, false);
					const found = this.matches.findIndex(m => m.start === start);
					this.markSingleMatchInFrame(found);
				} else {
					this.markSingleMatchInFrame(-1);
				}
			});
	}
}

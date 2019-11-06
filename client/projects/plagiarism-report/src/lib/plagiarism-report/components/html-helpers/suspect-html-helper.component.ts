import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { filter, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchJumpEvent, MatchSelectEvent, MatchType } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { findRespectiveStart } from '../../utils/match-helpers';
import { truthy } from '../../utils/operators';
import { HtmlHelperBase } from './HtmlHelperBase';
import iframeScript from './one-to-one-iframe-logic';

@Component({
	selector: 'iframe[cr-suspect-html-helper]',
	template: '',
	styleUrls: ['./html-helper.scss'],
})
export class SuspectHtmlHelperComponent extends HtmlHelperBase implements OnInit, OnDestroy {
	constructor(
		renderer: Renderer2,
		element: ElementRef<HTMLIFrameElement>,
		private reportService: ReportService,
		private highlightService: HighlightService,
		private matchService: MatchService
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
		this.highlightService.setSuspectHtmlMatch(event.index !== -1 ? this.matches[event.index] : null);
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - suspect changes
	 * - view mode changes
	 * - source and suspect html matches
	 */
	ngOnInit() {
		const { suspect$, viewMode$, contentMode$ } = this.reportService;
		const { sourceHtml$, jump$ } = this.highlightService;
		const { suspectHtmlMatches$ } = this.matchService;
		suspect$
			.pipe(
				untilDestroy(this),
				truthy()
			)
			.subscribe(suspect => suspect.result.html && (this.html = suspect.result.html.value));
		suspectHtmlMatches$.pipe(untilDestroy(this)).subscribe(matches => this.renderMatches(matches));
		jump$
			.pipe(
				untilDestroy(this),
				withLatestFrom(viewMode$, contentMode$),
				filter(([, view, content]) => view === 'one-to-one' && content === 'html')
			)
			.subscribe(([forward]) => this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent));

		sourceHtml$
			.pipe(
				withLatestFrom(suspect$, contentMode$),
				filter(([, , content]) => content === 'html'),
				filter(([, suspect]) => suspect && !!suspect.result.html.value)
			)
			.subscribe(([match, suspect]) => {
				if (match && suspect) {
					const comparison = suspect.result.html.comparison[MatchType[match.type]];
					const [start] = findRespectiveStart(match.start, comparison, true);
					const found = this.matches.findIndex(m => m.start === start);
					this.markSingleMatchInFrame(found);
				} else {
					this.markSingleMatchInFrame(-1);
				}
			});
	}
}

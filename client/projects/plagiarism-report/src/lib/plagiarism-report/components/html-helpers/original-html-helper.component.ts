import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchJumpEvent, MatchSelectEvent } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';
import { HtmlHelperBase } from './HtmlHelperBase';
import iframeScript from './one-to-many-iframe-logic';
import { CopyleaksTranslateService } from '../../services/copyleaks-translate.service';
import deepEqual from 'deep-equal';

/**
 * Component to handle manipulating the scan result's html inside an iframe
 */
@Component({
	selector: 'iframe[cr-original-html-helper]',
	template: '',
	styleUrls: ['./html-helper.scss'],
})
export class OriginalHtmlHelperComponent extends HtmlHelperBase implements OnInit, OnDestroy {
	private lastMatchSelectEvent: MatchSelectEvent;
	private renderedSuccessfully = false;
	constructor(
		renderer: Renderer2,
		element: ElementRef<HTMLIFrameElement>,
		private highlightService: HighlightService,
		private matchService: MatchService,
		reportService: ReportService,
		translateService: CopyleaksTranslateService
	) {
		super(renderer, element, reportService, translateService);
		const js = renderer.createElement('script') as HTMLScriptElement;
		js.textContent = iframeScript;
		this.script = js.outerHTML;
	}

	/**
	 * handle match selection
	 */
	handleMatchSelect(event: MatchSelectEvent) {
		this.lastMatchSelectEvent = event;
		this.highlightService.setOriginalHtmlMatch(event.index !== -1 ? this.matches[event.index] : null);
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - original html matches
	 * - view mode changes
	 * - source ducument
	 * - jump events
	 */
	ngOnInit() {
		const { source$, viewMode$, contentMode$ } = this.reportService;
		const { jump$ } = this.highlightService;
		const { originalHtmlMatches$ } = this.matchService;
		source$
			.pipe(
				truthy(),
				filter(source => !!source.html)
			)
			.subscribe(source => {
				this.html = source.html.value;
				this.setHtml(this.html);
			});
		combineLatest([source$.pipe(truthy()), originalHtmlMatches$])
			.pipe(untilDestroy(this))
			.subscribe(([, matches]) => {
				if (!this.renderedSuccessfully || !deepEqual(this.matches, matches)) {
					this.matches = matches;
					this.renderMatches(matches);
					this.renderedSuccessfully = true;
					this.lastMatchSelectEvent = null;
				}

				if (this.lastMatchSelectEvent && this.lastMatchSelectEvent.index !== -1) {
					this.messageFrame({ type: 'match-select', index: this.lastMatchSelectEvent?.index } as MatchSelectEvent);
				}
			});

		const onOneToManyHtmlJump$ = combineLatest([jump$, contentMode$, viewMode$]).pipe(
			distinctUntilChanged(),
			untilDestroy(this),
			filter(
				([forward, content, viewMode]) =>
					(forward === true || forward === false) && viewMode === 'one-to-many' && content === 'html'
			),
			map(([forward]) => forward)
		);
		onOneToManyHtmlJump$.subscribe(forward => {
			this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent);
		});
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

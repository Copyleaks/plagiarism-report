import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { Match, MatchJumpEvent, MatchSelectEvent, MatchType, PostMessageEvent } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { ReportService } from '../../services/report.service';
import { EXCLUDE_MESSAGE } from '../../utils/constants';
import { truthy } from '../../utils/operators';
import iframeScript from './one-to-many-frame-helper';
import { MatchService } from '../../services/match.service';

/** used for importing css as a string */
declare var require: any;

/** import css as a string */
const iframeStyle = require('./frame-helper-style.css') as any;

/**
 * Component to handle manipulating the scan result's html inside an iframe
 */
@Component({
	selector: 'iframe[cr-original-frame-helper]',
	template: '',
	styleUrls: [],
})
export class OriginalFrameHelperComponent implements OnInit, OnDestroy {
	/** convinient getter for the iframe window object */
	private get frame() {
		return this.element.nativeElement.contentWindow;
	}

	constructor(
		public element: ElementRef<HTMLIFrameElement>,
		private reportService: ReportService,
		private highlightService: HighlightService,
		private renderer: Renderer2,
		private matchService: MatchService
	) {
		const css = renderer.createElement('style') as HTMLStyleElement;
		css.textContent = iframeStyle;
		this.style = css.outerHTML;
		const js = renderer.createElement('script') as HTMLScriptElement;
		js.textContent = iframeScript;
		this.script = js.outerHTML;
	}
	@HostBinding('attr.seamless') readonly seamless = true;
	@HostBinding('attr.sandbox') readonly sandbox = 'allow-scripts';
	/** the original html */
	private html: string;
	/** string representation of the external css that will be inserted to the frame */
	private style: string;
	/** string representation of the extrnal js that will be inserted to the frmae */
	private script: string;
	/** the matches to process */
	private matches: Match[];

	/**
	 * Handles PostMessage events, making sure its from the correct iframe.
	 * @param event the default PostMessage event
	 */
	@HostListener('window:message', ['$event'])
	onFrameMessage(event: MessageEvent) {
		const { source, data } = event;

		if (source !== this.frame) {
			return;
		}
		const pmevent = data as PostMessageEvent;
		switch (pmevent.type) {
			case 'match-select':
				this.handleMatchSelect(pmevent);
				break;
			default:
				console.error('unknown event', pmevent);
		}
	}
	/**
	 * Send a message to the iframe using PostMessage API
	 * @param data the data to post
	 */
	messageFrame(data: any) {
		if (this.frame) {
			this.frame.postMessage(data, '*');
		}
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	renderMatches(matches: Match[]) {
		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = this.html.substring(curr.start, curr.end);
			switch (curr.type) {
				case MatchType.excluded:
					slice = `<span exclude title="${EXCLUDE_MESSAGE[curr.reason]}">${slice}</span>`;
					break;
				case MatchType.none:
					break;
				default:
					slice = `<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}">${slice}</span>`;
					break;
			}
			return slice.concat(prev);
		}, '');
		this.renderer.setAttribute(this.element.nativeElement, 'srcdoc', html + this.style + this.script);
	}

	/**
	 * highlight a single match in the iframe
	 * @param index the index of the match to mark
	 */
	markSingleMatchInFrame(index: number) {
		this.messageFrame({ type: 'match-select', index } as MatchSelectEvent);
	}

	/**
	 * handle match selection
	 */
	handleMatchSelect(event: MatchSelectEvent) {
		this.matchService.setOriginalHtmlMatch(event.index !== -1 ? this.matches[event.index] : null);
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
		const { source$, viewMode$, jump$ } = this.reportService;
		const { originalHtmlMatches$ } = this.highlightService;
		source$
			.pipe(
				untilDestroy(this),
				truthy()
			)
			.subscribe(source => (this.html = source.html && source.html.value));
		originalHtmlMatches$
			.pipe(untilDestroy(this))
			.subscribe(matches => (this.matches = matches) && this.renderMatches(matches));
		const onOneToManyJump$ = combineLatest([jump$, viewMode$]).pipe(
			untilDestroy(this),
			filter(([_, mode]) => mode === 'one-to-many'),
			map(([forward]) => forward)
		);
		onOneToManyJump$.subscribe(forward => this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent));
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

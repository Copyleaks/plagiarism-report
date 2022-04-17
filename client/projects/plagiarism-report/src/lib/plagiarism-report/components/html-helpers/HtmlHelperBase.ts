import { ElementRef, HostBinding, HostListener, Renderer2, Directive } from '@angular/core';
import { ExcludeReason, Match, MatchSelectEvent, MatchType, PostMessageEvent } from '../../models';
import { EXCLUDE_MESSAGE } from '../../utils/constants';
import iframeStyle from './iframe-styles';
import { CopyleaksTranslateService } from '../../services/copyleaks-translate.service';
import { ReportService } from '../../services/report.service';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class HtmlHelperBase {
	private EXCLUDE_MESSAGE = EXCLUDE_MESSAGE;
	/** the original html */
	protected html: string;
	/** string representation of the external css that will be inserted to the frame */
	protected style: string;
	/** string representation of the extrnal js that will be inserted to the frmae */
	protected script: string;
	/** the matches to process */
	protected matches: Match[];
	/** sets the seamsless attribute to the iframe */
	@HostBinding('attr.seamless') readonly seamless = true;
	/** sets the sandbox attribute to the iframe */
	@HostBinding('attr.sandbox') readonly sandbox = 'allow-scripts';

	constructor(
		protected renderer: Renderer2,
		protected element: ElementRef<HTMLIFrameElement>,
		protected reportService: ReportService,
		protected translateService: CopyleaksTranslateService
	) {
		const css = renderer.createElement('style') as HTMLStyleElement;
		css.textContent = iframeStyle;
		this.style = css.outerHTML;
		if (this.translateService) {
			const translations = this.translateService.translations;
			if (translations && translations.SCAN_SETTINGS && translations.SCAN_SETTINGS.OMITTED) {
				this.EXCLUDE_MESSAGE = {
					1: translations.SCAN_SETTINGS.OMITTED.QUOTATIONS,
					2: translations.SCAN_SETTINGS.OMITTED.REFERENCES,
					5: translations.SCAN_SETTINGS.OMITTED.HTML_TEMPLATES,
					6: translations.SCAN_SETTINGS.OMITTED.TABLES_OF_CONTENT,
					7: translations.SCAN_SETTINGS.OMITTED.SOURCE_CODE_COMMENTS,
					0: translations.SCAN_SETTINGS.OMITTED.SENSITIVE_DATA,
					8: translations.SCAN_SETTINGS.OMITTED.PARTIAL_SCAN,
					9: translations.SCAN_SETTINGS.OMITTED.CITATIONS,
				};
			}
		}
	}
	/**
	 * Handles the `match-select` event
	 * @param event the event object containing the match `index`
	 */
	abstract handleMatchSelect(event: MatchSelectEvent): void;

	/**
	 * Handles PostMessage events, making sure its from the correct iframe.
	 * @param event the default PostMessage event
	 */
	@HostListener('window:message', ['$event'])
	onFrameMessage(event) {
		const { source, data } = event;
		if (source !== this.frame) {
			return;
		}
		const pmevent = data as PostMessageEvent;
		switch (pmevent.type) {
			case 'match-select':
				this.handleMatchSelect(pmevent);
				break;
			case 'upgrade-plan':
				this.handleUpgradePlanEvent();
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', pmevent);
		}
	}
	/**
	 * Handles the 'upgrade-plan' event
	 */
	handleUpgradePlanEvent() {
		this.reportService.upgradePlanEvent();
	}

	protected get frame() {
		return this.element.nativeElement.contentWindow;
	}

	/**
	 * Send a message to the iframe using PostMessage API
	 * @param data the data to post
	 */
	protected messageFrame(data: any) {
		this.frame && this.frame.postMessage(data, '*');
	}

	/**
	 * Set the iframe srcdoc html to the given html string
	 * @param html the html string
	 */
	protected setHtml(html: string) {
		this.renderer.setAttribute(this.element.nativeElement, 'srcdoc', html + this.style + this.script);
	}

	/**
	 * highlight a single match in the iframe
	 * @param index the index of the match to mark
	 */
	protected markSingleMatchInFrame(index: number) {
		this.messageFrame({ type: 'match-select', index } as MatchSelectEvent);
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	protected renderMatches(matches: Match[]) {
		this.matches = matches;
		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = this.html?.substring(curr.start, curr.end);
			switch (curr.type) {
				case MatchType.excluded:
					if (curr.reason === ExcludeReason.PartialScan) {
						slice = `<span exclude-partial-scan data-type="${curr.type}" data-index="${i}" title="${
							this.EXCLUDE_MESSAGE[curr.reason]
						}">${slice}</span>`;
					} else {
						slice = `<span exclude title="${this.EXCLUDE_MESSAGE[curr.reason]}">${slice}</span>`;
					}
					break;
				case MatchType.none:
					break;
				default:
					slice = `<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}">${slice}</span>`;
					break;
			}
			return slice ? slice?.concat(prev) : '';
		}, '');
		this.renderer.setAttribute(this.element.nativeElement, 'srcdoc', html + this.style + this.script);
	}
}

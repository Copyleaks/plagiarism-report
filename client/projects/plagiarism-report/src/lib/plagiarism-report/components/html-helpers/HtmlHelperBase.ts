import { ElementRef, HostBinding, HostListener, Renderer2 } from '@angular/core';
import { Match, MatchSelectEvent, MatchType, PostMessageEvent } from '../../models';
import { EXCLUDE_MESSAGE } from '../../utils/constants';
import iframeStyle from './iframe-styles';

export abstract class HtmlHelperBase {
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

	constructor(protected renderer: Renderer2, protected element: ElementRef<HTMLIFrameElement>) {
		const css = renderer.createElement('style') as HTMLStyleElement;
		css.textContent = iframeStyle;
		this.style = css.outerHTML;
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
			case 'match-warn':
				console.warn('match not found');
				break;
			default:
				console.error('unknown event', pmevent);
		}
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
}
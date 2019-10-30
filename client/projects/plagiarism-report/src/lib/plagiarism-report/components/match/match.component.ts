import { AfterContentInit, Component, ElementRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Match } from '../../models';
import { HighlightService, ReportOrigin } from '../../services/highlight.service';

@Component({
	selector: 'span[cr-match]',
	styleUrls: ['./match.component.scss'],
	template: '<ng-content></ng-content>',
})
export class MatchComponent implements AfterContentInit {
	constructor(
		public element: ElementRef<HTMLElement>,
		private renderer: Renderer2,
		private highlightService: HighlightService
	) {}

	// tslint:disable-next-line:no-input-rename
	@Input('cr-match')
	public match: Match;

	@Input()
	public readonly origin: ReportOrigin;

	private _focused = false;
	/** focused flag, if set to `true` the element will be highlighted */
	@HostBinding('class.cr-highlight')
	public get focused() {
		return this._focused;
	}
	public set focused(value: boolean) {
		this._focused = value;
		if (value) {
			scrollIntoView(this.element.nativeElement, {
				behavior: 'smooth',
				block: 'nearest',
				skipOverflowHiddenElements: true,
			});
		}
	}

	/**
	 * emits the element through the match click event
	 */
	@HostListener('click')
	public click() {
		this.highlightService.textMatchClicked({ elem: this, broadcast: true, origin: this.origin });
	}

	/**
	 * Life-cycle method
	 * Add a class to the native element that represents the match type
	 */
	ngAfterContentInit() {
		this.renderer.addClass(this.element.nativeElement, `cr-m-${this.match.type}`);
	}
}

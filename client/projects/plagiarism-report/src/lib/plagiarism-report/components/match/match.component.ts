import { AfterContentInit, ElementRef, HostBinding, HostListener, Input, Renderer2, Component } from '@angular/core';
import scrollIntoView from 'scroll-into-view-if-needed';
import { MatchService } from '../../services/match.service';
import { Match } from '../../models';

@Component({
	selector: 'span[cr-match]',
	styleUrls: ['./match.component.scss'],
	template: '<ng-content></ng-content>',
})
export class MatchComponent implements AfterContentInit {
	constructor(
		public element: ElementRef<HTMLElement>,
		private renderer: Renderer2,
		private matchService: MatchService
	) {}

	// tslint:disable-next-line:no-input-rename
	@Input('cr-match') public match: Match;

	@Input() public isSource = true;

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
		this.matchService.textMatchClicked(this);
	}

	/**
	 * Life-cycle method
	 * Add a class to the native element that represents the match type
	 */
	ngAfterContentInit() {
		this.renderer.addClass(this.element.nativeElement, `cr-m-${this.match.type}`);
	}
}

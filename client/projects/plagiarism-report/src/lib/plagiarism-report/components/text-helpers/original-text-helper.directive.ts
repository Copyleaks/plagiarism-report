import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { distinctUntilChanged, filter, take, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { HighlightService, TextMatchHighlightEvent } from '../../services/highlight.service';
import { ReportService } from '../../services/report.service';
import * as helpers from '../../utils/highlight-helpers';
import { MatchComponent } from '../match/match.component';

@Directive({
	selector: '[crOriginalTextHelper]',
})
export class OriginalTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { textMatches: any; currentPage: number };
	private lastSelectedOriginalTextMatch: TextMatchHighlightEvent;
	constructor(private reportService: ReportService, private highlightService: HighlightService) {}

	@ContentChildren(MatchComponent)
	private children: QueryList<MatchComponent>;
	private current: MatchComponent;

	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleJump(forward: boolean) {
		if (this.canJumpInCurrentPage(forward)) {
			const components = this.children.toArray();
			const nextIndex = this.current ? components.indexOf(this.current) + (forward ? 1 : -1) : 0;
			this.highlightService.textMatchClicked({ elem: components[nextIndex], broadcast: true, origin: 'original' });
		} else {
			const page = (forward ? helpers.findNextPageWithMatch : helpers.findPrevPageWithMatch)(
				this.host.textMatches,
				this.host.currentPage
			);
			if (this.host.currentPage !== page) {
				this.children.changes.pipe(take(1)).subscribe(() => {
					const comp = forward ? this.children.first : this.children.last;
					this.highlightService.textMatchClicked({ elem: comp, broadcast: true, origin: 'original' });
				});
				this.host.currentPage = page;
			}
		}
	}

	/**
	 * Checks whether it is possible to jump forward/backward in the current page
	 * @param forward the direction of the jump
	 */
	canJumpInCurrentPage(forward: boolean) {
		if (this.current) {
			return forward ? this.current !== this.children.last : this.current !== this.children.first;
		} else {
			return this.children.length > 0;
		}
	}

	/**
	 * Life-cycle method
	 * - subscribe to text jump clicks
	 * - subscribe to original text selected match state
	 */
	ngAfterContentInit() {
		const { contentMode$, viewMode$ } = this.reportService;
		const { jump$, originalText$, textMatchClick$ } = this.highlightService;
		originalText$.pipe(untilDestroy(this)).subscribe(value => (this.current = value));

		jump$
			.pipe(
				untilDestroy(this),
				withLatestFrom(viewMode$, contentMode$),
				filter(([, view, content]) => view === 'one-to-many' && content === 'text')
			)
			.subscribe(([forward]) => this.handleJump(forward));

		textMatchClick$
			.pipe(
				distinctUntilChanged(),
				untilDestroy(this),
				withLatestFrom(viewMode$, contentMode$),
				filter(
					([textMatchClickEvent, view, content]) => textMatchClickEvent && view === 'one-to-many' && content === 'text'
				)
			)
			.subscribe(([textMatchClickEvent, ,]) => {
				this.lastSelectedOriginalTextMatch = textMatchClickEvent;
			});

		viewMode$
			.pipe(
				distinctUntilChanged(),
				untilDestroy(this),
				withLatestFrom(contentMode$),
				filter(([view, content]) => this.lastSelectedOriginalTextMatch && view === 'one-to-many' && content === 'text')
			)
			.subscribe(_ => {
				setTimeout(() => {
					const start = this.lastSelectedOriginalTextMatch?.elem?.match?.start;
					const end = this.lastSelectedOriginalTextMatch?.elem?.match?.end;
					const comp = this.children.find(item => item.match.start === start && item.match.end === end);
					if (comp === null) {
						throw new Error('Match component was not found in view');
					}
					this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'original' });
				}, 100);
			});
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

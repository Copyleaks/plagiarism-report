import { AfterContentInit, ContentChildren, Directive, OnInit, QueryList, Host, OnDestroy } from '@angular/core';
import { MatchComponent } from '../match/match.component';
import { HighlightService } from '../../services/highlight.service';
import { OriginalComponent } from '../original/original.component';
import { filter, withLatestFrom, take, tap } from 'rxjs/operators';
import * as helpers from '../../utils/highlight-helpers';
import { ReportService } from '../../services/report.service';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ScanResult } from '../../models';
@Directive({
	selector: '[crSourceTextHelper]',
})
export class SourceTextHelperDirective implements AfterContentInit, OnDestroy {
	constructor(
		@Host() private host: OriginalComponent,
		private highlightService: HighlightService,
		private reportService: ReportService
	) {}

	@ContentChildren(MatchComponent)
	private children: QueryList<MatchComponent>;
	private current: MatchComponent;

	/**
	 * Life-cycle method
	 * - subscribe to text match clicks from suspect
	 * - subscribe to jump events
	 * - subscribe to the source text selected match
	 */
	ngAfterContentInit() {
		const { contentMode$, viewMode$ } = this.reportService;
		const { textMatchClick$, jump$, sourceText$ } = this.highlightService;
		sourceText$.pipe(untilDestroy(this)).subscribe(value => (this.current = value));
		textMatchClick$
			.pipe(
				untilDestroy(this),
				filter(ev => ev.origin === 'suspect' && ev.broadcast),
				withLatestFrom(this.reportService.suspect$)
			)
			.subscribe(([{ elem }, { result }]) => this.handleBroadcast(elem, result));

		jump$
			.pipe(
				untilDestroy(this),
				withLatestFrom(viewMode$, contentMode$),
				filter(([, view, content]) => view === 'one-to-one' && content === 'text')
			)
			.subscribe(([forward]) => this.handleJump(forward));
	}
	/**
	 * Handle a match click that was broadcasted by the suspect text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 */
	handleBroadcast(elem: MatchComponent, suspect: ScanResult) {
		const [_, start] = helpers.findRespectiveMatch(elem.match, suspect.text.comparison, false);
		const page = helpers.findRespectivePage(elem.match.start, this.host.pages);
		if (page === this.host.currentPage) {
			const comp = this.children.find(item => item.match.start === start);
			if (comp === null) {
				throw new Error('Match component was not found in view');
			}
			this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'source' });
		} else {
			this.children.changes.pipe(take(1)).subscribe(() => {
				const comp = this.children.find(item => item.match.start === start);
				if (comp === null) {
					throw new Error('Match component was not found in view');
				}
				this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'source' });
			});
			this.host.currentPage = page;
		}
	}
	/**
	 * Handles the jump logic
	 * @param forward the direction of the jump
	 */
	handleJump(forward: boolean) {
		if (this.canJumpInCurrentPage(forward)) {
			const components = this.children.toArray();
			const nextIndex = this.current ? components.indexOf(this.current) + (forward ? 1 : -1) : 0;
			this.highlightService.textMatchClicked({ elem: components[nextIndex], broadcast: true, origin: 'source' });
		} else {
			const page = (forward ? helpers.findNextPageWithMatch : helpers.findPrevPageWithMatch)(
				this.host.textMatches,
				this.host.currentPage
			);
			if (this.host.currentPage !== page) {
				this.children.changes.pipe(take(1)).subscribe(() => {
					const comp = forward ? this.children.first : this.children.last;
					this.highlightService.textMatchClicked({ elem: comp, broadcast: true, origin: 'source' });
				});
				this.host.currentPage = page;
			}
		}
	}

	/**
	 * Checks whether it is possible to jump forward/backward in the current page
	 * @param forward the direction of the jump
	 */
	canJumpInCurrentPage(forward: boolean): boolean {
		if (this.current) {
			return forward ? this.current !== this.children.last : this.current !== this.children.first;
		} else {
			return this.children.length > 0;
		}
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

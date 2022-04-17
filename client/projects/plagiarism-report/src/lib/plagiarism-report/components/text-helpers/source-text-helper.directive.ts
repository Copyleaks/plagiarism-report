import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ContentMode, Match, ScanResult, ScanSource } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { ReportService } from '../../services/report.service';
import * as helpers from '../../utils/highlight-helpers';
import { MatchComponent } from '../match/match.component';
@Directive({
	selector: '[crSourceTextHelper]',
})
export class SourceTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { currentPage: number; textMatches: any };
	constructor(private highlightService: HighlightService, private reportService: ReportService) {}

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
		const { contentMode$, viewMode$, source$, suspectResult$: suspect$ } = this.reportService;
		const { textMatchClick$, jump$, sourceText$, suspectHtml$ } = this.highlightService;
		sourceText$.pipe(untilDestroy(this)).subscribe(value => (this.current = value));
		textMatchClick$
			.pipe(
				untilDestroy(this),
				filter(ev => ev.origin === 'suspect' && ev.broadcast),
				withLatestFrom(source$, suspect$, contentMode$),
				filter(([, , , content]) => content === 'text')
			)
			.subscribe(([{ elem }, source, suspect]) => {
				if (elem) {
					this.handleBroadcast(elem.match, source, suspect.result, 'text');
				}
			});

		jump$
			.pipe(
				untilDestroy(this),
				withLatestFrom(viewMode$, contentMode$),
				filter(([, view, content]) => view === 'one-to-one' && content === 'text')
			)
			.subscribe(([forward]) => this.handleJump(forward));

		suspectHtml$
			.pipe(
				withLatestFrom(source$, suspect$, contentMode$),
				filter(([, , , content]) => content === 'html'),
				filter(([, source]) => !source.html || !source.html.value)
			)
			.subscribe(([match, source, suspect]) => this.handleBroadcast(match, source, suspect.result, 'html'));
	}
	/**
	 * Handle a match click that was broadcasted by the suspect text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 */
	handleBroadcast(match: Match, source: ScanSource, suspect: ScanResult, contentMode: ContentMode) {
		const [, start] = helpers.findRespectiveMatch(match, suspect[contentMode].comparison, false);
		const page = helpers.findRespectivePage(start, source.text.pages.startPosition);
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
			const page = forward
				? helpers.findNextPageWithMatch(this.host.textMatches, this.host.currentPage)
				: helpers.findPrevPageWithMatch(this.host.textMatches, this.host.currentPage);
			if (this.host.currentPage !== page) {
				this.highlightService.textMatchClicked({ elem: this.current, broadcast: true, origin: 'source' });
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

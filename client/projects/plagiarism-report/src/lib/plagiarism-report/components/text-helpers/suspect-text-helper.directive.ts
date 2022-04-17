import { AfterContentInit, ContentChildren, Directive, Input, OnDestroy, QueryList } from '@angular/core';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ContentMode, Match, ScanResult } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { ReportService } from '../../services/report.service';
import * as helpers from '../../utils/highlight-helpers';
import { MatchComponent } from '../match/match.component';

@Directive({
	selector: '[crSuspectTextHelper]',
})
export class SuspectTextHelperDirective implements AfterContentInit, OnDestroy {
	@Input() public host: { currentPage: number };
	constructor(private highlightService: HighlightService, private reportService: ReportService) {}

	@ContentChildren(MatchComponent)
	private children: QueryList<MatchComponent>;

	/**
	 * Handle a match click that was broadcasted by the source text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 * @param contentMode content mode of the broadcasting match
	 */
	handleBroadcast(match: Match, suspect: ScanResult, contentMode: ContentMode) {
		const [, start] = helpers.findRespectiveMatch(match, suspect[contentMode].comparison, true);
		const page = helpers.findRespectivePage(start, suspect.text.pages.startPosition);
		if (page === this.host.currentPage) {
			const comp = this.children.find(item => item.match.start === start);
			if (comp === null) {
				throw new Error('Match component was not found in view');
			}
			this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
		} else {
			this.children.changes.pipe(take(1)).subscribe(() => {
				const comp = this.children.find(item => item.match.start === start);
				if (comp === null) {
					throw new Error('Match component was not found in view');
				}
				this.highlightService.textMatchClicked({ elem: comp, broadcast: false, origin: 'suspect' });
			});
			this.host.currentPage = page;
		}
	}

	/**
	 * Life-cycle method
	 * - listen to text match clicks from `source`
	 */
	ngAfterContentInit() {
		const { suspectResult$: suspect$, contentMode$ } = this.reportService;
		const { textMatchClick$, sourceHtml$ } = this.highlightService;
		textMatchClick$
			.pipe(
				untilDestroy(this),
				filter(ev => ev.origin === 'source' && ev.broadcast),
				withLatestFrom(suspect$)
			)
			.subscribe(([{ elem }, suspect]) => {
				if (elem) {
					this.handleBroadcast(elem.match, suspect.result, 'text');
				}
			});

		sourceHtml$
			.pipe(
				withLatestFrom(suspect$, contentMode$),
				filter(([, , content]) => content === 'html'),
				filter(([, suspect]) => suspect && suspect.result && !suspect.result.html.value)
			)
			.subscribe(([match, suspect]) => this.handleBroadcast(match, suspect.result, 'html'));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

import { AfterContentInit, ContentChildren, Directive, QueryList, Host, OnDestroy } from '@angular/core';
import { MatchComponent } from '../match/match.component';
import { HighlightService } from '../../services/highlight.service';
import * as helpers from '../../utils/highlight-helpers';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { SuspectComponent } from '../suspect/suspect.component';
import { ReportService } from '../../services/report.service';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ScanResult } from '../../models';

@Directive({
	selector: '[crSuspectTextHelper]',
})
export class SuspectTextHelperDirective implements AfterContentInit, OnDestroy {
	constructor(
		@Host() private host: SuspectComponent,
		private highlightService: HighlightService,
		private reportService: ReportService
	) {}

	@ContentChildren(MatchComponent)
	private children: QueryList<MatchComponent>;

	/**
	 * Handle a match click that was broadcasted by the source text helper
	 * @param elem the broadcasted element
	 * @param suspect the suspected scan result
	 */
	handleBroadcast(elem: MatchComponent, suspect: ScanResult) {
		const [_, start] = helpers.findRespectiveMatch(elem.match, suspect.text.comparison, true);
		const page = helpers.findRespectivePage(elem.match.start, this.host.pages);
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
		this.highlightService.textMatchClick$
			.pipe(
				untilDestroy(this),
				filter(ev => ev.origin === 'source' && ev.broadcast),
				withLatestFrom(this.reportService.suspect$)
			)
			.subscribe(([{ elem }, { result }]) => this.handleBroadcast(elem, result));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

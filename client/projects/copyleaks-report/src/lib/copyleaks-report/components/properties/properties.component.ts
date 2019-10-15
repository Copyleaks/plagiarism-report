import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ReportStatistics } from '../../models';
import { CompleteResult } from '../../models/api-models/CompleteResult';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { StatisticsService } from '../../services/statistics.service';
import { fadeIn } from '../../utils/animations';
import { truthy } from '../../utils/operators';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'cr-properties',
	templateUrl: './properties.component.html',
	styleUrls: ['./properties.component.scss'],
	animations: [fadeIn],
})
export class PropertiesComponent implements OnInit, OnDestroy {
	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private statistics: StatisticsService
	) {}
	get done() {
		return this.progress === 100;
	}

	get total(): number {
		return this.metadata.scannedDocument.totalWords;
	}
	@HostBinding('class.mobile') isMobile: boolean;

	public stats: ReportStatistics;

	progress = 0;
	metadata: CompleteResult;

	identical: number;
	minor: number;
	related: number;
	customColors = [
		{ name: 'identical', value: '#ff6666' },
		{ name: 'minor changes', value: '#ff9a9a' },
		{ name: 'related meaning', value: '#ffd9b0' },
	];

	chartData = [];
	public share: boolean;
	public download: boolean;

	/**
	 * Download button click handler
	 */
	downloadClicked() {
		this.reportService.downloadBtnClicked({});
	}

	/**
	 * Share button click handler
	 */
	shareClicked() {
		this.reportService.shareBtnClicked({});
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - progress changes
	 * - scan metadata
	 * - share / download visibility
	 * - statistics
	 * - layout changes
	 */
	ngOnInit() {
		const { share$, download$, metadata$, progress$ } = this.reportService;
		metadata$.pipe(untilDestroy(this)).subscribe(meta => (this.metadata = meta));
		share$.pipe(untilDestroy(this)).subscribe(share => (this.share = share));
		download$.pipe(untilDestroy(this)).subscribe(download => (this.download = download));
		progress$.pipe(untilDestroy(this)).subscribe(value => (this.progress = value));
		this.statistics.statistics$
			.pipe(
				truthy(),
				untilDestroy(this)
			)
			.subscribe(value => {
				this.stats = value;
				this.chartData = [
					{ name: 'identical', value: value.identical },
					{ name: 'minor changes', value: value.minorChanges },
					{ name: 'related meaning', value: value.relatedMeaning },
				];
			});
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

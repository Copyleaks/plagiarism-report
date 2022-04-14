import {
	Component,
	HostBinding,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	ViewContainerRef,
	ViewChild,
	ComponentFactoryResolver,
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import {
	CopyleaksReportOptions,
	ResultPreview,
	ScanSource,
	ResultAccess,
	ResultPreviewComponentBase,
	CopyleaksResultCardAction,
	EResultPreviewType,
} from '../../models';
import { ScanResult } from '../../models/api-models/ScanResult';
import { CopyleaksTextConfig } from '../../models/CopyleaksTextConfig';
import { ReportService } from '../../services/report.service';
import { COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN } from '../../utils/constants';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';
import { DirectionService } from '../../services/direction.service';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'cr-result-card',
	templateUrl: './result-card.component.html',
	styleUrls: ['./result-card.component.scss'],
	providers: [DatePipe],
})
export class ResultCardComponent implements OnInit, OnDestroy {
	eResultPreviewType = EResultPreviewType;
	@HostBinding('class.mat-elevation-z3')
	public readonly elevation = true;
	@ViewChild('vcr', { read: ViewContainerRef })
	vcr: ViewContainerRef;
	@Input()
	public preview: ResultPreview;
	public previewDate: string;
	public metaDataToolTip: string;
	public result: ScanResult;
	public source: ScanSource;
	public loading = true;
	public access: ResultAccess = ResultAccess.locked;
	public resultAccess = ResultAccess;
	public options: CopyleaksReportOptions;
	public similarWords$: Observable<number>;
	public resultCardActions: CopyleaksResultCardAction[] = [];
	public translations: CopyleaksTranslations;
	private componentInstance: ResultPreviewComponentBase;

	get urlDomain() {
		if (this.preview && this.preview.url) {
			const url = new URL(this.preview.url);
			return url.host;
		}
		return 'copyleaks.com';
	}

	get previewIconToolTip() {
		if (this.preview) {
			switch (this.preview.type) {
				case EResultPreviewType.Internet:
					return this.translations &&
						this.translations.RESULT_CARD &&
						this.translations.RESULT_CARD.INTERNET_RESULT_TOOLTIP
						? this.translations.RESULT_CARD.INTERNET_RESULT_TOOLTIP
						: 'Internet Result';
				case EResultPreviewType.Database:
					return this.translations &&
						this.translations.RESULT_CARD &&
						this.translations.RESULT_CARD.INTERNAL_DATABASE_RESULT_TOOLTIP
						? this.translations.RESULT_CARD.INTERNAL_DATABASE_RESULT_TOOLTIP
						: 'Internal Database Result';
				case EResultPreviewType.Batch:
					return this.translations &&
						this.translations.RESULT_CARD &&
						this.translations.RESULT_CARD.BATCH_RESULT_TOOLTIP
						? this.translations.RESULT_CARD.BATCH_RESULT_TOOLTIP
						: 'Batch Result';
				case EResultPreviewType.Repositroy:
					return this.translations &&
						this.translations.RESULT_CARD &&
						this.translations.RESULT_CARD.REPOSITORY_RESULT_TOOLTIP
						? this.translations.RESULT_CARD.REPOSITORY_RESULT_TOOLTIP
						: 'Repository Result';
				default:
					return '';
			}
		}
		return '';
	}

	constructor(
		private translatesService: CopyleaksTranslateService,
		private componentFactoryResolver: ComponentFactoryResolver,
		private reportService: ReportService,
		public directionService: DirectionService,
		private datePipe: DatePipe,
		@Inject(COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN)
		public messages: CopyleaksTextConfig
	) {}

	/**
	 * Card click handler, will update the suspect id and switch to one-to-one view mode
	 */
	onTitleClick() {
		if (this.result) {
			this.reportService.configure({ viewMode: 'one-to-one', suspectId: this.preview.id });
		}
	}

	/**
	 * hide result
	 */
	hideResult() {
		this.reportService.hiddenResults$.pipe(untilDestroy(this), take(1)).subscribe(hiddenResultsIds => {
			this.reportService.setHiddenResults([...hiddenResultsIds, this.preview.id]);
		});
	}

	/**
	 * return the preview date from meta data
	 */
	private getPreviewDate() {
		if (
			this.preview?.metadata?.creationDate ||
			this.preview?.metadata?.lastModificationDate ||
			this.preview?.metadata?.publishDate
		) {
			try {
				const d = new Date(
					this.preview?.metadata?.creationDate ??
						this.preview?.metadata?.lastModificationDate ??
						this.preview?.metadata?.publishDate
				);
				if (Object.prototype.toString.call(d) === '[object Date]') {
					if (isNaN(d.getTime())) {
						return null;
					} else {
						return this.datePipe.transform(d);
					}
				} else {
					return null;
				}
			} catch {
				return null;
			}
		} else {
			return null;
		}
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - the scan result associated with this card
	 */
	ngOnInit() {
		this.translations = this.translatesService.translations;

		if (!this.preview) {
			return;
		}

		if (this.preview?.metadata?.filename) {
			let filename = this.preview?.metadata?.filename;
			try {
				filename = decodeURIComponent(this.preview?.metadata?.filename);
			} catch {
				filename = this.preview?.metadata?.filename;
			}
			this.preview.metadata.filename = filename;
		}

		this.previewDate = this.getPreviewDate();

		if (this.preview?.metadata?.author || this.preview?.metadata?.organization || this.previewDate) {
			const author = this.preview?.metadata?.author;
			const organization = this.preview?.metadata?.organization;
			const previewDate = this.previewDate;

			// tslint:disable-next-line: max-line-length
			this.metaDataToolTip = `${author ? author : ''}${author && organization ? ' • ' : ''}${
				organization ? organization : ''
			}${(author || organization) && previewDate ? ' • ' : ''}${previewDate ? previewDate : ''}`;
		}

		if (this.preview.component) {
			const factory = this.componentFactoryResolver.resolveComponentFactory<ResultPreviewComponentBase>(
				this.preview.component
			);
			setTimeout(() => {
				const ref = this.vcr?.createComponent<ResultPreviewComponentBase>(factory);
				if (ref) {
					this.componentInstance = ref.instance;
					if (this.componentInstance.setPreview) {
						this.componentInstance.setPreview(this.preview);
					}
					if (this.componentInstance.isLoading) {
						this.componentInstance.isLoading(this.loading);
					}

					this.componentInstance.setParentRef(this);
				}
			}, 100);
		}

		const result$ = this.reportService.findResultById$(this.preview.id);
		const { source$, options$, resultCardActions$ } = this.reportService;
		combineLatest([result$, source$])
			.pipe(untilDestroy(this))
			.subscribe(([result, source]) => {
				this.source = source;
				this.result = result.result;
				this.loading = false;
				if (this.componentInstance) {
					if (this.componentInstance.isLoading) {
						this.componentInstance.isLoading(this.loading);
					}
					if (this.componentInstance.setResult) {
						this.componentInstance.setResult(result);
					}
				}
			});
		this.similarWords$ = combineLatest([result$, options$]).pipe(
			untilDestroy(this),
			map(([result, options]) => {
				if (result && result.result && options) {
					const { showIdentical, showMinorChanges, showRelated } = options;
					const { identical, minorChanges, relatedMeaning } = result.result.statistics;
					return (
						(showIdentical ? identical : 0) + (showMinorChanges ? minorChanges : 0) + (showRelated ? relatedMeaning : 0)
					);
				}
				return this.preview.matchedWords;
			})
		);

		resultCardActions$
			.pipe(
				untilDestroy(this),
				filter(r => !!r && r.length !== 0)
			)
			.subscribe(res => {
				this.resultCardActions = res;
			});
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}

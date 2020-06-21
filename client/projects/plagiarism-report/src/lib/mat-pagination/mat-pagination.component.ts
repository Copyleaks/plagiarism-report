import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnInit } from '@angular/core';
import {
	CopyleaksTranslateService,
	CopyleaksTranslations,
} from '../plagiarism-report/services/copyleaks-translate.service';

export interface PageChangeEvent {
	currentPage: number;
	previousPage: number;
	totalPages: number;
}

@Component({
	selector: 'cr-mat-pagination',
	templateUrl: './mat-pagination.component.html',
	styleUrls: ['./mat-pagination.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class MatPaginationComponent implements OnInit {
	@Input() totalPages = 1;

	@Output() page = new EventEmitter<PageChangeEvent>();
	private _currentPage = 1;
	translations: CopyleaksTranslations;
	@Input()
	public get currentPage(): number {
		return this._currentPage;
	}
	public set currentPage(v: number) {
		const currentPage = coerceNumberProperty(v);
		this._currentPage = Math.min(Math.max(currentPage, 1), this.totalPages);
		this.currentPageChange.emit(currentPage);
	}
	@Output()
	currentPageChange = new EventEmitter<number>();

	private _disabled: boolean;
	@Input()
	get disabled() {
		return this._disabled;
	}
	set disabled(value) {
		this._disabled = coerceBooleanProperty(value);
	}

	private _showFirstLastButtons: boolean;
	@Input()
	get showFirstLastButtons() {
		return this._showFirstLastButtons;
	}
	set showFirstLastButtons(value) {
		this._showFirstLastButtons = coerceBooleanProperty(value);
	}
	constructor(private translationsService: CopyleaksTranslateService) {}
	/**
	 * init translations on component init
	 */
	ngOnInit() {
		this.translations = this.translationsService.translations;
	}
	/**
	 * Navigate to the next page.
	 * This will cause the paginator to emit a `PageChangeEvent`
	 */
	next() {
		const previousPage = this.currentPage;
		this.currentPage = this.currentPage + 1;
		this.page.emit({
			currentPage: this.currentPage,
			totalPages: this.totalPages,
			previousPage,
		});
	}
	/**
	 * Navigate to the previous page.
	 * This will cause the paginator to emit a `PageChangeEvent`
	 */
	back() {
		const previousPage = this.currentPage;
		this.currentPage = this.currentPage - 1;
		this.page.emit({
			currentPage: this.currentPage,
			totalPages: this.totalPages,
			previousPage,
		});
	}
	/**
	 * Navigate to page.
	 * This will cause the paginator to emit a `PageChangeEvent`
	 */
	goToPage(page: number) {
		const previousPage = this.currentPage;
		this.currentPage = page;
		this.page.emit({
			currentPage: this.currentPage,
			totalPages: this.totalPages,
			previousPage,
		});
	}

	/**
	 * On blur handler for the paginator input will update the input with the current page
	 * @param event the default blur event object
	 */
	onInputBlur(event: FocusEvent) {
		(event.target as HTMLInputElement).value = `${this._currentPage}`;
	}

	/**
	 * flag indicating whether the paginator has multiple pages
	 */
	public get hasPages() {
		return this.totalPages > 1;
	}
	/**
	 * check if the paginator is at the first page
	 */
	public get isFirstPage() {
		return this.currentPage === 1;
	}
	/**
	 * check if the paginator is at the last page
	 */
	public get isLastPage() {
		return this.currentPage === this.totalPages;
	}
}

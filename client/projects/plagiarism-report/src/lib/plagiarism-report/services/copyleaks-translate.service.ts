import { Injectable } from '@angular/core';

@Injectable()
export class CopyleaksTranslateService {
	private _translations: CopyleaksTranslations;
	get translations() {
		return this._translations;
	}
	/**
	 * set translations for report texts.
	 * @param translations a list of results ids to be filtered.
	 */
	setTranslations(translations: CopyleaksTranslations) {
		this._translations = translations;
	}
}

export interface CopyleaksTranslations {
	PLAGIARISM_FREE?: string;
	PLAGIARISM_FREE_WITH_RESULTS?: string;
	PLAGIARISM_FREE_WITH_NOTIFICATIONS?: string;
	SCAN_PROPERTIES_SECTION?: {
		TITLE?: string;
		SCANNING?: {
			PROGRESS?: string;
			DONE?: string;
			LOADING?: string;
			SCANNED?: string;
		};
		RESULTS_FOUND?: string;
		RESULTS_FOUND_TOOLTIP?: string;
		SIMILAR_WORDS?: string;
		SIMILAR_WORDS_TOOPTIP?: string;
		MATCH?: string;
		ACTIONS?: {
			HELP?: string;
			SHARE?: string;
			DOWNLOAD?: string;
			DOWNLOADING?: string;
			SETTINGS?: string;
		};
	};
	SUBMITTED_TEXT_SECTION?: {
		TITLE?: string;
	};
	SUSPECT_SECTION?: {
		TITLE?: string;
	};
	RESULTS_SECTION?: {
		TITLE?: string;
		FILTER_TOOLTIP?: string;
		FILTERED_RESULTS_TOOLTIP?: string;
		CLEAR_FILTER?: string;
	};
	RESULT_CARD?: {
		ACTIONS?: {
			EXCLUDE?: string;
		};
		SIMILAR_WORDS?: string;
		RESULT_ERROR?: string;
		INTERNET_RESULT_TOOLTIP?: string;
		INTERNAL_DATABASE_RESULT_TOOLTIP?: string;
		BATCH_RESULT_TOOLTIP?: string;
		REPOSITORY_RESULT_TOOLTIP?: string;
	};
	FILTER_DIALOG?: {
		TITLE?: string;
		SEARCH_PLACHOLDER?: string;
		CHECK_ALL?: string;
		UNCHECK_ALL?: string;
	};
	RESULTS_SETTINGS_DIALOG?: {
		TITLE?: string;
		SHOW_TOP_100_RESULT?: string;
		SET_DEFAULT?: string;
	};
	SCAN_SETTINGS?: {
		OMITTED?: {
			QUOTATIONS: string;
			REFERENCES: string;
			CITATIONS: string;
			HTML_TEMPLATES: string;
			TABLES_OF_CONTENT: string;
			SOURCE_CODE_COMMENTS: string;
			SENSITIVE_DATA: string;
			PARTIAL_SCAN: string;
		};
	};
	TIME_AGO?: {
		FEW_SECONDS_AGO?: string;
		MINUTE_AGO?: string;
		MINUTES_AGO?: string;
		HOUR_AGO?: string;
		HOURS_AGO?: string;
		DAY_AGO?: string;
		DAYS_AGO?: string;
		MONTH_AGO?: string;
		MONTHS_AGO?: string;
		YEAR_AGO?: string;
		YEARS_AGO?: string;
	};
	SHARED?: {
		ACTIONS?: {
			CLOSE?: string;
			SWITCH_TO_TEXTUAL_MODE?: string;
			SWITCH_TO_RICH_TEXT_MODE?: string;
			GO_TO_NEXT_MATCH?: string;
			GO_TO_PREV_MATCH?: string;
			LAUNCH_URL?: string;
			ALIGN_LEFT?: string;
			ALIGN_RIGHT?: string;
			DECREASE_FONT_SIZE?: string;
			INCREASE_FONT_SIZE?: string;
			NEXT_PAGE?: string;
			LAST_PAGE?: string;
			PREV_PAGE?: string;
			FIRST_PAGE?: string;
		};
		WORDS?: string;
		MATCH_TYPES?: {
			ORIGINAL?: string;
			IDENTICAL?: string;
			IDENTICAL_TOOLTIP?: string;
			MINOR_CHANGES?: string;
			MINOR_CHANGES_TOOLTIP?: string;
			RELATED_MEANING?: string;
			RELATED_MEANING_TOOLTIP?: string;
			OMITTED_WORDS?: string;
			OMITTED_WORDS_TOOLTIP?: string;
			OMITTED_MATCH_TOOLTIP_TEXT?: string;
		};
		SAVE?: string;
		OF?: string;
		POWERED_BY?: string;
	};
}

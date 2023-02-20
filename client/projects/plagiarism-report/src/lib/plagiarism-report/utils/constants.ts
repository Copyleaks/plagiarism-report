import { InjectionToken } from '@angular/core';
import { CopyleaksReportConfig, CopyleaksReportOptions } from '../models';
import { CopyleaksTextConfig } from '../models/CopyleaksTextConfig';

/** Constants related to `report.service.ts` */
export const REPORT_SERVICE_CONSTANTS = {
	RESULTS_SETTINGS_KEY: 'copyleaks-results-settings',
	BTN_THROTTLE_MS: 250,
};

/** A default result options of the report */
export const DEFAULT_OPTIONS: CopyleaksReportOptions = {
	showPageSources: false,
	showOnlyTopResults: true,
	showRelated: true,
	showIdentical: true,
	showMinorChanges: true,
	setAsDefault: false,
};
/** The default config of the report component. */
export const DEFAULT_REPORT_CONFIG: CopyleaksReportConfig = {
	contentMode: 'html',
	download: false,
	settings: true,
	help: false,
	disableSuspectBackButton: false,
	options: { ...DEFAULT_OPTIONS },
	scanId: null,
	share: false,
	sourcePage: 1,
	suspectId: null,
	suspectPage: 1,
	viewMode: 'one-to-many',
};
/**
 * Default text messages for the report
 */
export const DEFAULT_TEXT_CONFIG: CopyleaksTextConfig = {
	RESULT_PUSH_ERROR: 'Unable to retrieve result content at this time. Please try again later.',
	IDENTICAL_TOOLTIP_TEXT: 'Identical matches are one to one exact wording in the text. Click to disable',
	MINOR_CHANGES_TOOLTIP_TEXT: 'Nearly identical with different form, ie "slow" becomes "slowly". Click to disable',
	RELATED_MEANING_TOOLTIP_TEXT: 'Close meaning but different words used to convey the message. Click to disable',
	OMITTED_WORDS_TOOLTIP_TEXT: 'Words that have been hidden.',
	MATCH_TYPE_OMITTED_TOOLTIP_TEXT: 'Omitted by your configuration. Click to enable',
};
/** Font size unit for increasing/decreasing font size while in `text` content mode */
export const TEXT_FONT_SIZE_UNIT = 0.25;

/** Max font size zoom level */
export const MAX_TEXT_ZOOM = 4;

/** Min font size zoom level */
export const MIN_TEXT_ZOOM = 0.5;

const msgWrongArgumentText = 'Wrong argument supplied. Provided data should match the type ';

/** User messages for text exclusion cases */
export const EXCLUDE_MESSAGE = {
	1: 'Quotations are omitted according to your settings',
	2: 'References are omitted according to your settings',
	5: 'HTML templates are omitted according to your settings',
	6: 'Tables of content are omitted according to your settings',
	7: 'Source code comments are omitted according to your settings',
	0: 'Sensitive data are hidden according to your settings',
	8: 'This text was not scanned because there were not enough pages. Please upgrade your plan in order to scan the entire document.',
	9: 'Citations are omitted according to your settings',
};

/** Injection token used to override the default config of the report */
export const COPYLEAKS_CONFIG_INJECTION_TOKEN = new InjectionToken<CopyleaksReportConfig>('copyleaks-config');

/** Injection token used to override the default text messages of the report */
export const COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN = new InjectionToken<CopyleaksTextConfig>('copyleaks-text-config');

/** The current Copyleaks API version that this library supports */
export const CURRENT_API_VERSION = 3;

/** Message used for `CompleteResult` object validation error */
export const COMPLETE_RESULT_VALIDATION_ERROR = {
	errorText: msgWrongArgumentText + 'CompleteResult interface.',
	visitUrl: 'https://api.copyleaks.com/documentation/v3/webhooks/completed',
	result: {
		status: 0,
		developerPayload: 'Custom developer payload',
		scannedDocument: {
			scanId: 'string',
			totalWords: 0,
			totalExcluded: 0,
			credits: 0,
			creationTime: 'string',
			metadata: {
				finalUrl: 'string',
				canonicalUrl: 'string',
				author: 'string',
				organization: 'string',
				filename: 'string',
				publishDate: 'string',
				creationDate: 'string',
				lastModificationDate: 'string',
			},
		},
		results: {
			internet: [
				{
					id: 'string',
					title: 'string',
					introduction: 'string',
					matchedWords: 0,
					url: 'string',
					metadata: {
						finalUrl: 'string',
						canonicalUrl: 'string',
						author: 'string',
						organization: 'string',
						filename: 'string',
						publishDate: 'string',
						creationDate: 'string',
						lastModificationDate: 'string',
					},
				},
			],
			database: [
				{
					id: 'string',
					title: 'string',
					introduction: 'string',
					matchedWords: 0,
					scanId: 'string',
					metadata: {
						finalUrl: 'string',
						canonicalUrl: 'string',
						author: 'string',
						organization: 'string',
						filename: 'string',
						publishDate: 'string',
						creationDate: 'string',
						lastModificationDate: 'string',
					},
				},
			],
			batch: [
				{
					id: 'string',
					title: 'string',
					introduction: 'string',
					matchedWords: 0,
					scanId: 'string',
					metadata: {
						finalUrl: 'string',
						canonicalUrl: 'string',
						author: 'string',
						organization: 'string',
						filename: 'string',
						publishDate: 'string',
						creationDate: 'string',
						lastModificationDate: 'string',
					},
				},
			],
			repositories: [
				{
					id: 'string',
					title: 'string',
					introduction: 'string',
					matchedWords: 0,
					repositoryId: 'string',
					scanId: 'string',
					metadata: {
						finalUrl: 'string',
						canonicalUrl: 'string',
						author: 'string',
						organization: 'string',
						filename: 'string',
						publishDate: 'string',
						creationDate: 'string',
						lastModificationDate: 'string',
						submittedBy: 'string',
					},
				},
			],
			score: {
				identicalWords: 0,
				minorChangedWords: 0,
				relatedMeaningWords: 0,
				aggregatedScore: 0,
			},
		},
		downloadableReport: {
			status: 'Success = 0',
			report: 'string',
		},
		notifications: {
			alerts: [
				{
					code: 'string',
					title: 'string',
					message: 'string',
					helpLink: 'string',
					severity: 0,
					additionalData: 'string',
				},
			],
		},
	},
};

/** Message used for `NewResult` object validation error */
export const NEW_RESULT_VALIDATION_ERROR = {
	errorText: msgWrongArgumentText + 'NewResult interface.',
	visitUrl: 'https://api.copyleaks.com/documentation/v3/webhooks/new-result',
	result: {
		internet: [
			{
				id: 'string',
				title: 'string',
				introduction: 'string',
				matchedWords: 0,
				url: 'string',
				metadata: {
					finalUrl: 'string',
					canonicalUrl: 'string',
					author: 'string',
					organization: 'string',
					filename: 'string',
					publishDate: 'string',
					creationDate: 'string',
					lastModificationDate: 'string',
				},
			},
		],
		database: [
			{
				id: 'string',
				title: 'string',
				introduction: 'string',
				matchedWords: 0,
				scanId: 'string',
				metadata: {
					finalUrl: 'string',
					canonicalUrl: 'string',
					author: 'string',
					organization: 'string',
					filename: 'string',
					publishDate: 'string',
					creationDate: 'string',
					lastModificationDate: 'string',
				},
			},
		],
		batch: [
			{
				id: 'string',
				title: 'string',
				introduction: 'string',
				matchedWords: 0,
				scanId: 'string',
				metadata: {
					finalUrl: 'string',
					canonicalUrl: 'string',
					author: 'string',
					organization: 'string',
					filename: 'string',
					publishDate: 'string',
					creationDate: 'string',
					lastModificationDate: 'string',
				},
			},
		],
		repositories: [
			{
				id: 'string',
				title: 'string',
				introduction: 'string',
				matchedWords: 0,
				repositoryId: 'string',
				scanId: 'string',
				metadata: {
					finalUrl: 'string',
					canonicalUrl: 'string',
					author: 'string',
					organization: 'string',
					filename: 'string',
					publishDate: 'string',
					creationDate: 'string',
					lastModificationDate: 'string',
					submittedBy: 'string',
				},
			},
		],
	},
};

/** Message used for `ScanResult` object validation error */
export const SCAN_RESULT_VALIDATION_ERROR = {
	errorText: msgWrongArgumentText + 'ScanResult interface.',
	visitUrl: 'https://api.copyleaks.com/documentation/v3/downloads/result',
	result: {
		statistics: {
			identical: 0,
			minorChanges: 0,
			relatedMeaning: 0,
		},
		text: {
			value: 'Hello world!',
			pages: {
				startPosition: [0],
			},
			comparison: {
				identical: {
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
				minorChanges: {
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
				relatedMeaning: {
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
			},
		},
		html: {
			value: '<HTML><body><h3>Hello world!</h3></body></HTML>',
			comparison: {
				identical: {
					groupId: [0],
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
				minorChanges: {
					groupId: [0],
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
				relatedMeaning: {
					groupId: [0],
					source: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
					suspected: {
						chars: {
							starts: [0],
							lengths: [1],
						},
						words: {
							starts: [0],
							lengths: [1],
						},
					},
				},
			},
		},
	},
};

/** Message used for `ScanSource` object validation error */
export const SCAN_SOURCE_VALIDATION_ERROR = {
	errorText: msgWrongArgumentText + 'ScanSource interface.',
	visitUrl: `https://api.copyleaks.com/documentation/v${CURRENT_API_VERSION}`,
	result: {
		metadata: {
			words: 30,
			excluded: 2,
		},
		html: {
			value:
				'<html><body><h1>Example Domain</h1><p>This domain is established to be used for illustrative examples in documents.</body></html>',
			exclude: {
				starts: [16],
				lengths: [14],
				reasons: [3],
				groupIds: [1],
			},
		},
		text: {
			value: 'Example Domain This domain is established to be used for illustrative examples in documents.',
			exclude: {
				starts: [0],
				lengths: [14],
				reasons: [3],
			},
			pages: {
				startPosition: [0],
			},
		},
	},
};

/** Message used for `version` number validation error */
export const VERSION_VALIDATION_ERROR = {
	errorText:
		'Argument was generated by an outdated version of the API.\n' +
		`please provide an argument generated by API version: ${CURRENT_API_VERSION}\n`,
	visitUrl: `https://api.copyleaks.com/documentation/v${CURRENT_API_VERSION}`,
	result: { version: `v${CURRENT_API_VERSION}` },
};

/** Alerts consts */
export const ALERTS = {
	SUSPECTED_CHARACTER_REPLACEMENT_CODE: 'suspected-character-replacement',
	SUSPECTED_CHEATING_DETECTED_CODE: 'suspected-cheating-detected',
	SUSPECTED_AI_TEXT_DETECTED: 'suspected-ai-text',
};

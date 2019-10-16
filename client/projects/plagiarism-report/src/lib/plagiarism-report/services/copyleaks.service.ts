import { Injectable } from '@angular/core';
import { CompleteResult, NewResult, ScanResult, ScanSource } from '../models';
import {
	COMPLETE_RESULT_VALIDATION_ERROR,
	NEW_RESULT_VALIDATION_ERROR,
	SCAN_RESULT_VALIDATION_ERROR,
	SCAN_SOURCE_VALIDATION_ERROR,
	VERSION_VALIDATION_ERROR,
} from '../utils/constants';
import { ReportService } from './report.service';

@Injectable({
	providedIn: 'root',
})
export class CopyleakService {
	constructor(private reportService: ReportService) {}
	/**
	 * Insert the completion result of a scan to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/completed
	 * @param result the completed result
	 */
	pushCompletedResult(result: CompleteResult) {
		if (!this.isCompleteResult(result)) {
			throw new Error(COMPLETE_RESULT_VALIDATION_ERROR);
		}
		this.reportService.setMetadata(result);
	}

	/**
	 * Insert an incoming new scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/webhooks/new-result
	 * @param result the new result
	 */
	private pushNewResult(result: NewResult) {
		if (!this.isNewResult(result)) {
			throw new Error(NEW_RESULT_VALIDATION_ERROR);
		}
	}

	/**
	 * Insert the downloaded source you scanned to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/source
	 * @param source the downloaded source
	 */
	pushDownloadedSource(source: ScanSource) {
		if (!this.isCorrectVersion(source)) {
			throw new Error(VERSION_VALIDATION_ERROR);
		}
		if (!this.isScanSource(source)) {
			throw new Error(SCAN_SOURCE_VALIDATION_ERROR);
		}
		this.reportService.setSource(source);
	}
	/**
	 * Insert a downloaded scan result to the report.
	 * @see https://api.copyleaks.com/documentation/v3/downloads/result
	 * @param id the result id
	 * @param result the downloaded result object
	 */
	pushScanResult(id: string, result: ScanResult) {
		if (typeof id !== 'string') {
			throw new Error(`Argument "id" must be a string`);
		}
		if (!this.isScanResult(result)) {
			throw new Error(SCAN_RESULT_VALIDATION_ERROR);
		}
		this.reportService.addDownloadedResult(id, result);
	}

	/**
	 * TODO
	 * Change the progress percentage in the report manualy
	 * @param progress an integer between 0 ~ 100
	 */
	setProgress(progress: number) {
		this.reportService.setProgress(progress);
	}

	/**
	 * Notify the service that you are done loading results
	 */
	done = () => this.reportService.done();

	// Simple object validation
	private isCompleteResult = (o: CompleteResult) => !!o.scannedDocument && !!o.results;
	private isScanSource = (o: ScanSource) => !!o.metadata && !!o.text && !!o.version;
	private isScanResult = (o: ScanResult) => !!o.text && !!o.statistics && !!o.version;
	private isNewResult = (o: NewResult) => !!o.internet && !!o.database && !!o.batch;
	private isCorrectVersion = ({ version }: ScanResult | ScanSource) => version === 3;
}

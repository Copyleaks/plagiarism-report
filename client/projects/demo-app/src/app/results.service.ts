import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompleteResult, ScanSource, ScanResult } from 'projects/plagiarism-report/src/public-api';

@Injectable({
	providedIn: 'root',
})
export class ResultsService {
	constructor(private http: HttpClient) {}
	public completeResult(scanId: string) {
		return this.http.get<CompleteResult>(`http://localhost:4206/${scanId}/complete.json`);
	}
	public downloadedSource(scanId: string) {
		return this.http.get<ScanSource>(`http://localhost:4206/${scanId}/source.json`);
	}
	public newResult(scanId: string, resultId: string) {
		return this.http.get<ScanResult>(`http://localhost:4206/${scanId}/results/${resultId}.json`);
	}
}

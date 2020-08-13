# Showing Progress on the report

While you are downloading the results for the report component, you can display a percentage indicating your progress in doing so.

```ts
@Component({
  // ...
})
export class SomeComponent {
  constructor(private copyleaksService: CopyleaksService, private http: HttpClient) {
    let downloadedResults = 0;
    let totalResults = 0;
    const scanId = "some-scan-id";

    // download the source
    // TODO:
    // USE YOUR SOURCE ENDPOINT
    http
      .get<ScanSource>(`/copyleaks/${scanId}/source`)
      .subscribe(source => copyleaksService.pushDownloadedSource(source));

    // download the complete result
    // TODO:
    // USE YOUR COMPLETE RESULT ENDPOINT
    http.get<CompleteResult>(`/copyleaks/${scanId}/complete`).subscribe(completeResult => {
      copyleaksService.pushCompletedResult(completeResult);

      // download each scan result
      const { internet, database, batch } = completeResult.results;
      totalResults = internet.length + database.length + batch.length;

      // TODO:
      // USE YOUR RESULT ENDPOINT
      for (const result of internet) {
        http.get<ScanResult>(`/copyleaks/${scanId}/results/${result.id}`).subscribe(scanResult => {
          copyleaksService.pushScanResult(result.id, scanResult);
          copyleaksService.setProgress((++downloadedResults / totalResults) * 100);
        });
      }
      // TODO:
      // USE YOUR RESULT ENDPOINT
      for (const result of database) {
        http.get<ScanResult>(`/copyleaks/${scanId}/results/${result.id}`).subscribe(scanResult => {
          copyleaksService.pushScanResult(result.id, scanResult);
          copyleaksService.setProgress((++downloadedResults / totalResults) * 100);
        });
      }
      // TODO:
      // USE YOUR RESULT ENDPOINT
      for (const result of batch) {
        http.get<ScanResult>(`/copyleaks/${scanId}/results/${result.id}`).subscribe(scanResult => {
          copyleaksService.pushScanResult(result.id, scanResult);
          copyleaksService.setProgress((++downloadedResults / totalResults) * 100);
        });
      }
    });
  }
}
```
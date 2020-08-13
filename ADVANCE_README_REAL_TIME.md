# Real-Time usage

> **Note:** This method is optional and more advanced

Copyleaks' scan process could take a few seconds if there are a lot of results. It is possible to push the API results as they arrive to your server from Copyleaks API. This can be achieved with web sockets.
Copyleaks API can utilize the [New Result Webhook][api:newresult] every time a single result is ready.
This will basically display the result on the results list while it is fetching the actual content of the result.

> **Note:** The New Result Webhook sends only a preview of the actual result. You must download the actual result, and pass it to `CopyleaksService`

In general it should flow like this:

1. Use [Copyleaks API][api] to scan for plagiarism while providing the relevant [webhook configuration][api:submit:file].
2. Once a [New Result Webhook][api:newresult] arrived on your server, publish it to the relevant web socket connections.
3. Push the new result data to `CopyleaksService` and start downloading the actual result

**Push NewResult:**

> **Note:** This is just an rough example , the implementation of `newResultsListener(scanId)` is under your responsibility

```ts
@Component({
  // ...
})
export class SomeComponent {
  constructor(private copyleaksService: CopyleaksService, private http: HttpClient) {
    const scanId = "some-scan-id";

    // listen to incoming new results
    newResultsListener(scanId).subscribe(newResult => {
      // push the new result to the report
      copyleaksService.pushNewResult(newResult);

      // one of them must contain the result preview.
      const result = newResult.internet[0] || newResult.batch[0] || newResult.database[0];

      // download and push the actual scan result
      http
        .get<ScanResult>(`/copyleaks/${scanId}/results/${result.id}`)
        .subscribe(scanResult => copyleaksService.pushScanResult(result.id, scanResult));
    });
  }
}
```

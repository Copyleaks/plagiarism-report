import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoutingModule } from './routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ScanResultComponent } from './components/scan-result/scan-result.component';
import { ReportResultsOverlayComponent } from './components/report-results-overlay/report-results-overlay.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ReportScanSummeryComponent } from './components/report-scan-summery/report-scan-summery.component';

@NgModule({
	declarations: [
		AppComponent,
		ScanResultComponent,
		ReportResultsOverlayComponent,
		ReportScanSummeryComponent],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FlexLayoutModule,
		RoutingModule,
		MatListModule,
		MatIconModule,
		MatButtonModule,
		MatListModule,
		MatTooltipModule,
		MatMenuModule
	],
	providers: [],
	bootstrap: [AppComponent],
	entryComponents: [ScanResultComponent, ReportResultsOverlayComponent, ReportScanSummeryComponent]
})
export class AppModule { }

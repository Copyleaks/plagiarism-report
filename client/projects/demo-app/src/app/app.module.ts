import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoutingModule } from './routing.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { ScanResultComponent } from './components/scan-result/scan-result.component';
import { ReportResultsOverlayComponent } from './components/report-results-overlay/report-results-overlay.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { ReportScanSummeryComponent } from './components/report-scan-summery/report-scan-summery.component';

@NgModule({
    declarations: [AppComponent, ScanResultComponent, ReportResultsOverlayComponent, ReportScanSummeryComponent],
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
        MatMenuModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}

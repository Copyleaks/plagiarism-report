import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { ChartCommonModule, PieChartModule } from '@swimlane/ngx-charts';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { MatPaginationModule } from '../mat-pagination/mat-pagination.module';
import { PanelModule } from '../panel/panel.module';
import { SharedModule } from '../shared/shared.module';
import { OptionsDialogComponent } from './components/options-dialog/options-dialog.component';
import { OriginalComponent } from './components/original/original.component';
import { PoweredByComponent } from './components/powered-by/powered-by.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { ResultCardComponent } from './components/result-card/result-card.component';
import { ResultsFilterDialogComponent } from './components/results-filter-dialog/results-filter-dialog.component';
import { ResultsComponent } from './components/results/results.component';
import { SuspectComponent } from './components/suspect/suspect.component';
import { CopyleaksReportComponent, CustomReportActionComponent } from './copyleaks-report.component';

import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { AlertCardComponent } from './components/alert-card/alert-card.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { ExcludePartialScanComponent } from './components/exclude-partial-scan/exclude-partial-scan.component';
import { OriginalHtmlHelperComponent } from './components/html-helpers/original-html-helper.component';
import { SourceHtmlHelperComponent } from './components/html-helpers/source-html-helper.component';
import { SuspectHtmlHelperComponent } from './components/html-helpers/suspect-html-helper.component';
import { MatchComponent } from './components/match/match.component';
import { NotificationsDialogComponent } from './components/notifications-dialog/notifications-dialog.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { PlagiarismFreeComponent } from './components/plagiarism-free/plagiarism-free.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { OriginalTextHelperDirective } from './components/text-helpers/original-text-helper.directive';
import { SourceTextHelperDirective } from './components/text-helpers/source-text-helper.directive';
import { SuspectTextHelperDirective } from './components/text-helpers/suspect-text-helper.directive';
import { CopyleaksReportConfig } from './models';
import { CopyleaksTextConfig } from './models/CopyleaksTextConfig';
import { CopyleaksTranslateService } from './services/copyleaks-translate.service';
import { CopyleaksService } from './services/copyleaks.service';
import { DirectionService } from './services/direction.service';
import {
	COPYLEAKS_CONFIG_INJECTION_TOKEN,
	COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN,
	DEFAULT_REPORT_CONFIG,
	DEFAULT_TEXT_CONFIG,
} from './utils/constants';
@NgModule({
    declarations: [
        SpinnerComponent,
        CopyleaksReportComponent,
        PropertiesComponent,
        ResultsComponent,
        OriginalComponent,
        ResultCardComponent,
        SuspectComponent,
        OptionsDialogComponent,
        ResultsFilterDialogComponent,
        PoweredByComponent,
        MatchComponent,
        OriginalHtmlHelperComponent,
        SourceHtmlHelperComponent,
        SuspectHtmlHelperComponent,
        OriginalTextHelperDirective,
        SourceTextHelperDirective,
        SuspectTextHelperDirective,
        PlagiarismFreeComponent,
        NotificationsComponent,
        NotificationsDialogComponent,
        AlertsComponent,
        AlertCardComponent,
        ExcludePartialScanComponent,
        CustomReportActionComponent,
    ],
    imports: [
        CommonModule,
        PanelModule,
        SharedModule,
        ExpansionPanelModule,
        MatIconModule,
        FormsModule,
        MatDividerModule,
        MatButtonModule,
        FlexLayoutModule,
        ChartCommonModule,
        PieChartModule,
        SatPopoverModule,
        MatTooltipModule,
        MatDialogModule,
        MatInputModule,
        MatMenuModule,
        MatListModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatRippleModule,
        NgxSkeletonLoaderModule,
        MatPaginationModule,
        MatProgressSpinnerModule,
        VirtualScrollerModule,
    ],
    providers: [
        CopyleaksService,
        CopyleaksTranslateService,
        DirectionService,
        { provide: COPYLEAKS_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_REPORT_CONFIG } },
        { provide: COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_TEXT_CONFIG } },
    ],
    exports: [CopyleaksReportComponent, CustomReportActionComponent]
})
export class CopyleaksReportModule {
	/**
	 * Modify the config that is added to the root module providers
	 * @param config the modified report config
	 * @param textConfig config containing custom text messages
	 */
	static forRoot(
		config = {} as CopyleaksReportConfig,
		textConfig = {} as CopyleaksTextConfig
	): ModuleWithProviders<CopyleaksReportModule> {
		return {
			ngModule: CopyleaksReportModule,
			providers: [
				{ provide: COPYLEAKS_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_REPORT_CONFIG, ...config } },
				{ provide: COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_TEXT_CONFIG, ...textConfig } },
			],
		} as ModuleWithProviders<CopyleaksReportModule>;
	}

	/**
	 * Modify the config that is added to the child module providers
	 * @param config the modified config
	 */
	static forChild(
		config = {} as CopyleaksReportConfig,
		textConfig = {} as CopyleaksTextConfig
	): ModuleWithProviders<CopyleaksReportModule> {
		return {
			ngModule: CopyleaksReportModule,
			providers: [
				{ provide: COPYLEAKS_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_REPORT_CONFIG, ...config } },
				{ provide: COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_TEXT_CONFIG, ...textConfig } },
			],
		} as ModuleWithProviders<CopyleaksReportModule>;
	}
}

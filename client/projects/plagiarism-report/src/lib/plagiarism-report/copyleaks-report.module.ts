import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import {
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatDividerModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatPaginatorModule,
	MatSlideToggleModule,
	MatTooltipModule,
	MatRippleModule,
	MatMenuModule,
	MatProgressSpinnerModule,
} from '@angular/material';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { PieChartModule, ChartCommonModule } from '@swimlane/ngx-charts';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { PanelModule } from '../panel/panel.module';
import { SharedModule } from '../shared/shared.module';
import { OriginalComponent } from './components/original/original.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { ResultCardComponent } from './components/result-card/result-card.component';
import { ResultsFilterDialogComponent } from './components/results-filter-dialog/results-filter-dialog.component';
import { ResultsSettingsDialogComponent } from './components/results-settings-dialog/results-settings-dialog.component';
import { ResultsComponent } from './components/results/results.component';
import { SuspectComponent } from './components/suspect/suspect.component';
import { CopyleaksReportComponent } from './copyleaks-report.component';
import { MatPaginationModule } from '../mat-pagination/mat-pagination.module';
import { PoweredByComponent } from './components/powered-by/powered-by.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';

import { DEFAULT_REPORT_CONFIG, COPYLEAKS_CONFIG_INJECTION_TOKEN } from './utils/constants';
import { CopyleaksReportConfig } from './models';
import { OriginalHtmlHelperComponent } from './components/html-helpers/original-html-helper.component';
import { SourceHtmlHelperComponent } from './components/html-helpers/source-html-helper.component';
import { SuspectHtmlHelperComponent } from './components/html-helpers/suspect-html-helper.component';
import { MatchComponent } from './components/match/match.component';
import { OriginalTextHelperDirective } from './components/text-helpers/original-text-helper.directive';
import { SuspectTextHelperDirective } from './components/text-helpers/suspect-text-helper.directive';
import { SourceTextHelperDirective } from './components/text-helpers/source-text-helper.directive';

@NgModule({
	declarations: [
		CopyleaksReportComponent,
		PropertiesComponent,
		ResultsComponent,
		OriginalComponent,
		ResultCardComponent,
		SuspectComponent,
		ResultsSettingsDialogComponent,
		ResultsFilterDialogComponent,
		PoweredByComponent,
		MatchComponent,
		OriginalHtmlHelperComponent,
		SourceHtmlHelperComponent,
		SuspectHtmlHelperComponent,
		OriginalTextHelperDirective,
		SourceTextHelperDirective,
		SuspectTextHelperDirective,
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
		ScrollingModule,
		ExperimentalScrollingModule,
	],
	providers: [],
	entryComponents: [ResultsSettingsDialogComponent, ResultsFilterDialogComponent],
	exports: [CopyleaksReportComponent],
})
export class CopyleaksReportModule {
	/**
	 * Modify the config that is added to the module providers
	 * @param config the modified config
	 */
	static forRoot(config: CopyleaksReportConfig): ModuleWithProviders {
		return {
			ngModule: CopyleaksReportModule,
			providers: [{ provide: COPYLEAKS_CONFIG_INJECTION_TOKEN, useValue: { ...DEFAULT_REPORT_CONFIG, ...config } }],
		};
	}
}

import { NgModule } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { ArrayPipe } from './pipes/array.pipe';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';

import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { WhitelistPipe } from './pipes/whitelist.pipe';
import { UniquePipe } from './pipes/unique.pipe';
import { SimilarityPipe } from './pipes/similarity.pipe';

/**
 * A shared module containing all sort of generic reuseable stuff
 */
@NgModule({
	declarations: [
		ShortNumberPipe,
		SafePipe,
		SearchPipe,
		ArrayPipe,
		TimeAgoPipe,
		WhitelistPipe,
		UniquePipe,
		SimilarityPipe,
		ClickStopPropagationDirective,
	],
	imports: [CommonModule],
	providers: [PercentPipe],
	exports: [
		ShortNumberPipe,
		SafePipe,
		SearchPipe,
		ArrayPipe,
		TimeAgoPipe,
		WhitelistPipe,
		SimilarityPipe,
		ClickStopPropagationDirective,
	],
})
export class SharedModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { ArrayPipe } from './pipes/array.pipe';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';

import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { WhitelistPipe } from './pipes/whitelist.pipe';
import { UniquePipe } from './pipes/unique.pipe';

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
		ClickStopPropagationDirective,
	],
	imports: [CommonModule],
	exports: [
		ShortNumberPipe,
		SafePipe,
		SearchPipe,
		ArrayPipe,
		TimeAgoPipe,
		WhitelistPipe,
		ClickStopPropagationDirective,
	],
})
export class SharedModule {}

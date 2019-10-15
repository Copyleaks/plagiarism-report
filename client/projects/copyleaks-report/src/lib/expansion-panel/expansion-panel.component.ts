import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { expandCollapseAnimation } from '../copyleaks-report/utils/animations';

@Component({
	selector: 'cr-expansion-panel',
	templateUrl: './expansion-panel.component.html',
	styleUrls: ['./expansion-panel.component.scss'],
	animations: [expandCollapseAnimation],
})
export class ExpansionPanelComponent {
	@Input() expanded = false;
	@Input() disabled = false;
	protected animationState = 'close';
	/**
	 * Flips the expansion panel `expanded` state.
	 *
	 * or close the panel accordingly
	 * @param force if given, will force the `expanded` state accordingly
	 */
	toggle(force?: boolean) {
		this.expanded = force === undefined ? !this.expanded : force;
		this.animationState = this.expanded ? 'open' : 'close';
	}
}

@Component({
	selector: 'cr-expansion-panel-title',
	template: '<ng-content></ng-content>',
	styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelTitleComponent {}

@Component({
	selector: 'cr-expansion-panel-menu',
	template: `
		<ng-content accept="cr-expansion-panel-menu-item"></ng-content>
	`,
	styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelMenuComponent {}

@Component({
	selector: 'cr-expansion-panel-menu-item',
	template: `
		<mat-divider vertical="true"></mat-divider>
		<ng-content></ng-content>
	`,
	styleUrls: ['./expansion-panel.component.scss'],
	// encapsulation: ViewEncapsulation.None
})
export class ExpansionPanelMenuItemComponent {}

@Component({
	selector: 'cr-expansion-panel-body',
	template: '<ng-content></ng-content>',
	styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelBodyComponent {}

import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[crClickStopPropagation]',
})
export class ClickStopPropagationDirective {
	/**
	 * Click event handler that will stop any propagation
	 * @param event  the default mouse event object
	 */
	@HostListener('click', ['$event'])
	public onClick(event: MouseEvent): void {
		event.stopPropagation();
	}
}

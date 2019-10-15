import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'array',
})
export class ArrayPipe implements PipeTransform {
	/**
	 * A pipe to create an array of some size where all elements are undefined
	 * Usefull for *ngFor binding
	 * @param size the `size` of the array
	 */
	transform(size: number): undefined[] {
		if (!size || isNaN(size) || size <= 0) {
			return [];
		}
		return Array.from({ length: size });
	}
}

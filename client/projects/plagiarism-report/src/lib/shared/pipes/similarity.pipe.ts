import { Pipe, PipeTransform } from '@angular/core';
import { PercentPipe } from '@angular/common';

@Pipe({
	name: 'similarity',
})
export class SimilarityPipe implements PipeTransform {
	constructor(private percentPipe: PercentPipe) {}
	/**
	 * Works like @angular/common PercentPipe but when value is larger than 0
	 * and the result string is 0% , it returns < 1%.
	 * See `PercentPipe` for params info.
	 */
	transform(value: any, digitsInfo?: string, locale?: string): string | null {
		let result = this.percentPipe.transform(value, digitsInfo, locale);
		if (value > 0 && parseFloat(result) === 0) {
			result = '< 1%';
		}
		if (value > 1) {
			result = '100%';
		}
		return result;
	}
}

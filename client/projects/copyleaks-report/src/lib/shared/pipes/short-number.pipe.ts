import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'shortNumber',
})
export class ShortNumberPipe implements PipeTransform {
	private readonly powers = [
		{ suffix: 'B', value: 10 ** 9 },
		{ suffix: 'M', value: 10 ** 6 },
		{ suffix: 'K', value: 10 ** 3 },
	];

	/**
	 * A pipe that transforms a number into a human readable string.
	 * For example: `1024 => 1K`, `1,111,111 => 1.1M`
	 * @param value the number to transform
	 * @param precision decimal percision
	 */
	transform(value: any, precision: number = 1) {
		if (!value || isNaN(value)) {
			return value;
		}
		precision = Math.min(Math.max(precision, 0), 3);
		const abs = Math.abs(value);
		const negative = value < 0;
		const rounder = 10 ** precision;
		const power = this.powers.find(elem => abs >= elem.value);
		let result = abs;
		let key = '';
		if (power) {
			result = abs / power.value;
			result = Math.round(result * rounder) / rounder;
			key = power.suffix;
		}
		return (negative ? '-' : '') + result + key;
	}
}

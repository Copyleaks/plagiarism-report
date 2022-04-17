import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';

import { Match } from '../models';
import * as helpers from '../utils/statistics';
describe('StatisticsService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ReportService],
			teardown: { destroyAfterEach: false },
		});
	});

	describe('merge intervals', () => {
		it('should merge the following intervals based on type - lower is better', () => {
			let data: Match[];
			let result: Match[];
			data = [
				{ start: 136, end: 137, type: 0 },
				{ start: 136, end: 137, type: 0 },
				{ start: 136, end: 137, type: 1 },
				{ start: 136, end: 137, type: 1 },
			];
			result = helpers.mergeWords(data);
			expect(result[0]).toEqual({ start: 136, end: 137, type: 0 });

			data = [
				{ start: 138, end: 139, type: 1 },
				{ start: 138, end: 147, type: 0 },
				{ start: 139, end: 147, type: 0 },
				{ start: 143, end: 147, type: 0 },
				{ start: 147, end: 148, type: 2 },
				{ start: 147, end: 148, type: 2 },
				{ start: 148, end: 153, type: 0 },
				{ start: 148, end: 153, type: 0 },
				{ start: 149, end: 153, type: 0 },
			];
			result = helpers.mergeWords(data);
			expect(result[0]).toEqual({ start: 138, end: 147, type: 0 });
			expect(result[1]).toEqual({ start: 147, end: 148, type: 2 });
			expect(result[2]).toEqual({ start: 148, end: 153, type: 0 });

			data = [
				{ start: 260, end: 261, type: 0 },
				{ start: 260, end: 261, type: 0 },
				{ start: 260, end: 261, type: 0 },
				{ start: 261, end: 262, type: 1 },
				{ start: 261, end: 262, type: 1 },
				{ start: 261, end: 262, type: 1 },
				{ start: 262, end: 285, type: 0 },
				{ start: 262, end: 289, type: 0 },
				{ start: 262, end: 297, type: 0 },
				{ start: 266, end: 267, type: 2 },
				{ start: 267, end: 272, type: 0 },
				{ start: 267, end: 272, type: 0 },
				{ start: 267, end: 272, type: 0 },
				{ start: 272, end: 273, type: 2 },
				{ start: 272, end: 273, type: 2 },
				{ start: 272, end: 273, type: 2 },
				{ start: 273, end: 291, type: 0 },
				{ start: 273, end: 296, type: 0 },
				{ start: 273, end: 296, type: 0 },
				{ start: 289, end: 290, type: 2 },
				{ start: 292, end: 293, type: 2 },
				{ start: 293, end: 294, type: 1 },
				{ start: 296, end: 297, type: 1 },
				{ start: 296, end: 297, type: 1 },
			];
			result = helpers.mergeWords(data);
			expect(result[0]).toEqual({ start: 260, end: 261, type: 0 });
			expect(result[1]).toEqual({ start: 261, end: 262, type: 1 });
			expect(result[2]).toEqual({ start: 262, end: 297, type: 0 });
			data = [
				{ start: 161, end: 162, type: 1 },
				{ start: 161, end: 162, type: 2 },
				{ start: 162, end: 163, type: 2 },
				{ start: 162, end: 168, type: 0 },
				{ start: 162, end: 181, type: 0 },
				{ start: 163, end: 168, type: 0 },
				{ start: 169, end: 170, type: 2 },
				{ start: 177, end: 181, type: 0 },
				{ start: 181, end: 182, type: 2 },
				{ start: 182, end: 188, type: 0 },
				{ start: 187, end: 188, type: 0 },
				{ start: 188, end: 189, type: 2 },
				{ start: 189, end: 194, type: 0 },
				{ start: 190, end: 194, type: 0 },
				{ start: 194, end: 195, type: 1 },
				{ start: 195, end: 196, type: 0 },
				{ start: 196, end: 198, type: 0 },
				{ start: 198, end: 199, type: 1 },
				{ start: 198, end: 199, type: 2 },
				{ start: 198, end: 201, type: 1 },
				{ start: 199, end: 201, type: 2 },
				{ start: 199, end: 202, type: 0 },
				{ start: 201, end: 202, type: 0 },
				{ start: 201, end: 215, type: 0 },
				{ start: 202, end: 203, type: 0 },
				{ start: 202, end: 207, type: 0 },
				{ start: 202, end: 211, type: 1 },
				{ start: 204, end: 205, type: 0 },
				{ start: 205, end: 215, type: 0 },
				{ start: 207, end: 218, type: 0 },
				{ start: 211, end: 218, type: 0 },
				{ start: 216, end: 218, type: 0 },
				{ start: 216, end: 223, type: 0 },
				{ start: 218, end: 219, type: 2 },
				{ start: 218, end: 223, type: 0 },
				{ start: 219, end: 223, type: 0 },
				{ start: 223, end: 224, type: 2 },
				{ start: 224, end: 225, type: 2 },
			];
			result = helpers.mergeWords(data);
			expect(result[0]).toEqual({ start: 161, end: 162, type: 1 });
			expect(result[1]).toEqual({ start: 162, end: 181, type: 0 });
			expect(result[2]).toEqual({ start: 181, end: 182, type: 2 });
			expect(result[3]).toEqual({ start: 182, end: 188, type: 0 });
			expect(result[4]).toEqual({ start: 188, end: 189, type: 2 });
			expect(result[5]).toEqual({ start: 189, end: 194, type: 0 });
			expect(result[6]).toEqual({ start: 194, end: 195, type: 1 });
			expect(result[7]).toEqual({ start: 195, end: 198, type: 0 });
			expect(result[8]).toEqual({ start: 198, end: 199, type: 1 });
			expect(result[9]).toEqual({ start: 199, end: 223, type: 0 });
			expect(result[10]).toEqual({ start: 223, end: 225, type: 2 });
		});
	});
});

export class Timer {
	public start = performance.now();
	constructor(private readonly name: string) {}
	/**
	 * stops the timer, logs the elapsed time and returns the milliseconds passed
	 */
	stop(): number {
		const time = performance.now() - this.start;
		console.dir('Timer:', this.name, 'finished in', Math.round(time), 'ms');
		return time;
	}
}

/** Type representing an event that fired inside of an iframe containing a scan html content */
export type PostMessageEvent = MatchClickEvent | MatchJumpEvent | MatchSelectEvent | MatchWarnEvent | UpgradePlanEvent;

/** base type of post message event */
interface BasePostMessageEvent {
	/** the name of the event */
	type: string;
}

/** Event type indicating a match was selected */
export interface MatchSelectEvent extends BasePostMessageEvent {
	type: 'match-select';
	/** the index of the match that was selected */
	index: number;
}

/** Event type indicating a match was clicked */
export interface MatchClickEvent extends BasePostMessageEvent {
	type: 'match-click';
	/** the index of the match that was clicked */
	index: number;
}
/** Event type indicating a match jump was requested */

export interface MatchJumpEvent extends BasePostMessageEvent {
	type: 'match-jump';
	/** the direction of the jump */
	forward: boolean;
}

/** Event type indicating a something has gone wrong */
export interface MatchWarnEvent extends BasePostMessageEvent {
	type: 'match-warn';
	/** possible payload of the event */
	payload?: any;
}
export interface UpgradePlanEvent extends BasePostMessageEvent {
	type: 'upgrade-plan';
}

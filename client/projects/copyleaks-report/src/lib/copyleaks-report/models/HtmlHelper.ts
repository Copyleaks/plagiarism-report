import { ViewMode } from './CopyleaksReportConfig';

export type PostMessageEvent = MatchClickEvent | MatchJumpEvent | MatchSelectEvent | MatchWarnEvent;
export type OriginalOrSuspect = 'original' | 'suspect';
interface BasePostMessageEvent {
	type: string;
}

export interface MatchSelectEvent extends BasePostMessageEvent {
	type: 'match-select';
	index: number;
}

export interface MatchClickEvent extends BasePostMessageEvent {
	type: 'match-click';
	index: number;
	on?: boolean;
}
export interface MatchJumpEvent extends BasePostMessageEvent {
	type: 'match-jump';
	forward: boolean;
}

export interface MatchWarnEvent extends BasePostMessageEvent {
	type: 'match-warn';
	payload?: any;
}

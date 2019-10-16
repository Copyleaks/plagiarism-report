import { MatDialogConfig } from '@angular/material';

export type ViewMode = 'one-to-many' | 'one-to-one';
export type ContentMode = 'text' | 'html';
export type DirectionMode = 'rtl' | 'ltr';

export interface CopyleaksReportConfig {
	contentMode?: ContentMode;
	share?: boolean;
	download?: boolean;
	dialogConfig?: MatDialogConfig<any>;
}

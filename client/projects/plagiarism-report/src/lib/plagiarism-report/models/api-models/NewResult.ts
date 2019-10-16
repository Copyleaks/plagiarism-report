import { InternetResultPreview, DatabaseResultPreview, BatchResultPreview } from './CompleteResult';

interface NewInternetResult {
	internet: [InternetResultPreview];
	database: [];
	batch: [];
}
interface NewDatabaseResult {
	internet: [];
	database: [DatabaseResultPreview];
	batch: [];
}

interface NewBatchResult {
	internet: [];
	database: [];
	batch: [BatchResultPreview];
}
export type NewResult = NewInternetResult | NewDatabaseResult | NewBatchResult;

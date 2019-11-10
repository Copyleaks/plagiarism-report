import { InternetResultPreview, DatabaseResultPreview, BatchResultPreview } from './CompleteResult';

/** Type containing a new internet result from Copyleaks api  */
interface NewInternetResult {
	internet: [InternetResultPreview];
	database: [];
	batch: [];
}

/** Type containing a new database result from Copyleaks api  */
interface NewDatabaseResult {
	internet: [];
	database: [DatabaseResultPreview];
	batch: [];
}

/** Type containing a new batch result from Copyleaks api  */
interface NewBatchResult {
	internet: [];
	database: [];
	batch: [BatchResultPreview];
}

/** Type containing some new result from copyleaks api  */
export type NewResult = NewInternetResult | NewDatabaseResult | NewBatchResult;

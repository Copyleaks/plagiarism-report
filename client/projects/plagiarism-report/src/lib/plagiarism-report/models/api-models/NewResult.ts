import {
	InternetResultPreview,
	DatabaseResultPreview,
	BatchResultPreview,
	RepositoryResultPreview,
} from './CompleteResult';

/** Type containing a new internet result from Copyleaks api  */
interface NewInternetResult {
	internet: [InternetResultPreview];
	database: [];
	batch: [];
	repositories: [];
}

/** Type containing a new database result from Copyleaks api  */
interface NewDatabaseResult {
	internet: [];
	database: [DatabaseResultPreview];
	batch: [];
	repositories: [];
}

/** Type containing a new batch result from Copyleaks api  */
interface NewBatchResult {
	internet: [];
	database: [];
	batch: [BatchResultPreview];
	repositories: [];
}

interface NewRepositoryResult {
	internet: [];
	database: [];
	batch: [];
	repositories: [RepositoryResultPreview];
}

/** Type containing some new result from copyleaks api  */
export type NewResult = NewInternetResult | NewDatabaseResult | NewBatchResult | NewRepositoryResult;

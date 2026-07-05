import { invalidate } from '$app/navigation';

export const accountDataDependency = 'app:account';

export function refreshAccountData() {
	return invalidate(accountDataDependency);
}

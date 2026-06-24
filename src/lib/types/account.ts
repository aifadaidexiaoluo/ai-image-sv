export interface AccountUser {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	bio?: string | null;
	role?: string | null;
}

export interface AccountSummary {
	user: AccountUser;
	balance: number;
	planName: string;
}

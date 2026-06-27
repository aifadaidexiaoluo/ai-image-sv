export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface AppNotification {
	id: string;
	title: string;
	description: string;
	category: string;
	tone: NotificationTone;
	createdAt: string | Date;
	href?: string;
}

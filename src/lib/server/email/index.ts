export interface EmailMessage {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export interface EmailProvider {
	send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
	async send(message: EmailMessage) {
		console.info('[email:development]', {
			to: message.to,
			subject: message.subject,
			text: message.text
		});
	}
}

class HttpEmailProvider implements EmailProvider {
	constructor(
		private readonly endpoint: string,
		private readonly token: string
	) {}

	async send(message: EmailMessage) {
		const response = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${this.token}`
			},
			body: JSON.stringify({
				...message,
				from: process.env.EMAIL_FROM ?? 'DesignAI <noreply@localhost>'
			})
		});

		if (!response.ok) throw new Error(`邮件服务返回 ${response.status}`);
	}
}

export const emailProvider: EmailProvider = process.env.EMAIL_HTTP_ENDPOINT
	? new HttpEmailProvider(process.env.EMAIL_HTTP_ENDPOINT, process.env.EMAIL_HTTP_TOKEN ?? '')
	: new ConsoleEmailProvider();

export function verificationEmail(to: string, url: string): EmailMessage {
	return {
		to,
		subject: '验证你的 DesignAI 邮箱',
		text: `请在 60 分钟内打开以下链接完成邮箱验证：${url}`,
		html: `<p>欢迎使用 DesignAI。</p><p><a href="${url}">验证邮箱</a></p><p>此链接将在 60 分钟后失效。</p>`
	};
}

export function resetPasswordEmail(to: string, url: string): EmailMessage {
	return {
		to,
		subject: '重置你的 DesignAI 密码',
		text: `请在 30 分钟内打开以下链接重置密码：${url}`,
		html: `<p>我们收到了密码重置请求。</p><p><a href="${url}">重置密码</a></p><p>如果不是你本人操作，请忽略此邮件。</p>`
	};
}

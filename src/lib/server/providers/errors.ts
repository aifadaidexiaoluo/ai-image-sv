async function readResponseBody(response: Response) {
	try {
		const body = await response.text();
		return body || undefined;
	} catch {
		return undefined;
	}
}

export async function createProviderResponseError(provider: string, response: Response) {
	return new Error(`${provider}_${response.status}`, {
		cause: {
			status: response.status,
			statusText: response.statusText,
			body: await readResponseBody(response)
		}
	});
}

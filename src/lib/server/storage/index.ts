import { createHash, createHmac } from 'node:crypto';

export interface UploadDescriptor {
	objectKey: string;
	contentType: string;
	expiresIn?: number;
}

export interface StorageProvider {
	presignUpload(input: UploadDescriptor): Promise<string>;
	presignDownload(objectKey: string, expiresIn?: number): Promise<string>;
	readObject(objectKey: string): Promise<{ bytes: Uint8Array; contentType: string }>;
	putObject(objectKey: string, body: Uint8Array, contentType: string): Promise<void>;
	deleteObject(objectKey: string): Promise<void>;
}

function encode(value: string) {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
	);
}

function hmac(key: string | Buffer, value: string) {
	return createHmac('sha256', key).update(value).digest();
}

class MinioStorageProvider implements StorageProvider {
	private readonly internalEndpoint = new URL(
		process.env.MINIO_ENDPOINT ?? 'http://127.0.0.1:9000'
	);
	private readonly endpoint = new URL(
		process.env.MINIO_PUBLIC_ENDPOINT ?? this.internalEndpoint.toString()
	);
	private readonly bucket = process.env.MINIO_BUCKET ?? 'designai';
	private readonly accessKey = process.env.MINIO_ACCESS_KEY ?? 'minioadmin';
	private readonly secretKey = process.env.MINIO_SECRET_KEY ?? 'minioadmin';
	private readonly region = process.env.MINIO_REGION ?? 'us-east-1';

	private async presign(
		method: string,
		objectKey: string,
		expiresIn = 900,
		endpoint = this.endpoint
	) {
		const now = new Date();
		const date = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
		const dateStamp = date.slice(0, 8);
		const scope = `${dateStamp}/${this.region}/s3/aws4_request`;
		const path = `/${encode(this.bucket)}/${objectKey.split('/').map(encode).join('/')}`;
		const query = new URLSearchParams({
			'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
			'X-Amz-Credential': `${this.accessKey}/${scope}`,
			'X-Amz-Date': date,
			'X-Amz-Expires': String(Math.min(expiresIn, 604800)),
			'X-Amz-SignedHeaders': 'host'
		});
		const canonicalQuery = [...query.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, value]) => `${encode(key)}=${encode(value)}`)
			.join('&');
		const canonicalRequest = [
			method,
			path,
			canonicalQuery,
			`host:${endpoint.host}\n`,
			'host',
			'UNSIGNED-PAYLOAD'
		].join('\n');
		const stringToSign = [
			'AWS4-HMAC-SHA256',
			date,
			scope,
			createHash('sha256').update(canonicalRequest).digest('hex')
		].join('\n');
		const dateKey = hmac(`AWS4${this.secretKey}`, dateStamp);
		const regionKey = hmac(dateKey, this.region);
		const serviceKey = hmac(regionKey, 's3');
		const signingKey = hmac(serviceKey, 'aws4_request');
		query.set(
			'X-Amz-Signature',
			createHmac('sha256', signingKey).update(stringToSign).digest('hex')
		);
		return new URL(`${path}?${query.toString()}`, endpoint).toString();
	}

	presignUpload(input: UploadDescriptor) {
		return this.presign('PUT', input.objectKey, input.expiresIn);
	}

	presignDownload(objectKey: string, expiresIn = 600) {
		return this.presign('GET', objectKey, expiresIn);
	}

	async readObject(objectKey: string) {
		const response = await fetch(await this.presign('GET', objectKey, 300, this.internalEndpoint));
		if (!response.ok) throw new Error(`MINIO_DOWNLOAD_FAILED:${response.status}`);
		return {
			bytes: new Uint8Array(await response.arrayBuffer()),
			contentType: response.headers.get('content-type') ?? 'application/octet-stream'
		};
	}

	async putObject(objectKey: string, body: Uint8Array, contentType: string) {
		const bytes = body.buffer.slice(
			body.byteOffset,
			body.byteOffset + body.byteLength
		) as ArrayBuffer;
		const response = await fetch(await this.presign('PUT', objectKey, 900, this.internalEndpoint), {
			method: 'PUT',
			headers: { 'content-type': contentType },
			body: bytes
		});
		if (!response.ok) throw new Error(`MINIO_UPLOAD_FAILED:${response.status}`);
	}

	async deleteObject(objectKey: string) {
		const response = await fetch(
			await this.presign('DELETE', objectKey, 900, this.internalEndpoint),
			{ method: 'DELETE' }
		);
		if (!response.ok && response.status !== 404) {
			throw new Error(`MINIO_DELETE_FAILED:${response.status}`);
		}
	}
}

export const storageProvider: StorageProvider = new MinioStorageProvider();

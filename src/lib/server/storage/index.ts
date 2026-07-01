import { Client, type ClientOptions } from 'minio';
import { Buffer } from 'node:buffer';
import type { Readable } from 'node:stream';
import { env } from '$env/dynamic/private';

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

function endpointUrl(value: string) {
	if (/^https?:\/\//i.test(value)) return new URL(value);
	return new URL(`${env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${value}`);
}

function clientOptionsFromEndpoint(endpoint: URL): ClientOptions {
	return {
		endPoint: endpoint.hostname,
		port: endpoint.port ? Number(endpoint.port) : undefined,
		useSSL: endpoint.protocol === 'https:',
		accessKey: env.MINIO_ACCESS_KEY ?? 'minioadmin',
		secretKey: env.MINIO_SECRET_KEY ?? 'minioadmin',
		region: env.MINIO_REGION ?? 'us-east-1',
		pathStyle: true
	};
}

async function streamToBytes(stream: Readable) {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return new Uint8Array(Buffer.concat(chunks));
}

class MinioStorageProvider implements StorageProvider {
	private readonly internalEndpoint = endpointUrl(env.MINIO_ENDPOINT ?? 'http://127.0.0.1:9000');
	private readonly bucket = env.MINIO_BUCKET ?? 'designai';
	private readonly internalClient = new Client(clientOptionsFromEndpoint(this.internalEndpoint));

	presignUpload(input: UploadDescriptor) {
		return this.internalClient.presignedPutObject(
			this.bucket,
			input.objectKey,
			input.expiresIn ?? 900
		);
	}

	presignDownload(objectKey: string, expiresIn = 600) {
		return this.internalClient.presignedGetObject(this.bucket, objectKey, expiresIn);
	}

	async readObject(objectKey: string) {
		const [stream, stat] = await Promise.all([
			this.internalClient.getObject(this.bucket, objectKey),
			this.internalClient.statObject(this.bucket, objectKey)
		]);

		return {
			bytes: await streamToBytes(stream),
			contentType:
				stat.metaData?.['content-type'] ??
				stat.metaData?.['Content-Type'] ??
				'application/octet-stream'
		};
	}

	async putObject(objectKey: string, body: Uint8Array, contentType: string) {
		await this.internalClient.putObject(
			this.bucket,
			objectKey,
			Buffer.from(body),
			body.byteLength,
			{
				'content-type': contentType
			}
		);
	}

	async deleteObject(objectKey: string) {
		await this.internalClient.removeObject(this.bucket, objectKey);
	}
}

export const storageProvider: StorageProvider = new MinioStorageProvider();

import { claimNextJob, processJob, recoverStaleJobs } from '$lib/server/jobs/processor';
import { cleanupExpiredAssets } from '$lib/server/jobs/cleanup';

const pollInterval = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1000);

console.info('[worker] DesignAI 图片处理 Worker 已启动');

let nextCleanupAt = Date.now();
await recoverStaleJobs();

while (true) {
	if (Date.now() >= nextCleanupAt) {
		await cleanupExpiredAssets();
		nextCleanupAt = Date.now() + 60 * 60 * 1000;
	}
	const job = await claimNextJob();
	if (job) await processJob(job);
	else await new Promise((resolve) => setTimeout(resolve, pollInterval));
}

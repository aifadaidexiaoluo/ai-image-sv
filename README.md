# DesignAI

DesignAI 是一个基于 SvelteKit 2、Svelte 5、Better Auth、Drizzle、PostgreSQL 和 MinIO 的 AI 电商图片 SaaS。项目包含商品图生成、场景编辑、智能抠图、实时任务进度、素材历史、积分套餐、沙箱支付和运营后台。

## 本地启动

1. 安装依赖并准备环境变量：

   ```sh
   bun install
   cp .env.example .env
   ```

2. 启动 PostgreSQL 和 MinIO。若本机端口未被占用，可直接运行：

   ```sh
   docker compose up -d postgres minio minio-init
   ```

3. 创建数据库表：

   ```sh
   bun run db:migrate
   ```

4. 分别启动 Web 服务和图片 Worker：

   ```sh
   bun run dev
   bun run worker
   ```

`.env.example` 默认启用 `MOCK_AI=true`，不需要外部模型密钥也能走通完整生成流程。开发环境未配置邮件网关时，验证邮箱和重置密码链接会输出到服务端控制台。

MinIO 控制台默认位于 `http://localhost:9001`，账号与密码均为 `minioadmin`。生产环境必须替换凭据，并将 `MINIO_PUBLIC_ENDPOINT` 设置为浏览器可访问的 HTTPS 地址。

## 图片服务

- `OPENAI_API_KEY`：启用 OpenAI 图片生成与编辑。
- `DASHSCOPE_API_KEY`：启用阿里云百炼/通义万相。
- `REMOVE_BG_API_KEY`：启用托管抠图服务。
- `MOCK_AI=true`：始终使用本地模拟图片，适合开发和端到端验收。

任务由独立 Worker 从 PostgreSQL 原子领取。Worker 先持久化进度事件，再由 SSE 接口推送给页面；连接中断时前端会重连并按事件 ID 续传。运行中断超过 30 分钟的任务会自动恢复到队列。

## 认证与管理员

Better Auth 要求 `BETTER_AUTH_SECRET` 至少 32 个高熵字符。邮箱注册必须完成验证，密码长度为 12–256 个字符。将管理员邮箱写入逗号分隔的 `ADMIN_EMAILS`，该邮箱注册时会获得后台权限。

## 质量检查

```sh
bun run check
bun run lint
bun test
bun run build
```

生产部署需要同时运行 Node adapter 生成的 Web 服务和 `bun run worker`，并在发布阶段先执行 `bun run db:migrate`。

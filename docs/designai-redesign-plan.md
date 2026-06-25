# DesignAI 工作台改造计划

## 1. 背景

本计划基于提供的 8 张目标界面截图，以及当前 `ai-image-sv` 项目的实际代码结构制定。截图呈现的是一个较成熟的 AI 电商视觉创作后台，覆盖工作台、商品图生成、场景图编辑、智能抠图、历史记录、素材库、套餐积分和账户设置。

当前项目已经具备 SvelteKit 2、Svelte 5、Tailwind CSS、Better Auth、Drizzle、任务生成、上传、积分、订阅和素材管理等基础能力。主要差距集中在前端信息架构、页面密度、创作工作流细分、素材/历史管理体验，以及整体视觉完成度。

本次改造建议采用“保留现有业务能力，重做产品级工作台体验”的策略，而不是推翻重做。

## 2. 改造目标

### 2.1 产品目标

- 将当前 MVP 风格后台升级为截图级别的 AI 设计 SaaS 工作台。
- 让三个核心创作工具拥有独立、清晰、符合场景的工作流：
  - AI 商品图
  - 场景图编辑
  - 智能抠图
- 强化用户对积分、任务进度、历史作品、素材资产的感知。
- 建立统一的视觉系统，提升页面质感和一致性。

### 2.2 技术目标

- 复用现有任务、积分、上传、素材、订阅和账户能力。
- 将通用 `GenerationForm` 拆分为更细粒度的页面和组件。
- 将新增创作参数统一写入 `generation_jobs.parameters`，减少早期数据库迁移压力。
- 将模板、素材分类、筛选等功能先用本地 catalog 或轻量服务承接，后续再做数据库增强。
- 保持 SvelteKit 路由、Svelte 5 runes、TypeScript 严格模式和 Tailwind 现有约定。

## 3. 当前项目现状

### 3.1 已有能力

- 应用路由已经位于 `src/routes/app`。
- 左侧导航和顶部用户区域已存在。
- 三个创作入口已存在：
  - `/app/create/product`
  - `/app/create/scene`
  - `/app/create/remove-background`
- 当前三个创作页共用 `src/lib/components/app/generation-form.svelte`。
- 已有任务 API：
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `GET /api/jobs/:id`
  - `GET /api/jobs/:id/events`
  - `POST /api/jobs/:id/retry`
- 已有上传 API：
  - `POST /api/uploads/presign`
- 已有积分系统：
  - 钱包
  - 注册赠送
  - 预占积分
  - 结算积分
  - 积分流水
- 已有订阅和商品 catalog 基础。
- 已有素材表 `assets` 和生成输出表 `generation_outputs`。
- 已有模板表 `templates`，但前端尚未完整使用。

### 3.2 主要差距

- 当前应用壳较基础，和截图里的左侧导航、顶部状态区、底部升级卡有明显差距。
- 工作台首页缺少目标截图里的大入口卡片、最近任务表格、灵感模板。
- 三个创作工具共用一个表单，无法承载截图中的独立流程。
- 历史记录现在是任务卡片流，不是表格 + 右侧预览的管理页。
- 素材库现在是简单图片网格，缺少分类、筛选、收藏、分页、标签。
- 套餐页已有业务能力，但套餐结构和截图展示不一致。
- 设置页已有头像、昵称、简介、密码重置能力，但没有完整设置中心布局。
- 静态展示素材不足，目前只有首页营销图，缺少截图中大量产品/场景/模板配图。

## 4. 视觉与交互方向

### 4.1 整体风格

- 主色：紫色系，沿用当前 `--primary: #5b3df5`。
- 背景：浅色、柔和渐变、低对比度边框。
- 卡片：大圆角、轻阴影、适度渐变。
- 图像：页面入口、模板、素材卡片都应以图片驱动。
- 状态：任务进度、积分消耗、套餐标签需要更显眼。

### 4.2 布局特征

- 桌面端采用固定左侧 sidebar + 主内容区域。
- 顶部右侧展示积分、套餐、通知、头像。
- 工作流页面采用主操作区 + 右侧辅助区。
- 管理型页面采用列表/网格 + 筛选 + 详情预览。

## 5. 阶段一：应用壳与基础组件

### 5.1 涉及文件

- `src/routes/app/+layout.svelte`
- `src/routes/app/+layout.server.ts`
- `src/routes/layout.css`
- `src/lib/components/app/*`

### 5.2 改造内容

- 重做左侧导航：
  - logo 区
  - 工作台
  - 商品图
  - 场景图
  - 智能抠图
  - 历史记录
  - 素材库
  - 套餐积分
  - 账户设置
  - 底部积分升级卡
- 重做顶部区域：
  - 搜索框
  - 积分 pill
  - 套餐 pill
  - 通知图标
  - 用户头像菜单
- 增加统一页面容器和卡片样式。
- 抽取通用组件：
  - `AppPageHeader`
  - `AppShellSearch`
  - `CreditPill`
  - `UpgradeCard`
  - `SectionCard`
  - `ImageTile`
  - `FilterTabs`
  - `EmptyState`

### 5.3 验收标准

- 所有 `/app` 页面拥有统一 sidebar、header、背景、间距。
- 当前积分和套餐名称继续从 `+layout.server.ts` 读取真实数据。
- 移动端不崩坏，sidebar 可退化为横向/折叠菜单。

## 6. 阶段二：工作台首页

### 6.1 涉及文件

- `src/routes/app/+page.svelte`
- `src/routes/app/+page.server.ts`
- `src/lib/components/app/job-card.svelte`
- `static/images/app/*`

### 6.2 改造内容

- 增加顶部问候区：
  - “你好，创意家 👋”
  - 辅助文案
  - 搜索入口
- 增加三个创作入口大卡片：
  - AI 商品图
  - 场景图编辑
  - 智能抠图
- 将最近任务改为紧凑列表：
  - 缩略图
  - 任务名称
  - 状态/时间
  - 进度条
  - 完成数量
  - 查看按钮
- 增加灵感模板横向卡片：
  - 夏日美妆
  - 家居生活
  - 3C 数码
  - 食品饮料
  - 服饰配件

### 6.3 数据策略

- 最近任务继续使用 `listJobsForUser`。
- 灵感模板第一版使用本地静态 catalog。
- 后续可改为读取 `templates` 表。

### 6.4 验收标准

- 首页视觉结构与截图一致。
- 最近任务能展示真实任务状态。
- 无任务时有清晰空状态。

## 7. 阶段三：商品图生成页

### 7.1 涉及文件

- `src/routes/app/create/product/+page.svelte`
- `src/routes/api/jobs/+server.ts`
- `src/lib/server/jobs/service.ts`
- `src/lib/server/jobs/processor.ts`
- `src/lib/server/providers/types.ts`

### 7.2 改造内容

将当前通用表单替换为独立商品图工作流。

页面模块：

- 选择生成方式：
  - AI 描述生成
  - 参考图生成
- 输入商品描述：
  - textarea
  - 字数统计
  - 智能推荐 chips
- 选择风格：
  - 电商白底
  - 场景生活
  - 极简纯色
  - 高级质感
  - 3D 渲染
  - 手绘插画
- 图片设置：
  - 图片比例
  - 图片尺寸
  - 生成数量
  - 高级设置
- 右侧辅助区：
  - 上传参考图
  - 生成建议
  - 示例描述

### 7.3 参数设计

提交任务时扩展 `parameters`：

```ts
{
	generationMode: 'prompt' | 'reference',
	styleIds: string[],
	size: '1024x1024' | '1024x1536' | '1536x1024',
	advancedOptions?: Record<string, unknown>
}
```

### 7.4 后端策略

- 第一版：将风格、尺寸、描述合成为更完整 prompt，继续走现有 provider。
- 第二版：扩展 provider 请求，让尺寸、风格等参数真正影响生成接口。

### 7.5 验收标准

- 无参考图时可用 AI 描述生成。
- 选择参考图生成时必须上传图片。
- 积分消耗与当前策略一致：商品图每张 2 积分。
- 任务创建后能进入现有任务流和历史记录。

## 8. 阶段四：场景图编辑页

### 8.1 涉及文件

- `src/routes/app/create/scene/+page.svelte`
- `src/routes/api/jobs/+server.ts`
- `src/lib/server/jobs/service.ts`

### 8.2 改造内容

将当前通用表单替换为三步式场景工作流。

页面模块：

- 步骤条：
  - 选择场景
  - 添加商品
  - 调整与生成
- 场景分类：
  - 全部场景
  - 家居生活
  - 美妆个护
  - 数码科技
  - 食品饮料
  - 服饰箱包
  - 户外活动
  - 节日氛围
- 场景模板网格：
  - 简约客厅
  - 浴室台面
  - 厨房台面
  - 卧室床头柜
  - 化妆台
  - 书桌办公
  - 户外野餐
  - 咖啡馆
  - 节日礼盒
  - 自然光影
  - 极简背景
  - 上传自定义场景
- 右侧设置区：
  - 已选场景预览
  - 商品上传和替换
  - 商品位置九宫格
  - 商品大小 slider
  - 光影匹配
  - 色彩融合
  - 细节增强

### 8.3 参数设计

提交任务时扩展 `parameters`：

```ts
{
	sceneId: string,
	sceneCategory: string,
	productPosition: 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right',
	productScale: number,
	lightingMatch: boolean,
	colorBlend: boolean,
	detailEnhance: boolean
}
```

### 8.4 验收标准

- 场景图必须上传商品图。
- 场景模板可选择，右侧预览同步变化。
- 位置、大小和高级选项能保存到任务参数。
- 积分消耗与当前策略一致：场景图每张 3 积分。

## 9. 阶段五：智能抠图页

### 9.1 涉及文件

- `src/routes/app/create/remove-background/+page.svelte`
- `src/routes/api/uploads/presign/+server.ts`
- `src/routes/api/jobs/+server.ts`

### 9.2 改造内容

将当前通用表单替换为图片编辑器布局。

页面模块：

- 中央画布：
  - 透明棋盘背景
  - 抠图结果预览
  - 原图/结果切换
  - 缩放控制
  - 全屏控制
- 顶部操作：
  - 重新上传
  - 下载
- 底部工具条：
  - 撤销
  - 恢复
  - 移动
  - 裁剪
- 右侧设置：
  - 透明背景
  - 纯色背景
  - 自定义背景
  - 场景预览
  - 保留阴影
  - 边缘平滑
  - 高清模式

### 9.3 下载策略

- 透明背景：直接下载生成 PNG。
- 纯色背景：前端 canvas 合成后下载。
- 场景背景：第一版做预览和合成下载；复杂光影融合留到后续。

### 9.4 验收标准

- 上传图片后能创建抠图任务。
- 任务完成后显示抠图结果。
- 可切换透明、纯色、预设背景。
- 可下载当前预览结果。
- 积分消耗与当前策略一致：智能抠图每张 1 积分。

## 10. 阶段六：历史记录页

### 10.1 涉及文件

- `src/routes/app/history/+page.svelte`
- `src/routes/app/history/+page.server.ts`
- `src/lib/server/jobs/service.ts`

### 10.2 改造内容

将当前任务卡片流改为管理型记录页。

页面模块：

- 顶部 tabs：
  - 全部记录
  - 商品图
  - 场景图
  - 智能抠图
- 搜索框
- 筛选下拉
- 记录表格：
  - 类型
  - 作品名称
  - 生成信息
  - 尺寸
  - 创建时间
  - 操作
- 右侧作品预览：
  - 大图
  - 标题编辑
  - 创建时间
  - 类型
  - 尺寸
  - 生成方式
  - 描述词
  - 消耗积分
  - 再次生成
  - 编辑并重新生成
- 分页和每页数量选择。

### 10.3 服务扩展

扩展 `listJobsForUser` 支持：

```ts
{
	tool?: 'product' | 'scene' | 'remove-background',
	keyword?: string,
	page?: number,
	pageSize?: number,
	sort?: 'latest' | 'oldest'
}
```

### 10.4 验收标准

- 支持按类型筛选。
- 支持关键词搜索。
- 支持分页。
- 点击记录后右侧详情更新。
- 可下载已有输出图。

## 11. 阶段七：素材库页

### 11.1 涉及文件

- `src/routes/app/assets/+page.svelte`
- `src/routes/app/assets/+page.server.ts`
- `src/lib/server/jobs/service.ts`
- `src/lib/server/db/schema.ts`（第二版可能需要）

### 11.2 改造内容

将当前简单网格改为素材管理中心。

页面模块：

- 顶部搜索和排序。
- 素材类型 tabs：
  - 全部素材
  - 产品素材
  - 场景背景
  - 装饰元素
  - 贴纸图标
  - 背景纹理
  - 字体素材
- 筛选栏：
  - 类型
  - 风格
  - 颜色
  - 比例
  - 更多筛选
  - 重置
- 左侧分类计数。
- 热门标签。
- 素材卡片：
  - 缩略图
  - 收藏
  - 格式 badge
  - 下载
  - 名称
  - 尺寸/格式
  - 更多操作
- 分页。

### 11.3 数据策略

第一版：

- 使用现有 `assets.kind` 做基础分类。
- 本地维护素材分类和标签映射。
- 对生成结果、上传原图、模板素材做视觉分组。

第二版：

建议为 `assets` 增加：

```ts
category: text('category');
tags: jsonb('tags').$type<string[]>().default([]);
metadata: jsonb('metadata').$type<Record<string, unknown>>().default({});
```

### 11.4 验收标准

- 可查看用户已有素材。
- 可按基础类型筛选。
- 可收藏和取消收藏。
- 可下载素材。
- 空状态和加载状态完整。

## 12. 阶段八：套餐与积分页

### 12.1 涉及文件

- `src/routes/app/billing/+page.svelte`
- `src/routes/app/billing/+page.server.ts`
- `src/lib/server/billing/catalog.ts`

### 12.2 改造内容

保留现有支付、订单、积分流水能力，重做展示。

页面模块：

- 顶部 tabs：
  - 套餐订阅
  - 积分充值
- 月付/年付切换。
- 套餐卡片：
  - 免费版
  - 个人版
  - 专业版
  - 团队版
- 右侧积分余额：
  - 当前可用积分
  - 本月获取
  - 本月消耗
  - 充值积分按钮
- 积分使用记录。
- 底部权益说明：
  - 积分有效期
  - 套餐自动续费
  - 发票服务
  - 安全保障

### 12.3 Catalog 调整建议

当前 catalog 是：

- Free
- Pro
- Business
- 100 积分包
- 500 积分包
- 2000 积分包

建议改为更贴近截图的结构：

- 免费版
- 个人版
- 专业版
- 团队版
- 积分包仍作为“积分充值”tab 展示

### 12.4 验收标准

- 订阅套餐和积分包显示清晰分离。
- 点击购买仍走现有 `/api/checkout`。
- 积分流水显示真实数据。
- 当前套餐和余额显示真实数据。

## 13. 阶段九：账户设置页

### 13.1 涉及文件

- `src/routes/app/settings/+page.svelte`
- `src/routes/app/settings/+page.server.ts`
- `src/lib/server/account.ts`

### 13.2 改造内容

保留现有头像、昵称、简介、密码重置能力，改为设置中心。

页面模块：

- 设置 tabs：
  - 基本信息
  - 安全设置
  - 通知设置
  - 偏好设置
  - 团队管理
  - API 管理
  - 账号与账单
- 基本信息表单：
  - 头像
  - 用户名
  - 邮箱
  - 手机号
  - 个人简介
  - 所在时区
  - 保存更改
- 右侧信息卡：
  - 账户信息
  - 账户安全评分
  - 快捷操作

### 13.3 功能策略

- 第一版只让已有能力真实可用：
  - 修改头像
  - 删除头像
  - 修改名称
  - 修改简介
  - 发送密码重置邮件
- 其他 tab 可先做只读或“建设中”状态。
- 后续再接：
  - 手机号验证
  - 设备管理
  - 数据导出
  - API key
  - 团队管理

### 13.4 验收标准

- 当前已有设置能力不回退。
- 页面结构与截图一致。
- 保存成功/失败状态明确。
- 暂未实现功能不表现为假可用。

## 14. API 与数据模型调整

### 14.1 `/api/jobs` 输入扩展

当前输入：

```ts
{
	tool?: GenerationTool;
	provider?: GenerationProviderId;
	prompt?: string;
	count?: number;
	aspectRatio?: string;
	sourceAssetId?: string;
	templateId?: string;
}
```

建议扩展：

```ts
{
	tool?: GenerationTool;
	provider?: GenerationProviderId;
	prompt?: string;
	count?: number;
	aspectRatio?: string;
	sourceAssetId?: string;
	templateId?: string;
	parameters?: Record<string, unknown>;
}
```

在 `createJob` 中合并：

```ts
parameters: {
	aspectRatio: input.aspectRatio,
	templateId: input.templateId,
	...input.parameters
}
```

### 14.2 Provider Prompt 增强

建议新增 prompt 构建工具：

```ts
buildGenerationPrompt({
	tool,
	prompt,
	parameters
});
```

用于把风格、场景、光影、尺寸等 UI 参数转换为 provider 可理解的 prompt。

### 14.3 素材元数据增强

第一版不强制迁移。

第二版建议增加：

- `assets.category`
- `assets.tags`
- `assets.metadata`
- `assets.width`
- `assets.height`

其中 `width` 和 `height` 字段当前已存在，但保存输出时尚未填充，可后续补齐。

## 15. 静态资源计划

当前 `static/images/home` 只有首页营销图。为达到截图效果，需要新增：

```text
static/images/app/
  dashboard/
  products/
  scenes/
  templates/
  assets/
  backgrounds/
```

建议资源类型：

- 香水瓶
- 护肤品
- 耳机
- 椅子
- 盆栽
- 手提包
- 饮料
- 家居场景
- 厨房场景
- 浴室场景
- 户外野餐
- 渐变背景
- 透明棋盘示例

资源命名使用 kebab-case，例如：

```text
perfume-main.png
living-room-soft.jpg
plant-transparent.png
summer-beauty-card.png
```

## 16. 推荐执行顺序

1. 应用壳与通用组件。
2. 静态展示资源整理。
3. 工作台首页。
4. 商品图生成页。
5. 场景图编辑页。
6. 智能抠图页。
7. `/api/jobs` 参数扩展和 prompt 构建。
8. 历史记录页。
9. 素材库页。
10. 套餐与积分页。
11. 账户设置页。
12. 整体响应式、空状态、加载状态、错误状态收尾。

## 17. 验证计划

每个阶段完成后至少执行：

```bash
bun run check
bun run lint
```

最终交付前执行：

```bash
bun run check
bun run lint
bun run build
```

核心手动验证：

- 登录后进入工作台。
- 积分和套餐显示正确。
- 商品图任务可创建。
- 场景图任务可创建。
- 智能抠图任务可创建。
- 任务状态能实时更新。
- 历史记录能看到生成结果。
- 素材库能看到上传和生成素材。
- 套餐页能进入沙箱购买流程。
- 设置页能修改头像、名称和简介。

## 18. 风险与处理方式

### 18.1 图片素材不足

风险：界面结构做好后，如果缺少高质量图像，视觉质感仍达不到截图效果。

处理：优先补齐 `static/images/app` 演示资源，必要时单独生成一批统一风格素材。

### 18.2 UI 参数和 AI 结果不一致

风险：用户选择了风格、尺寸、光影等高级参数，但 provider 没有真正使用。

处理：第一版先保存参数并参与 prompt 拼接；第二版再扩展 provider 请求参数。

### 18.3 素材库筛选缺少真实字段

风险：当前 `assets` 表不足以支撑完整分类、标签、颜色、比例筛选。

处理：第一版做基础筛选和视觉结构；第二版加数据库字段。

### 18.4 套餐结构与当前 catalog 不一致

风险：截图中的套餐和当前 Free/Pro/Business 不一致，容易造成显示和购买不匹配。

处理：建议同步调整 catalog，保持页面展示和真实购买项一致。

### 18.5 页面复杂度上升

风险：一次性改动过大，容易引入 UI 和业务回归。

处理：按页面分阶段提交，每阶段独立验证。

## 19. 交付物清单

第一轮交付：

- 改造后的应用壳。
- 工作台首页。
- 三个独立创作页面。
- 任务参数扩展。
- 历史记录新版。
- 素材库新版。
- 套餐页新版。
- 设置页新版。
- 静态展示资源。

第二轮交付：

- 模板数据后台化。
- 素材分类和标签入库。
- Provider 参数深度接入。
- 场景图预览合成增强。
- 抠图高级编辑能力增强。
- 团队、API、通知等设置 tab 真正接入业务。

## 20. 建议结论

建议先执行第一轮“截图级 UI + 现有业务打通”。这一轮能快速把产品从 MVP 后台提升到可演示、可使用的成熟工作台状态。

第二轮再围绕数据模型和 AI 参数深度做增强，避免一开始为了完整筛选、模板和素材体系引入过多迁移和联动风险。

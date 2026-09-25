# 九号电流宇宙 / E-MOTION GALAXY —— 交付计划 (G1)

一句话目标：做一个**非官方粉丝向**的九号电动系列/车型介绍站，用「电影化产品叙事 + 电流语汇」把浏览变成一次**充能启动仪式**。

## 交付物清单
| 轮次 | 交付物 | 路径 | 规格 / 验收条件 |
|---|---|---|---|
| R1 | 策划文档（IA/Token/交互/路由/组件树/动效/数据） | `/workspace/emotion_galaxy/plan.md` + 聊天输出 | 7 项齐全；数据 JSON 含 3 系列/6 车型/4 人格 |
| R1 | 数据 JSON | `data/{series,models,personalities,scenes,timeline}.json` | `python3 -c json.load` 通过；含 `_meta.dataMode=placeholder` |
| R1 | 设计令牌 | `design-tokens.css` | 可整段内联；含 reduced-motion 与 `.lite` 降级 |
| R2 | 首页 Hero 单文件预览 | `html/01-hero.html` | 双击浏览器可开；离线无外链；能量环 0→100 → 开环 → 出车 |
| R3 | 系列星系页 | `html/02-galaxy.html` | Canvas 2D 星系（非 WebGL，保证移动端）；拖拽旋转 + 滚轮缩放 + 点击推进 |
| R4 | 车型详情页 | `html/03-model.html` | 滚动爆炸拆解 + 部件标注 + 侧 HUD + 能量回收可视化 |
| R5 | 对比页 + 配置器 + 时间轴 | `html/04-{compare,configurator,timeline}.html` | 雷达图从中心生长；Canvas 生成配置卡片可下载；时间轴光轨 + 分支 |
| 终 | 交付目录 + 说明 | `/sdcard/Download/电流宇宙/` | `说明.txt` 含数据口径与免责声明 |

## 验收条件（G4 用）
1. 所有 HTML 单文件 **离线可开**（不引用任何 CDN/外链图片/外链字体；字体走系统栈 + `@font-face` 可选内嵌）。
2. `prefers-reduced-motion: reduce` 下：无无限动画、无自动滚动、信息仍完整可读。
3. 键盘可达：Tab 顺序 = 能量环 → 主按钮 → 内容区；可聚焦元素均有 `:focus-visible` 外发光（≥3:1 对比）。
4. 性能：移动端降级后**主线程单帧 < 16ms**（JS 用 `performance.now()` 探针抽样记录），粒子数 ≤ 120，Canvas 实际缓冲区 ≤ 1.5× 显示尺寸。
5. 数据：所有参数旁必须有「示例数据 · 可替换为官方数据」角标；`price=null` 时显示 `—`。
6. 文案：页脚固定 4 行（非官方声明 / 辅助工具 DeepSeek / 创作者 苏好好 / 邮箱）；**无任何引导性 CTA**（不出现"到店/扫码/加微信/评论区"）。
7. 音效：默认 muted，必须由用户点击才 `AudioContext.resume()`。

## 风险点
- **R1 参数合规**：九号真实参数需官方核；本方案全部走 `placeholder` + 角标，避免"编造参数"。
- **R2 参考品牌相似度**：环形符号必须改造成「电流环（三叉电弧 + 电量刻度）」，不得做成参考品牌的光环/圆环形态或配色。
- **R3 WebGL 成本**：R3 星系页在移动端用 Canvas 2D 伪 3D（投影 + 深度排序），Three.js 方案只在桌面版启用（渐进增强）。
- **R4 单文件体积**：每个 HTML 目标 < 120 KB（不含可能的 base64 图片），图片用 CSS 渐变 + SVG 占位。
- **R5 中文数字渲染**：HUD 数字用 `font-variant-numeric: tabular-nums`，避免滚动时宽度抖动。

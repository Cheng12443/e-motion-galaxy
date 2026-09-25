# 九号电流宇宙 / E-MOTION GALAXY

> **非官方粉丝网站，仅用于学习与展示。**
> 本站与 Segway-Ninebot 无任何隶属或合作关系，不销售任何产品。

一个非官方粉丝向的九号电动（Segway-Ninebot）系列与车型介绍站。核心想法：**把「浏览产品」做成一次充能启动仪式**——能量环充满，光裂开，车从里面驶出来。

![status](https://img.shields.io/badge/status-WIP-C6FF00) ![deps](https://img.shields.io/badge/dependencies-none-00E5FF) ![static](https://img.shields.io/badge/static-HTML%20%2F%20CSS%20%2F%20JS-FF6B00)

---

## 在线预览

GitHub Pages：<https://cheng12443.github.io/e-motion-galaxy/>

（也可直接克隆后双击 `index.html`——**没有构建步骤、没有外部依赖、没有后端**。）

---

## 页面

| 轮次 | 文件 | 内容 | 状态 |
|---|---|---|---|
| R2 | `01-hero.html` | 首页 Hero：电流环充能启动、车辆驶出、HUD 数字滚动、指针视差、日/夜氛围、Web Audio 合成音（默认静音） | 已完成 |
| R3 | `02-galaxy.html` | 系列星系：Canvas 透视投影的 3 颗行星，拖拽旋转 / 滚轮缩放 / 点击镜头推进 + 电流环转场，集齐 3 个解锁「电流大师」 | 已完成 |
| R4 | `03-model.html` | 车型详情：滚动触发爆炸拆解（电池 / 电机 / 制动 / 轮胎 / 智能系统）、编号徽章 + 引线标注、右侧 HUD 随滚动更新、能量回收可视化、配色切换 / 轮毂旋转 / 大灯开关，`?id=` 可切 6 个车型 | 已完成 |
| R5 | `04a-compare.html`<br>`04b-configurator.html`<br>`04c-timeline.html` | 车型对比（雷达图生长）、配置器（Canvas 生成配置卡片）、品牌技术时间轴（光轨 + 滚动分支） | 待生成 |

## 交互速查

- **首页**：滚轮 / 长按电流环 / `↑↓` / `空格` 为电流环充能；`Esc` 跳过启动仪式。
- **星系**：拖拽旋转 · 滚轮（或双指捏合）缩放 · 悬停看系列轮廓 · 点击进入 · `←/→` 切换行星 · `Enter` 进入 · `Esc` 返回。
- **全站**：右上角切换日/夜氛围（默认按本机时间自动判定）；`prefers-reduced-motion` 下动画全部关闭。

## 目录结构

```
.
├── index.html              站点索引（GitHub Pages 入口）
├── 01-hero.html            首页 Hero
├── 02-galaxy.html          系列星系
├── 03-model.html           车型详情（爆炸拆解，?id=<modelId>）
├── data/
│   ├── series.json         3 个系列
│   ├── models.json         6 个车型
│   ├── personalities.json  4 种骑行人格（纯前端规则引擎）
│   ├── scenes.json         5 个场景 + 环境参数
│   └── timeline.json       6 个技术里程碑
└── project/
    ├── plan.md             策划文档：信息架构 / 设计令牌 / 创新交互清单 / 路由 / 组件树 / 动效清单
    ├── design-tokens.css   设计令牌
    └── notes/              离线校验脚本（语法、结构、投影数学）
```

## 关于数据（重要）

`data/*.json` 里的**全部数值都是占位示例**，每个文件带 `_meta.dataMode = "placeholder"`，界面上对应位置都打了「示例数据 · 可替换为官方数据」角标；`price: null` 的位置一律显示 `—`。

**本项目不编造官方参数。** 正式版会把占位值替换为可溯源的公开资料，并逐项标注来源与获取日期。

## 设计令牌

- 基底 `#050505` / `#0A0A0A`；主色 **荧光绿 `#C6FF00`（能量）** / **电光蓝 `#00E5FF`（数据）** / **能量橙 `#FF6B00`（动能回收）**
- 三色只出现在**有能量含义的地方**（电量、电弧、回收箭头、节点），不做装饰性铺色
- 质感：HUD 仪表 / 玻璃拟态 / 金属拉丝 / 网格 / 光轨 / 粒子 / 扫描线
- 详见 `project/design-tokens.css`

## 版权与免责

- 站内**所有图形（星球、车体剪影、图标、能量环）均为原创几何示意**，未使用任何未经授权的官方图片、商标或摄影素材。
- 文中提及的产品名与技术名词（RideyGo、FOC、TCS、ABS、EABS、整车 OTA 等）仅用于客观介绍。
- 代码以 MIT 许可发布（见 `LICENSE`）；**但站点内容与「非官方粉丝网站」这一身份声明不构成任何形式的官方授权**。
- 若权利人认为内容不妥，请通过下方邮箱联系，我们将立即调整或删除。

---

非官方粉丝网站，仅用于学习与展示。
辅助工具：DeepSeek
创作者：苏好好
邮箱：3348304834@qq.com

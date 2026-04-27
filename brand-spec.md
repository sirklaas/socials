# Pink Milk Social Engine · Brand Spec
> 采集日期：2026-04-27
> 资产来源：从现有代码库提取 (src/index.css, src/App.jsx)
> 资产完整度：部分（缺少 Logo，色值/字体完整）

## 🎯 核心资产

### Logo
- **状态**: ⚠️ 未找到 — 需要用户提供或设计
- 当前使用: 文字标识 "Pink Milk Social Engine" (App.jsx line 108)
- 建议: 需要 SVG/PNG logo 文件放入 public/ 或 src/assets/

### 产品截图 / UI 素材
- **Dashboard 主界面**: src/App.jsx 展示完整 8-step 工作流
- **Step 组件**: src/components/ 包含 8 个步骤的完整 UI
- **截图建议**: 可使用 Playwright 截取关键步骤作为营销素材

## 🎨 色板（已验证）

### Primary Blue Family
| Token | HEX | 用途 |
|-------|-----|------|
| --primary | `#142a68` | 主品牌色、侧边栏背景、标题 |
| --primary-dark | `#1e3a8a` | 悬停状态、强调 |
| --primary-light | `#3b82f6` | 激活状态、链接 |
| --primary-ultralight | `#DBEAFE` | 背景装饰、轻量强调 |

### Accent Colors
| Token | HEX | 用途 |
|-------|-----|------|
| --accent-purple | `#7C3AED` | 紫色强调 |
| --accent-coral | `#F43F5E` | 珊瑚色、警告/删除 |
| --accent-amber | `#F59E0B` | 琥珀色、进行中状态 |
| --accent-indigo | `#4F46E5` | 靛蓝色 |

### Neutral Slate Scale
| Token | HEX | 用途 |
|-------|-----|------|
| --slate-950 | `#020617` | 最深文字 |
| --slate-700 | `#334155` | 正文文字 |
| --slate-500 | `#64748B` | 次要文字、图标 |
| --slate-300 | `#CBD5E1` | 边框、分隔线 |
| --slate-200 | `#E2E8F0` | 轻边框 |
| --slate-100 | `#F1F5F9` | 卡片背景 |
| --slate-50 | `#F8FAFC` | 页面背景 |

### Semantic Colors
| Token | HEX | 用途 |
|-------|-----|------|
| --success | `#0EA5E9` | 成功状态 |
| --warning | `#F59E0B` | 警告状态 |
| --error | `#EF4444` | 错误状态 |
| --info | `#3B82F6` | 信息提示 |

### 社交平台色（代码中提取）
| 平台 | HEX |
|------|-----|
| YouTube | `#FF0000` |
| Instagram | `#E4405F` |
| TikTok | `#000000` |
| LinkedIn | `#0A66C2` |
| Facebook | `#1877F2` |
| Blog | `#2563EB` |

## 🔤 字型

### 当前字体栈
| 用途 | 字体 | 字重 |
|------|------|------|
| Display/Heading | Barlow Semi Condensed | 300, 400, 500 |
| Body | Inter, system-ui | 400, 500, 600 |

### 评估
- **Barlow Semi Condensed**: 现代、 Condensed、有科技感 ✅
- **Inter**: 系统字体，符合功能型产品，但缺乏品牌个性 ⚠️

## ✨ 签名细节

### 当前识别特征
1. **深蓝色侧边栏** — 8-step 垂直进度导航
2. **渐变色 step 按钮** — active/completed 状态有光晕效果
3. **圆角卡片** — 16px 圆角 (var(--container-radius))
4. **Barlow 字体** — 标题字体的识别度

### 设计系统参数
| 参数 | 值 |
|------|-----|
| 侧边栏宽度 | 232px |
| 顶部导航高度 | 64px |
| 卡片圆角 | 16px |
| 按钮圆角 | 8px |

## 🚫 禁区
- 避免使用紫色渐变（anti-AI-slop 规则）
- 不使用装饰性 emoji 图标
- 不手动绘制 iPhone/Dynamic Island（如有需要，使用 ios_frame.jsx）

## 📝 已完成增强 (2026-04-27)

### 已实现
- [x] **微交互系统** — 按钮、步骤条、卡片的悬停/点击反馈
- [x] **动画缓动曲线** — huashu-design 推荐的 quart/quint/expo 曲线
- [x] **Framer Motion 增强** — 页面过渡、步骤动画、状态指示器
- [x] **无障碍支持** — prefers-reduced-motion 完整支持
- [x] **焦点状态** — 键盘导航的清晰视觉反馈

### 待完成
- [ ] **Logo SVG** — 需要 Pink Milk 品牌标识（用户表示不需要）
- [ ] **App 截图** — 用于 README/营销（可用 Playwright 自动生成）

---

**设计增强文档**: `DESIGN_ENHANCEMENTS.md`
**增强样式文件**: `src/design-enhancements.css`

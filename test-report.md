# 今天吃什么 — 端到端测试报告

应用在本地 `http://localhost:3000` 运行，所有核心流程均通过。技术栈：Next.js 16 + React 19 + TypeScript + SQLite (better-sqlite3) + Tailwind v4 + Framer Motion。

质量检查：`tsc --noEmit` 通过，`eslint` 0 警告 0 错误，`next build` 成功（17 条路由）。

## 测试结果

| 功能 | 路由 | 结果 |
| --- | --- | --- |
| 首页「手气不错」一键随机 | `/` | 通过 — 弹出彩带 + 结果弹窗 |
| 幸运大转盘（带筛选） | `/decide/wheel` | 通过 — 转盘动画落定中奖项 |
| 多人投票（创建 + 投票） | `/vote`, `/vote/[id]` | 通过 — 实时票数更新到 100% |
| 历史与统计 | `/history` | 通过 — TOP 榜单 + 时间线 |
| 菜单管理（增/删） | `/manage` | 通过 — 新增/删除均有 toast 反馈 |
| 深色模式切换 | 全站 | 通过 — 明暗主题平滑切换 |

随机推荐 (`/decide/random`)、PK 淘汰赛 (`/decide/pk`)、心情筛选 (`/decide/mood`) 与上述模式共用同一数据/筛选层，构建与类型检查均通过。

## 已知说明

- 开发模式下 Next.js 显示的 1 个 hydration 警告由测试工具注入的 `devinid`/`devin-hidden` DOM 属性引起（非应用代码问题）；`<html>` 已设置 `suppressHydrationWarning`。
- SQLite 数据库文件位于 `data/lunch.sqlite`（首次运行自动创建并写入 20 条种子数据），已在 `.gitignore` 中忽略。

详细演示见随附的录屏 `lunch-walkthrough-edited.mp4`。

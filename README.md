# 家政中介服务平台

前后端分离架构的家政中介服务平台，已实现服务商入驻、实名认证、需求发布、撮合推荐、订单管理全流程可操作。
前端内置本地 mock 数据层（localStore），不启动后端也能完整跑通全部业务流程。

---

## 一、实际入口文件

### 1.1 后端入口（Python Flask）
- **入口文件**：[backend/app.py](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/backend/app.py)
- **默认端口**：`http://localhost:5000`
- **健康检查**：`GET http://localhost:5000/api/health`
- **接口边界**：`/api/providers`、`/api/realname-auth/:provider_id`、`/api/demands`、`/api/demands/:id/match`、`/api/orders`、`/api/admin/stats`（与前端 `localStore.js` 的服务方法一一对应，便于后续替换真实接口）

### 1.2 前端入口（React + Vite）
- **HTML 入口**：[frontend/index.html](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/index.html)
- **JS 入口**：[frontend/src/main.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/main.jsx)
- **根组件**：[frontend/src/App.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/App.jsx)
- **路由层**：[frontend/src/router/index.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/router/index.jsx)
- **Vite 配置**：[frontend/vite.config.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/vite.config.js)
- **默认访问**：`http://127.0.0.1:5173/`（Vite 默认端口 5173，已配置 `/api` 代理到 `http://localhost:5000`）

---

## 二、主要目录结构

```
order-management-28b3f653-p2/
├── backend/                         # Python Flask 接口服务（可选）
│   ├── app.py                       # 应用入口
│   ├── requirements.txt
│   ├── models/                      # 数据模型（constants/provider/realname_auth/demand/order）
│   ├── data/database.py             # 内存数据库 + 初始 mock 数据
│   ├── services/                    # matching_service / validation_service
│   └── api/                         # RESTful 接口（5 组 Blueprint）
│
└── frontend/                        # React 18 + Vite 前端应用
    ├── index.html
    ├── package.json
    ├── vite.config.js               # ★ 端口 5173 + /api 代理
    └── src/
        ├── main.jsx                 # React 入口（BrowserRouter 包裹）
        ├── App.jsx                  # 根组件：布局 + 角色切换 + 导航
        ├── router/index.jsx         # ★ 独立路由层（8 条路由）
        ├── store/localStore.js      # ★ 本地 mock 数据层（不依赖后端即可跑通）
        ├── services/
        │   ├── matcher.js           # 撮合匹配规则（职业/区域/认证/预算加权）
        │   ├── validator.js         # 参数校验（入驻/认证/需求/取消/异常备注）
        │   └── permissions.js       # ★ 角色权限判断（12 个权限函数）
        ├── api/index.js             # 后端接口封装（后续接入真实接口时使用）
        ├── context/
        │   ├── ToastContext.jsx     # 全局消息提示（success/error/info）
        │   └── RoleContext.jsx      # 保留旧实现
        ├── components/              # 通用组件
        │   ├── StatusTags.jsx       # 认证状态/订单状态彩色标签
        │   ├── EmptyState.jsx       # 空状态（带图标和操作引导）
        │   ├── CancelOrderModal.jsx # 取消订单弹窗（强制填原因）
        │   └── OrderTimeline.jsx    # ★ 订单进度时间线 + 业务操作记录
        ├── utils/constants.js       # 状态枚举 + 颜色映射（含 EXCEPTION 异常状态）
        ├── styles/global.css        # 全局样式（含 permission-denied/record-list/timeline 异常样式）
        └── views/                   # ★ 页面视图（8 个，便于复查）
            ├── Home.jsx             # /        平台首页 + 统计看板 + 角色快速入口
            ├── RolesPage.jsx        # /roles   角色切换页 + ✅🚫 权限对照
            ├── ProviderList.jsx     # /providers     服务商列表 + 入驻表单 + 搜索筛选
            ├── ProviderDetail.jsx   # /providers/:id 服务商详情 + 编辑 + 关联订单
            ├── AuthPage.jsx         # /auth    实名认证（提交/审核/拒绝带原因校验）
            ├── DemandsPage.jsx      # /demands 需求列表 + 发布（预算校验）
            ├── MatchesPage.jsx      # /matches 或 /matches/:demandId  撮合推荐 + 下单
            ├── OrdersPage.jsx       # /orders  订单列表 + 视角切换 + 异常处理
            ├── OrderDetail.jsx      # /orders/:id  订单详情 + 进度 + 操作记录 + 异常弹窗
            └── NotFound.jsx         # 404 页面（未知路径反馈 + 返回首页入口）
```

---

## 三、关键改动文件（本轮收口新增/重构）

| 类别 | 文件 | 说明 |
|---|---|---|
| 🔧 端口 | [frontend/vite.config.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/vite.config.js) | 端口从 3000 统一为 Vite 默认 **5173** |
| 🆕 权限服务 | [frontend/src/services/permissions.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/services/permissions.js) | 12 个权限函数 + `getPermissionDeniedMessage()`，所有按钮级权限统一入口 |
| 🆕 本地数据层 | [frontend/src/store/localStore.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/store/localStore.js) | 新增 `EXCEPTION`（异常待处理）状态流转；`operation_records` 操作记录数组；未认证服务商不可接单；所有状态变更自动追加操作记录；localStorage key v2 |
| 🆕 校验服务 | [frontend/src/services/validator.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/services/validator.js) | 新增 `validateExceptionRemark()` 校验 |
| 🔧 路由层 | [frontend/src/router/index.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/router/index.jsx) | 清理未使用 `Navigate` 导入 |
| 🔧 时间线组件 | [frontend/src/components/OrderTimeline.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/components/OrderTimeline.jsx) | 新增异常节点（红色高亮）、恢复服务节点、业务操作记录列表渲染 |
| 🔧 样式 | [frontend/src/styles/global.css](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/styles/global.css) | 新增 `.timeline-item.exception`、`.record-*`、`.permission-denied` 样式 |
| 🔧 状态常量 | [frontend/src/utils/constants.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/utils/constants.js) | 新增 `EXCEPTION: '异常待处理'` 及红色映射 |
| 🔧 全部 views | `Home/RolesPage/ProviderList/ProviderDetail/AuthPage/DemandsPage/MatchesPage/OrdersPage/OrderDetail` | 所有按钮级权限接入 `permissions.js`；无权限时显示 `permission-denied` 提示；订单页/详情页新增异常标记/处理弹窗；订单详情渲染操作记录 |
| 🧹 全部 import | 全量 20+ 文件 | 所有 import 路径补 `.js` / `.jsx` 后缀；清理 11 个文件的未使用 import（ORDER_STATUS/ROLES/ROLE_LABELS/getPermissionDeniedMessage/React 等） |

---

## 四、建议运行命令（Windows PowerShell）

### 4.1 启动后端（可选，前端单独也能跑）
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
**预期结果**：控制台显示 `Running on http://0.0.0.0:5000`，`GET http://localhost:5000/api/health` 返回 `{"status":"ok",...}`。

### 4.2 启动前端（★ 推荐单独启动即可）
```powershell
cd frontend
$env:npm_config_cache = "$PWD\.npm-cache"
npm.cmd install
npm.cmd run dev
```
**预期结果**：控制台显示 `Local: http://127.0.0.1:5173/`。浏览器访问 `http://127.0.0.1:5173/` 即进入中介平台首页。

> 💡 如果之前运行过旧版本（localStorage key 为 v1），数据会自动重置为 v2 初始状态。如需手动重置，可在首页点击「重置演示数据」按钮。

---

## 五、默认访问路径

| 路径 | 页面 |
|---|---|
| `http://127.0.0.1:5173/` | 平台首页（统计看板 + 异常订单 + 角色快速入口） |
| `http://127.0.0.1:5173/providers` | 服务商列表（含入驻入口，受角色权限控制） |
| `http://127.0.0.1:5173/providers/:id` | 服务商详情（含资料编辑，受角色权限控制） |
| `http://127.0.0.1:5173/auth` | 实名认证（提交 + 管理员审核 + 拒绝原因校验） |
| `http://127.0.0.1:5173/demands` | 需求列表 + 发布（仅用户端可发布） |
| `http://127.0.0.1:5173/matches` 或 `/matches/:demandId` | 撮合推荐结果 + 下单（仅用户端可下单） |
| `http://127.0.0.1:5173/orders` | 订单列表（视角切换 + 角色权限按钮 + 异常处理） |
| `http://127.0.0.1:5173/orders/:id` | 订单详情 + 进度时间线 + 业务操作记录 + 异常弹窗 |
| `http://127.0.0.1:5173/roles` | 角色切换页（✅ 可执行操作 / 🚫 无权限操作对照） |
| 其它任意路径 | 404 页面（带返回上一页 / 返回首页入口） |

顶部导航栏永久显示：🏠 首页 / 👷 服务商 / 🆔 实名认证 / 📋 用工需求 / 🤝 撮合推荐 / 📦 订单管理 / 🎭 角色切换。

---

## 六、人工复查步骤（★ 重点）

### ✅ 6.1 根路径与首页 → `/`
1. 浏览器打开 `http://127.0.0.1:5173/` 直接进入首页。
2. **可验证**：
   - 顶部显示「🏠 家政中介服务平台」+ 当前视角标签 + 三角色切换按钮。
   - 统计看板：服务商总数、订单总数、待审核认证、**异常订单**（新增）。
   - 认证/订单状态分布标签列表。
   - **业务操作记录总数**统计（新增）。
   - 按当前角色显示 3 张不同的快速入口卡片（用户端：发布需求/撮合/我的订单；服务商端：服务商管理/认证/我的订单；管理端：服务商/认证审核/订单管理）。
   - 底部「重置演示数据」按钮可一键恢复初始状态。

---

### ✅ 6.2 服务商列表 → `/providers`
1. 顶部导航点「👷 服务商」直接进入。
2. **可验证**：
   - **角色权限**：
     - 用户端 → 顶部显示 `💡 当前角色无法入驻，请切换到服务商端`。
     - 服务商端 / 管理端 → 显示「+ 申请入驻」按钮和入驻表单。
   - 5 位 mock 服务商卡片展示（张阿姨/李师傅/王大姐/赵师傅/陈阿姨），右上角不同认证状态彩色标签。
   - 搜索框可按姓名/区域/标签搜索，无结果显示 `没有找到与"xxx"匹配的服务商`。
   - 按职业类型、认证状态筛选。
   - 入驻表单必填项（姓名/职业/区域）缺失提交 → 对应字段红字提示。
   - 正确提交 → Toast 成功 → 自动跳转到 `/providers/:id` 详情页，列表同步新增。

---

### ✅ 6.3 实名认证页 → `/auth`
1. 顶部导航点「🆔 实名认证」，或在服务商卡片点「去认证」。
2. **可验证**：
   - 未加载服务商时显示 `👆 请先输入并加载服务商信息`。
   - 加载后：未提交 / 待审核 / 已通过 / 已拒绝 四种状态横幅（不同颜色）。
   - **角色权限 - 提交认证**：
     - 用户端 → 表单底部显示 `💡 当前角色无法提交认证，请切换到服务商端`。
     - 服务商端 / 管理端 → 显示提交按钮。
   - 提交校验：真实姓名为空 / 身份证号非 18 位或末位非法 / 正反面照为空 → 各字段红字提示。
   - 正确提交 → 状态切为「⏳ 待审核」，提交时间显示。
   - **角色权限 - 管理员审核**：
     - 用户端 / 服务商端 → 审核区显示 `审核功能仅限平台管理端，请切换角色后操作`。
     - 管理端 → 显示「🛠️ 管理员审核区」，列出所有待审核服务商。
   - **审核驳回原因校验（★ 新增）**：点「拒绝认证」弹窗 → 不填原因直接点确认 → textarea 下红字 `拒绝原因不能为空`。
   - 通过认证 → 服务商状态同步刷新为「✅ 已通过」，所有字段置为只读。
   - 拒绝认证（带原因）→ 状态切为「已拒绝」并显示具体原因，可重新编辑资料提交。

---

### ✅ 6.4 需求发布页 → `/demands`
1. 顶部导航点「📋 用工需求」。
2. **可验证**：
   - **角色权限**：
     - 服务商端 → 顶部显示 `💡 当前角色无法发布需求，请切换到用户端`，发布按钮不出现。
     - 用户端 / 管理端 → 显示「+ 发布新需求」按钮。
   - 发布表单校验：职业类型未选、服务地点为空、预算为空或 ≤ 0、期望时间未选 → 各字段红字提示。
   - 正确提交 → Toast `需求发布成功，正在跳转撮合推荐页...` → 600ms 后自动跳 `/matches/:demandId`。
   - 需求列表可按职业筛选，空状态引导发布。

---

### ✅ 6.5 撮合推荐结果 → `/matches` 或 `/matches/:demandId`
1. 顶部导航点「🤝 撮合推荐」，或从需求列表点「查看匹配服务商」。
2. **可验证**：
   - 顶部需求选择器：可切换查看不同需求的匹配。
   - 无需求时显示空状态 + 「去发布需求」按钮。
   - 需求详情卡片 + 匹配数量提示（按匹配度分数从高到低）。
   - 每张匹配卡片：匹配分数、认证状态、职业/区域/报价/标签、匹配理由列表（✓ 职业类型匹配 / ✓ 服务区域覆盖 / ✓ 已实名认证 / ✓ 预算在报价范围内）。
   - 无匹配 → 空状态 `没有可匹配的服务商，建议调整需求...`。
   - **角色权限（★ 新增）**：
     - 服务商端 / 管理端 → 卡片底部显示 `💡 当前角色无法下单，请切换到用户端`。
     - 用户端 → 显示「立即下单」按钮。
   - 重复下单：对同一服务商下两笔进行中订单 → Toast `该服务商已有进行中的订单，请勿重复提交`（409）。
   - 下单成功 → 自动跳转 `/orders/:id`。

---

### ✅ 6.6 订单列表 + 详情 → `/orders` 与 `/orders/:id`
1. 顶部导航点「📦 订单管理」进入列表，点击「查看详情」进入详情页。
2. **订单列表 `/orders` 可验证**：
   - **视角切换器**：我下的单（用户端）/ 我接的单（服务商端）/ 全部订单（管理端）。
   - 按状态筛选（含新增的「异常待处理」）。
   - **角色权限按钮**：
     - 用户端 → 仅能看到「查看详情」「取消订单」按钮。
     - 服务商端 → 「接单」「开始服务」「完成服务」「标记异常」按钮按状态动态显示；**未认证服务商** → 接单按钮位置显示 ⚠️ `未认证不能接单`（★ 新增）。
     - 管理端 → 「标记异常」「处理异常」「取消订单」按钮可见。
   - **标记异常**：服务中订单 → 弹窗强制填异常备注（空值红字）→ 状态切为「异常待处理」。
   - **处理异常**：异常订单（仅管理端可见）→ 弹窗强制填处理说明（空值红字）→ 状态切回「服务中」。
3. **订单详情 `/orders/:id` 可验证**：
   - 完整信息：订单号、状态彩色标签、服务商名（可点击跳转 `/providers/:id`）、客户、职业、地点、预算、时间、备注。
   - 服务商名旁显示「未认证」红色标签（若未认证）。
   - **进度时间线**：创建 → 已接单 → 服务中 → **异常待处理（红色高亮）** → 异常已处理恢复服务 → 已完成 / 已取消（带取消原因）。
   - **业务操作记录列表（★ 新增）**：每一行展示角色标签、动作、时间、详细说明、结果。下单/接单/开始/完成/取消/异常/恢复均自动追加记录。
   - 所有操作按钮与列表一致，受角色权限控制。
   - **未认证待确认订单**：接单按钮旁显示 ⚠️ `未通过实名认证，无法接单`。

---

### ✅ 6.7 角色切换 → `/roles`
1. 顶部导航点「🎭 角色切换」。
2. **可验证**：
   - 三张角色卡片：用户端 👤 / 服务商端 👷 / 平台管理端 🛠️。
   - 每张卡片分 ✅ **可执行操作** 与 🚫 **无权限操作** 两栏，明确展示权限差异。
   - 当前视角卡片高亮 + 「当前」标签。
   - 点击任意卡片 → Toast `已切换至xxx`，顶部「当前视角：xxx」同步更新，所有页面按钮即时联动变化。
   - 底部 5 个「常见复查路径推荐」按钮可一键跳转。

---

### ✅ 6.8 未知路径 → 任意不存在路径
1. 访问 `http://127.0.0.1:5173/xxx-unknown`。
2. **可验证**：
   - 显示 404 页面：🔍 +「页面走丢了」+ 说明文字。
   - 「返回上一页」按钮 → 返回前一页。
   - 「返回首页」按钮 → 跳转 `/`。

---

## 七、全部校验与反馈清单

| 场景 | 触发方式 | 预期反馈 |
|---|---|---|
| 根路径访问失败 | Vite 未启动时 | 浏览器无法访问；启动后 `http://127.0.0.1:5173/` 应直达首页 |
| 角色无权限操作 | 非用户端点击下单/发布需求等 | 按钮不显示 或 显示 `💡 当前角色无法 xxx`，同时 Toast 提示 |
| 未选择详情 | 撮合页未选需求直接下单 | Toast `请先选择需求` |
| 实名认证资料缺失 | 姓名/证号/照片留空提交 | 对应字段红字提示 |
| 审核驳回原因为空 | 拒绝认证不填原因直接确认 | 弹窗内红字 `拒绝原因不能为空` |
| 需求职业类型未填 | 发布需求不选职业 | 红字 `请选择职业类型` |
| 预算不合法 | 预算为空、0、负数或非数字 | 红字 `预算必须大于 0` |
| 没有匹配服务商 | 极端条件需求 | 空状态 + 引导调整条件 |
| 重复下单 | 对同一服务商下两笔进行中订单 | Toast `该服务商已有进行中的订单，请勿重复提交` |
| 取消原因为空 | 取消订单弹窗不填原因 | 弹窗内红字 `请填写取消原因` |
| 异常处理备注为空 | 标记/处理异常不填备注 | 弹窗内红字 `请填写异常处理备注` |
| 搜索无结果 | 搜索不存在的关键字 | 列表区空状态提示 |
| 未认证服务商接单 | 未认证服务商端视角点击接单 | ⚠️ 红字 `未认证不能接单` + Toast 拦截 |
| 未知路径返回 | 访问不存在的路由 | 404 页 + 返回上一页/返回首页按钮 |
| 非法状态流转 | 已完成订单点击取消 | Toast `当前状态无法取消` |

---

## 八、后续扩展点（已预留，未展开）

- **担保交易**：`localStore.js` 的订单模型可追加 `guarantee_*` 字段。
- **在线支付**：`frontend/src/services/` 可新增 `payment.js`，后端对应 `payment_service.py`。
- **平台介入**：订单状态机可追加 `DISPUTE`（纠纷中），管理端增加介入处理入口（已有 `EXCEPTION` → `IN_SERVICE` 可作为基础扩展）。
- **真实鉴权**：`context/RoleContext.jsx` 目前为本地 mock，可替换为 JWT/SSO 登录态；`services/permissions.js` 函数签名不变。
- **真实接口替换**：所有 views 均通过 `store.xxx()` 或 `services/xxx.js` 调用业务逻辑，只需将 `store/localStore.js` 的实现替换为 `fetch('/api/...')`，不影响页面层代码。
- **数据持久化**：`backend/data/database.py` 当前为内存字典，可平滑替换为 SQLAlchemy + SQLite/MySQL。

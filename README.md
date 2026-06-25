# 家政中介服务平台

前后端分离架构的家政中介服务平台，已实现服务商入驻、实名认证、需求发布、撮合推荐、订单管理全流程可操作。

---

## 一、实际入口文件

### 1.1 后端入口（Python Flask）
- **入口文件**：[backend/app.py](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/backend/app.py)
- **默认端口**：`http://localhost:5000`
- **健康检查**：`GET http://localhost:5000/api/health`

### 1.2 前端入口（React + Vite）
- **HTML 入口**：[frontend/index.html](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/index.html)
- **JS 入口**：[frontend/src/main.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/main.jsx)
- **根组件**：[frontend/src/App.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/App.jsx)
- **路由层**：[frontend/src/router/index.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/router/index.jsx)
- **默认访问**：`http://localhost:3000`（Vite dev server 已配置 `/api` 代理到 `http://localhost:5000`）

> **双数据层设计**：前端内置本地 mock 数据层（localStore），不启动后端也能完整跑通全部业务流程；启动后端后可通过 `/api/*` 调用真实接口。

---

## 二、主要目录结构

```
order-management-28b3f653-p2/
├── backend/                         # Python Flask 接口服务
│   ├── app.py                       # 应用入口，注册 5 组 Blueprint
│   ├── requirements.txt
│   ├── models/                      # 数据模型
│   │   ├── constants.py             # 职业类型、状态枚举
│   │   ├── provider.py              # 服务商模型
│   │   ├── realname_auth.py         # 实名认证模型
│   │   ├── demand.py                # 用工需求模型
│   │   └── order.py                 # 订单模型 + 状态流转
│   ├── data/
│   │   └── database.py              # 内存数据库 + 5 条初始 mock 服务商
│   ├── services/
│   │   ├── matching_service.py      # 撮合匹配规则（职业/区域/认证/预算）
│   │   └── validation_service.py    # 参数校验（入驻/认证/需求/取消）
│   └── api/                         # RESTful 接口层
│       ├── provider_routes.py       # /api/providers
│       ├── auth_routes.py           # /api/realname-auth
│       ├── demand_routes.py         # /api/demands  含 /:id/match
│       ├── order_routes.py          # /api/orders     含状态流转
│       └── admin_routes.py          # /api/admin      统计/审核/监控
│
└── frontend/                        # React 18 + Vite 前端应用
    ├── index.html
    ├── package.json
    ├── vite.config.js               # dev server + /api 代理
    └── src/
        ├── main.jsx                 # React 入口
        ├── App.jsx                  # 根组件：布局 + 角色切换 + 导航
        ├── router/index.jsx         # 独立路由层
        ├── store/localStore.js      # ★ 本地 mock 数据层（不依赖后端即可跑通）
        ├── services/
        │   ├── matcher.js           # 撮合匹配规则（与后端同构）
        │   └── validator.js         # 参数校验（与后端同构）
        ├── api/index.js             # 后端接口封装（可选启用）
        ├── context/
        │   ├── ToastContext.jsx     # 全局消息提示
        │   └── RoleContext.jsx      # 角色上下文（保留旧实现）
        ├── components/              # 通用组件
        │   ├── StatusTags.jsx       # 认证状态/订单状态标签
        │   ├── EmptyState.jsx       # 空状态
        │   ├── CancelOrderModal.jsx # 取消订单弹窗
        │   └── OrderTimeline.jsx    # 订单进度时间线
        ├── utils/constants.js       # 状态常量/颜色映射
        ├── styles/global.css        # 全局样式
        └── views/                   # ★ 页面视图（便于复查）
            ├── Home.jsx             # /        平台首页 + 统计看板 + 快速入口
            ├── RolesPage.jsx        # /roles   角色切换页 + 复查导航
            ├── ProviderList.jsx     # /providers     服务商列表 + 入驻表单 + 筛选搜索
            ├── ProviderDetail.jsx   # /providers/:id 服务商详情 + 编辑资料 + 关联订单
            ├── AuthPage.jsx         # /auth    实名认证提交 + 状态展示 + 管理员审核
            ├── DemandsPage.jsx      # /demands 需求列表 + 发布表单
            ├── MatchesPage.jsx      # /matches 或 /matches/:demandId  撮合推荐结果 + 下单
            ├── OrdersPage.jsx       # /orders  订单列表 + 视角切换 + 状态操作
            ├── OrderDetail.jsx      # /orders/:id  订单详情 + 进度时间线 + 状态流转
            └── NotFound.jsx         # 404 页面（未知路径反馈 + 返回首页入口）
```

---

## 三、关键改动文件（本轮新增/重构）

| 类别 | 文件 | 说明 |
|---|---|---|
| 🆕 路由层 | [frontend/src/router/index.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/router/index.jsx) | 独立路由模块，统一维护 `/`、`/providers`、`/auth`、`/demands`、`/matches`、`/orders`、`/roles` 及 404 |
| 🆕 本地数据层 | [frontend/src/store/localStore.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/store/localStore.js) | 独立 mock 层：含 5 位服务商/1 条需求/1 条订单；所有 CRUD 与状态流转操作，数据写入 localStorage 并联动订阅刷新 |
| 🆕 匹配服务 | [frontend/src/services/matcher.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/services/matcher.js) | 职业/区域/认证/预算四维匹配打分，输出匹配理由 |
| 🆕 校验服务 | [frontend/src/services/validator.js](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/services/validator.js) | 入驻/认证/需求/取消四类表单校验 |
| 🔧 根组件 | [frontend/src/App.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/App.jsx) | 重构为顶部角色按钮 + 横向导航栏布局，通过 NavLink 切换简洁路径 |
| 🆕 首页 | [frontend/src/views/Home.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/Home.jsx) | 统计看板 + 状态分布 + 6 个快速入口卡片 + 重置演示数据按钮 |
| 🆕 角色页 | [frontend/src/views/RolesPage.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/RolesPage.jsx) | 三视角说明卡片 + 一键切换 + 复查路径快捷按钮 |
| 🆕 服务商列表 | [frontend/src/views/ProviderList.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/ProviderList.jsx) | 入驻表单（含校验）+ 搜索/筛选 + 卡片列表 + 去认证跳转 |
| 🆕 服务商详情 | [frontend/src/views/ProviderDetail.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/ProviderDetail.jsx) | 查看/编辑资料 + 认证状态展示 + 关联订单列表 |
| 🆕 实名认证 | [frontend/src/views/AuthPage.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/AuthPage.jsx) | 按 ID 加载服务商 + 提交/重提认证 + 四态展示 + 管理员审核区（通过/拒绝带原因） |
| 🆕 需求页 | [frontend/src/views/DemandsPage.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/DemandsPage.jsx) | 发布需求（含预算校验） + 需求列表 + 跳撮合 |
| 🆕 撮合页 | [frontend/src/views/MatchesPage.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/MatchesPage.jsx) | 需求选择器 + 需求详情 + 匹配度排序 + 匹配理由 + 立即下单（防重复） |
| 🆕 订单列表 | [frontend/src/views/OrdersPage.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/OrdersPage.jsx) | 视角切换（用户/服务商/管理） + 状态筛选 + 接单/开始/完成/取消 |
| 🆕 订单详情 | [frontend/src/views/OrderDetail.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/OrderDetail.jsx) | 完整字段 + 进度时间线 + 状态流转按钮 + 取消原因弹窗 |
| 🆕 404 | [frontend/src/views/NotFound.jsx](file:///d:/code-space/coding-soler/order-management-28b3f653-p2/frontend/src/views/NotFound.jsx) | 未知路径友好提示 + 返回上一页 / 返回首页 |

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
**预期结果**：控制台显示 `Running on http://0.0.0.0:5000`，访问 `http://localhost:5000/api/health` 返回 `{"status":"ok",...}`。

### 4.2 启动前端
```powershell
cd frontend
$env:npm_config_cache = "$PWD\.npm-cache"
npm.cmd install
npm.cmd run dev
```
**预期结果**：控制台显示 `Local: http://localhost:3000/`。浏览器访问 `http://localhost:3000/` 即进入中介平台首页。

---

## 五、默认访问路径

| 路径 | 页面 |
|---|---|
| `http://localhost:3000/` | 平台首页（统计看板 + 快速入口） |
| `http://localhost:3000/providers` | 服务商列表（含入驻入口） |
| `http://localhost:3000/providers/:id` | 服务商详情（含资料编辑） |
| `http://localhost:3000/auth` | 实名认证提交 + 审核 |
| `http://localhost:3000/demands` | 需求列表 + 发布 |
| `http://localhost:3000/matches` 或 `/matches/:demandId` | 撮合推荐结果 + 下单 |
| `http://localhost:3000/orders` | 订单列表（可切视角） |
| `http://localhost:3000/orders/:id` | 订单详情 + 进度时间线 |
| `http://localhost:3000/roles` | 角色切换页 + 复查导航 |
| 其它任意路径 | 404 页面（带返回入口） |

顶部导航栏永久显示：🏠 首页 / 👷 服务商 / 🆔 实名认证 / 📋 用工需求 / 🤝 撮合推荐 / 📦 订单管理 / 🎭 角色切换。

---

## 六、人工复查路径（重点）

### ✅ 6.1 服务商列表 → `/providers`
1. 顶部导航点「👷 服务商」直接进入。
2. **可验证**：
   - 5 位 mock 服务商以卡片展示（张阿姨/李师傅/王大姐/赵师傅/陈阿姨）。
   - 每张卡片右上角显示不同认证状态（已通过/待审核/已拒绝/未提交），状态颜色区分。
   - 顶部筛选条：按姓名/区域/标签搜索、按职业类型、按认证状态筛选。
   - 搜索无结果时显示「没有找到与“xxx”匹配的服务商」空状态。
   - 点击「+ 申请入驻」展开入驻表单；不填姓名/职业/区域等必填项直接提交会显示对应红色校验提示。
   - 正确填写后提交 → 弹出成功 Toast，自动跳转到新服务商详情页 `/providers/:id`，并同步出现在列表里。

### ✅ 6.2 实名认证页 → `/auth`
1. 顶部导航点「🆔 实名认证」，或在服务商卡片点「去认证」。
2. **可验证**：
   - 首次进入显示「请先输入并加载服务商信息」；可输入任意服务商 ID（从 `/providers` 复制）后点「加载」。
   - 资料缺失（未提交）时提示「您还没有提交认证资料」。
   - 提交时真实姓名为空、身份证号格式不对（非 18 位/末位非法）、正反面照为空都会在字段下红字提示。
   - 正确提交后状态切为「⏳ 待审核」，显示提交时间。
   - 页面下方「管理员审核区」列出所有待审核服务商，可点「通过认证」或「拒绝认证」。
   - 拒绝必须填写原因，否则提示；拒绝后上方服务商卡片同步刷新为「已拒绝 + 具体原因」，并可再编辑重新提交。
   - 通过后所有字段置为只读，显示「✅ 已通过」。
   - 上述状态在 `/providers` 列表右上角状态标签、`/providers/:id` 详情头部实时同步。

### ✅ 6.3 需求发布页 → `/demands`
1. 顶部导航点「📋 用工需求」。
2. **可验证**：
   - 点「+ 发布新需求」展开表单。
   - 校验：未选职业类型、服务地点为空、预算为空或 ≤ 0、期望时间未选 —— 均有对应红字提示。
   - 正确提交后显示「需求发布成功，正在跳转撮合推荐页...」，600ms 后自动跳转 `/matches/:demandId`。
   - 发布的需求同步出现在需求列表中。

### ✅ 6.4 撮合推荐结果 → `/matches` 或 `/matches/:demandId`
1. 顶部导航点「🤝 撮合推荐」，或从需求列表点「查看匹配服务商」。
2. **可验证**：
   - 顶部需求选择器：可切换查看不同需求的匹配结果。
   - 若还没有任何需求，显示空状态并引导「去发布需求」。
   - 选中需求后展示需求详情卡片 + 匹配数量提示。
   - 推荐列表按匹配度分数从高到低排序，每张卡片显示：匹配分数、认证状态、职业、区域、报价、标签、匹配理由列表（✓ 职业类型匹配 / ✓ 服务区域覆盖 / ✓ 已实名认证 / ✓ 预算在报价范围内）。
   - 没有任何服务商匹配时显示「没有可匹配的服务商，建议调整需求...」空状态。
   - 点「立即下单」→ 调用防重复校验：同一用户对同一服务商有进行中订单会提示「该服务商已有进行中的订单，请勿重复提交」。
   - 下单成功后跳转到订单详情 `/orders/:id`。

### ✅ 6.5 订单详情 → `/orders/:id`
1. 顶部导航点「📦 订单管理」→ 某订单点「查看详情」，或下单成功后自动跳转。
2. **可验证**：
   - 完整信息：订单号、状态、服务商（可点击跳转详情）、客户、职业、地点、预算、时间、备注。
   - 订单进度时间线：创建 → 已接单 → 服务中 → 已完成（或取消），每个节点带时间戳。
   - 顶部操作按钮随当前状态动态出现：待确认 →「接单」；已接单 →「开始服务」；服务中 →「完成服务」/「取消订单」。
   - 非法状态流转（例如已完成再点取消）会 Toast 提示「当前状态无法取消」等后端一致的报错。
   - 「取消订单」弹出模态框，取消原因为空时点确认红字提示「请填写取消原因」；填写后确认 → 状态切为「已取消」，时间线新增一条显示具体取消原因，并同步至订单列表。

### ✅ 6.6 角色切换 → `/roles`
1. 顶部导航点「🎭 角色切换」。
2. **可验证**：
   - 三张角色卡片，分别说明用户/服务商/管理端的功能，当前角色卡片高亮。
   - 点击卡片切换角色，顶部 Toast 显示「已切换至 xxx」，头部「当前视角：xxx」同步更新。
   - 页面底部给出 5 个「常见复查路径推荐」按钮，可一键跳转到各核心复查页。

---

## 七、全部校验与反馈清单

| 场景 | 触发方式 | 预期反馈 |
|---|---|---|
| 服务商入驻：姓名为空 | 入驻表单不填姓名提交 | 姓名字段下方红字「请填写姓名」 |
| 服务商入驻：职业未选 | 未选职业类型提交 | 红字「请选择职业类型」 |
| 服务商入驻：区域为空 | 不填服务区域 | 红字「请填写服务区域」 |
| 服务商入驻：报价格式错 | 报价范围填「abc」 | 红字「报价范围格式不正确，例如：100-500」 |
| 实名认证：姓名/证号/照片缺失 | 留空提交 | 对应字段红字提示 |
| 实名认证：身份证号非法 | 填少于 18 位或末位非数字/X | 红字「身份证号格式不正确」 |
| 需求发布：预算为空或 ≤ 0 | 不填预算或填 0/-1 | 红字「预算必须大于 0」 |
| 需求发布：职业/地点/时间缺失 | 对应留空 | 各字段红字提示 |
| 撮合：无匹配服务商 | 选一个极端条件需求或无需求 | 空状态 + 引导提示 |
| 下单：重复提交 | 对同一服务商下两笔进行中订单 | Toast 「该服务商已有进行中的订单，请勿重复提交」 |
| 取消订单：原因为空 | 取消弹窗不填原因直接确认 | 弹窗内红字「请填写取消原因」 |
| 拒绝认证：原因为空 | 拒绝认证不填原因 | Toast 「请填写拒绝原因」 |
| 搜索无结果 | 搜不存在的关键字 | 列表区空状态提示 |
| 未知路径访问 | 输入 `http://localhost:3000/xxx` 之类不存在的路径 | 404 页：「页面走丢了」+ 返回上一页/返回首页按钮 |
| 非法状态流转 | 已完成订单点取消 | Toast 「当前状态无法取消」 |

---

## 八、后续扩展点（已预留，未展开）

- **担保交易**：订单模型 `backend/models/order.py` 及前端 `localStore.js` 已预留 `guarantee_*` 字段扩展位。
- **在线支付**：`services/` 目录可新增 `payment_service.py / payment.js`。
- **平台介入**：`Order` 状态机可新增 `DISPUTE`（纠纷中）状态，管理端增加介入处理入口。
- **真实鉴权**：`context/RoleContext.jsx` 目前为本地 mock，可替换为 JWT/SSO 登录态。
- **数据持久化**：`backend/data/database.py` 当前为内存字典，可平滑替换为 SQLAlchemy + SQLite/MySQL。

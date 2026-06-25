# 家政中介服务平台

前后端分离架构的家政中介服务平台，实现服务商入驻、实名认证、需求发布、撮合推荐、订单管理等核心业务流程。

---

## 一、后端（Python Flask）

### 1.1 后端入口

- **入口文件**: `backend/app.py`
- **默认监听**: `http://localhost:5000`
- **健康检查**: `GET http://localhost:5000/api/health`

### 1.2 后端目录结构

```
backend/
├── app.py                    # Flask 应用入口
├── requirements.txt          # Python 依赖
├── models/                   # 数据模型层
│   ├── __init__.py
│   ├── constants.py          # 常量定义（职业类型、状态枚举等）
│   ├── provider.py           # 服务商模型
│   ├── realname_auth.py      # 实名认证模型
│   ├── demand.py             # 用工需求模型
│   └── order.py              # 订单模型（含状态流转）
├── data/                     # 数据层
│   ├── __init__.py
│   └── database.py           # 本地内存数据库 + 初始 mock 数据
├── services/                 # 业务逻辑层
│   ├── __init__.py
│   ├── matching_service.py   # 撮合匹配规则
│   └── validation_service.py # 参数校验规则
└── api/                      # 接口层（RESTful API）
    ├── __init__.py
    ├── provider_routes.py    # /api/providers   服务商接口
    ├── auth_routes.py        # /api/realname-auth 实名认证接口
    ├── demand_routes.py      # /api/demands     需求接口（含撮合匹配）
    ├── order_routes.py       # /api/orders      订单接口（含状态流转）
    └── admin_routes.py       # /api/admin       平台管理接口
```

### 1.3 主要 API 一览

| 模块 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 服务商 | GET | `/api/providers` | 服务商列表（支持按职业、认证状态筛选） |
| 服务商 | GET | `/api/providers/:id` | 服务商详情 |
| 服务商 | POST | `/api/providers` | 服务商入驻 |
| 服务商 | PUT | `/api/providers/:id` | 更新服务商资料 |
| 实名认证 | GET | `/api/realname-auth/:provider_id` | 获取认证信息 |
| 实名认证 | POST | `/api/realname-auth/:provider_id/submit` | 提交认证资料 |
| 实名认证 | POST | `/api/realname-auth/:provider_id/approve` | 审核通过 |
| 实名认证 | POST | `/api/realname-auth/:provider_id/reject` | 审核拒绝（需原因） |
| 需求 | GET | `/api/demands` | 需求列表 |
| 需求 | POST | `/api/demands` | 发布需求 |
| 需求 | GET | `/api/demands/:id/match` | 撮合匹配推荐服务商 |
| 订单 | GET | `/api/orders` | 订单列表（支持按用户/服务商/状态筛选） |
| 订单 | GET | `/api/orders/:id` | 订单详情 |
| 订单 | POST | `/api/orders` | 创建订单（防重复提交） |
| 订单 | POST | `/api/orders/:id/accept` | 服务商接单 |
| 订单 | POST | `/api/orders/:id/start` | 开始服务 |
| 订单 | POST | `/api/orders/:id/complete` | 完成订单 |
| 订单 | POST | `/api/orders/:id/cancel` | 取消订单（需原因） |
| 管理端 | GET | `/api/admin/stats` | 平台统计数据 |
| 管理端 | GET | `/api/admin/providers` | 服务商管理列表 |
| 管理端 | GET | `/api/admin/orders` | 订单监控列表 |

### 1.4 建议运行命令（PowerShell）

```powershell
cd backend
$env:npm_config_cache = "$PWD\.npm-cache"
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

预期结果：控制台显示 `Running on http://0.0.0.0:5000`，访问 `http://localhost:5000/api/health` 返回 `{"status":"ok","message":"中介平台后端服务运行正常"}`。

---

## 二、前端（React + Vite）

### 2.1 前端入口

- **入口文件**: `frontend/index.html` + `frontend/src/main.jsx`
- **默认访问**: `http://localhost:3000`
- **API 代理**: `/api` → `http://localhost:5000`（Vite dev server 自动代理）

### 2.2 前端目录结构

```
frontend/
├── index.html                # HTML 入口
├── package.json              # npm 依赖
├── vite.config.js            # Vite 配置
└── src/
    ├── main.jsx              # React 入口
    ├── App.jsx               # 根组件（路由 + 角色切换 + 导航）
    ├── api/
    │   └── index.js          # 统一 API 调用层
    ├── utils/
    │   └── constants.js      # 前端常量（状态颜色映射等）
    ├── context/
    │   ├── RoleContext.jsx   # 角色上下文（用户/服务商/管理员）
    │   └── ToastContext.jsx  # 全局消息提示
    ├── styles/
    │   └── global.css        # 全局样式
    ├── components/           # 通用组件
    │   ├── StatusTags.jsx    # 状态标签（认证状态、订单状态）
    │   ├── EmptyState.jsx    # 空状态组件
    │   ├── CancelOrderModal.jsx # 取消订单弹窗（含原因校验）
    │   └── OrderTimeline.jsx # 订单进度时间线
    └── pages/                # 页面组件
        ├── user/             # 用户端
        │   ├── DemandList.jsx      # 需求列表
        │   ├── PublishDemand.jsx   # 发布需求（含表单校验）
        │   ├── MatchResult.jsx     # 撮合推荐结果 + 下单
        │   ├── OrderList.jsx       # 我的订单
        │   └── OrderDetail.jsx     # 订单详情
        ├── provider/         # 服务商端
        │   ├── ProviderList.jsx    # 服务商列表
        │   ├── ProviderRegister.jsx # 服务商入驻（含表单校验）
        │   ├── ProviderProfile.jsx  # 资料编辑
        │   ├── ProviderAuth.jsx     # 实名认证（提交/状态展示）
        │   ├── OrderList.jsx        # 订单管理
        │   └── OrderDetail.jsx      # 订单详情
        └── admin/            # 平台管理端
            ├── Dashboard.jsx       # 数据看板（认证/订单统计）
            ├── ProviderList.jsx    # 服务商管理（审核认证）
            └── OrderList.jsx       # 订单监控
```

### 2.3 建议运行命令（PowerShell）

```powershell
cd frontend
$env:npm_config_cache = "$PWD\.npm-cache"
npm.cmd install
npm.cmd run dev
```

预期结果：控制台显示 `Local: http://localhost:3000/`，浏览器访问后显示平台首页。

---

## 三、默认访问路径

启动前后端后，在浏览器访问：

- **前端首页**: `http://localhost:3000/` → 自动跳转至当前角色默认页
- 切换角色：点击页面顶部右上角「用户端 / 服务商端 / 平台管理端」按钮

### 各角色默认页

| 角色 | 默认路径 |
|---|---|
| 用户端 | `http://localhost:3000/user/demands` |
| 服务商端 | `http://localhost:3000/provider/list` |
| 平台管理端 | `http://localhost:3000/admin/dashboard` |

---

## 四、人工复查路径

### 4.1 服务商列表
- **路径**: 切换至「服务商端」→ 服务商列表（或直接访问 `/provider/list`）
- **可验证**:
  - 展示所有 mock 服务商（张阿姨/李师傅/王大姐/赵师傅/陈阿姨）
  - 每个服务商展示不同的认证状态（已通过/待审核/已拒绝/未提交）
  - 支持按职业类型、认证状态筛选
  - 展示姓名、职业、服务区域、报价、标签、简介

### 4.2 实名认证页
- **路径**: 切换至「服务商端」→ 实名认证（或直接访问 `/provider/auth`）
- **可验证**:
  - 首次进入：输入服务商 ID（可从服务商列表页面复制 mock 数据的 ID）
  - 加载后显示当前认证状态（待审核/已通过/已拒绝/未提交）
  - 已通过状态：所有字段只读
  - 已拒绝状态：显示拒绝原因，可修改后重新提交
  - 提交时校验：真实姓名、身份证号格式、正反面照片 URL 必填
  - 身份证号正则校验：18 位，末位可为 X/x
  - 提交后状态变为「待审核」，显示提交时间

### 4.3 需求发布页
- **路径**: 切换至「用户端」→ 发布需求（或直接访问 `/user/demands/publish`）
- **可验证**:
  - 职业类型下拉选择（保姆/月嫂/维修工/保洁等 10 种）
  - 必填项校验：职业类型、地点、预算、期望时间
  - 预算校验：必须大于 0 的数字
  - 发布成功后自动跳转至撮合推荐页

### 4.4 推荐撮合结果页
- **路径**: 用户端 → 需求列表 → 某需求点「撮合服务商」→ 进入（或发布需求成功后自动跳转，URL：`/user/demands/:id/match`）
- **可验证**:
  - 顶部展示当前需求详情（职业、地点、预算、时间、备注）
  - 按匹配度降序展示推荐服务商列表
  - 每个服务商显示：匹配分数、认证状态、职业、服务区域、报价、标签、简介
  - 显示匹配理由（如：职业类型匹配、服务区域覆盖、已实名认证、预算在范围内等）
  - 无匹配时显示空状态提示
  - 点击「立即下单」→ 防重复提交校验 → 成功后跳转订单详情

### 4.5 订单详情页
- **路径**: 用户端/服务商端 → 订单列表 → 某订单点「查看详情」（URL：`/user/orders/:id` 或 `/provider/orders/:id`）
- **可验证**:
  - 展示订单完整信息（订单号、状态、双方信息、地点、预算、时间、备注）
  - 订单进度时间线（创建→接单→服务中→完成/取消，每个节点含时间）
  - 根据当前状态显示对应操作按钮
  - 取消订单：弹出模态框，强制填写取消原因，否则报错
  - 状态流转：待确认→已接单→服务中→已完成 / 任一步骤→已取消

### 4.6 管理端审核
- **路径**: 切换至「平台管理端」→ 服务商管理（`/admin/providers`）
- **可验证**:
  - 展示所有服务商及认证详情（真实姓名、身份证号、上次拒绝原因）
  - 待审核的服务商显示「通过认证」「拒绝认证」按钮
  - 拒绝认证必须填写原因
  - 审核结果在服务商列表、实名认证页同步刷新

---

## 五、校验与反馈清单（可人工验证）

| 场景 | 校验点 | 预期反馈 |
|---|---|---|
| 服务商入驻 | 姓名为空 | 红色提示「请填写姓名」 |
| 服务商入驻 | 未选职业类型 | 红色提示「请选择职业类型」 |
| 服务商入驻 | 服务区域为空 | 红色提示「请填写服务区域」 |
| 服务商入驻 | 报价范围格式错误 | 红色提示「报价范围格式不正确，例如：100-500」 |
| 实名认证 | 身份证号格式错误 | 红色提示「身份证号格式不正确」 |
| 实名认证 | 缺少正反面照片 | 红色提示字段错误 |
| 需求发布 | 预算为空或 ≤ 0 | 红色提示「预算必须大于0」 |
| 需求发布 | 未选职业、地点、时间 | 各字段红色提示 |
| 撮合推荐 | 无匹配服务商 | 空状态提示 |
| 重复下单 | 同一用户对同一服务商下进行中订单 | 后端返回 409，提示「该服务商已有进行中的订单，请勿重复提交」 |
| 取消订单 | 取消原因为空 | 模态框内红色提示「请填写取消原因」 |
| 拒绝认证 | 拒绝原因为空 | 模态框内红色提示 |
| 订单状态非法流转 | 如已完成的订单再点取消 | 后端返回 400，提示状态非法 |

---

## 六、架构说明与后续扩展点

- **数据层**: 当前使用内存数据库（`backend/data/database.py`），后续可平滑替换为 SQLAlchemy + SQLite/MySQL，接口层无需改动。
- **撮合规则**: `backend/services/matching_service.py` 独立模块，后续可加入技能标签匹配、评分权重、地理距离计算等更复杂策略。
- **担保/支付/平台介入**: 订单模型（`backend/models/order.py`）已预留扩展字段，可在 `services/` 新增独立模块接入。
- **前后端通信**: 统一通过 `/api/*` 代理，接口返回结构统一为 `{code, message, data, errors?}`，前端 `src/api/index.js` 集中封装。
- **角色切换**: 纯前端 Context 实现，后续对接真实登录鉴权时只需在 `RoleContext.jsx` 中替换为后端登录态即可。

# 📋 Wisematic ERP Frontend - TODO List

## 🎯 項目概覽
前端 Next.js 開發任務清單，連接 Django 後端 (http://127.0.0.1:8000)

---

## 📊 API vs UI 功能狀態報告 (2024-12-05 更新)

### ✅ 已完成實作的 UI 功能

| 模組 | API 端點 | UI 頁面 | 狀態 |
|------|----------|---------|------|
| 認證 | `/auth/token/`, `/auth/google/` | `/auth/sign-in`, `/auth/google` | ✅ 完成 |
| AI 助手 - 分析師 | `/analyst-assistant/*` | `/dashboard/analyst-assistant` | ✅ 完成 |
| AI 助手 - 規劃師 | `/planner-assistant/*` | `/dashboard/planner-assistant` | ✅ 完成 |
| AI 助手 - 文件 | `/document-assistant/*` | `/dashboard/document-assistant` | ✅ 完成 (含批量上傳) |
| 財務 - 發票 | `/accounting/invoices/` | `/dashboard/finance/invoices` | ✅ 完成 |
| 財務 - 費用 | `/accounting/expenses/` | `/dashboard/finance/expenses` | ✅ 完成 |
| 財務 - 報表 | `/accounting/reports/*` | `/dashboard/finance/reports` | ✅ 完成 |
| 文件管理 | `/documents/` | `/dashboard/documents` | ✅ 完成 |
| API Key 管理 | `/settings/api-keys/*` | `/dashboard/settings/api-keys` | ✅ 完成 |
| RAG 知識庫 | `/rag/knowledge/` | `/dashboard/settings/knowledge-base` | ✅ 完成 |
| 會計科目 | `/accounting/accounts/` | `/dashboard/finance/accounts` | ✅ 完成 (樹狀結構) |
| 日記帳 | `/accounting/journal-entries/` | `/dashboard/finance/journal` | ✅ 完成 (借貸驗證) |
| 付款管理 | `/accounting/payments/` | `/dashboard/finance/payments` | ✅ 完成 |
| 聯絡人/客戶 | `/accounting/contacts/` | `/dashboard/finance/contacts` | ✅ 完成 |
| 貨幣管理 | `/accounting/currencies/` | `/dashboard/settings/currencies` | ✅ 完成 |
| 稅率管理 | `/accounting/tax-rates/` | `/dashboard/settings/tax-rates` | ✅ 完成 |
| 財年管理 | `/accounting/fiscal-years/` | `/dashboard/settings/fiscal-years` | ✅ 完成 |
| 會計期間 | `/accounting/periods/` | `/dashboard/settings/periods` | ✅ 完成 |
| 儀表板 | `/analytics/dashboards/` | `/dashboard/analytics` | ✅ 完成 |
| 圖表管理 | `/analytics/charts/` | `/dashboard/analytics/[dashboardId]` | ✅ 完成 |

### 🚧 待完善的功能

| 模組 | API 端點 | 建議 UI | 優先級 |
|------|----------|---------|--------|
| 收據 AI 掃描 | `/finance-assistant/analyze/` | 在費用頁面增加 AI 掃描功能 | 中 |
| HRMS 員工 | `/hrms/employees/` | `/dashboard/hrms/employees` | 高 |
| HRMS 部門 | `/departments/` | `/dashboard/hrms/departments` | 高 |
| HRMS 職稱 | `/designations/` | `/dashboard/hrms/designations` | 中 |
| HRMS 請假 | `/leave_applications/` | `/dashboard/hrms/leaves` | 中 |
| 專案管理 | `/projects/` | `/dashboard/projects` (需連接 API) | 中 |
| 任務管理 | `/tasks/` | `/dashboard/projects/tasks` | 中 |
| 看板 | `/boards/` | `/dashboard/kanban` (需連接 API) | 低 |
| 評論 | `/comments/` | 任務詳情頁內 | 低 |

### 📝 最近更新 (2024-12-05)
- ✅ 新增 `MultiFileUploader` 組件支援批量上傳
- ✅ 更新 Document Assistant 頁面支援多檔案上傳 (PDF, Excel, Word, Images, CSV, TXT)
- ✅ 確認所有財務模組頁面已完整實作
- ✅ 確認所有設定模組頁面已完整實作
- ✅ 確認分析儀表板系統已完整實作
- ✅ 新增 `export-utils.ts` 匯出工具庫 (PDF/Excel 生成)
- ✅ 發票列表新增 PDF 下載、Excel 匯出功能
- ✅ 財務報表頁面全面升級：
  - 資產負債表 (Balance Sheet) - PDF/Excel 匯出
  - 損益表 (Income Statement) - PDF/Excel 匯出
  - 試算表 (Trial Balance) - PDF/Excel 匯出
  - 應收帳款帳齡分析 (AR Aging Report) - PDF/Excel 匯出

---

## 🚨 緊急修復：AI 功能

### 後端 API 端點 (已有)
根據 Django URLconf，後端提供以下 API：

```
認證相關:
- api/v1/auth/token/           - JWT 登入
- api/v1/auth/token/refresh/   - Token 刷新
- api/v1/auth/google/          - Google OAuth URL
- api/v1/auth/google/callback/ - Google OAuth 回調
- api/v1/auth/google/token/    - Google OAuth Token

設定相關:
- api/v1/settings/api-keys/status/        - API Key 狀態
- api/v1/settings/api-keys/<provider>/    - 管理 API Key
- api/v1/settings/api-keys/<provider>/test/ - 測試 API Key

RAG 知識庫:
- api/v1/rag/query/      - RAG 查詢
- api/v1/rag/chat/       - RAG 聊天
- api/v1/rag/knowledge/  - 知識庫列表
```

### 前端 AI 功能修復清單

- [x] **AI Butler (智能管家)** - `src/components/ai-butler.tsx`
  - ✅ 已修改使用 `/api/v1/rag/chat/` 端點
  - ✅ 已移除前端 API route，直接調用後端

- [x] **Overview 分析功能** - `src/features/overview/components/analysis-dialog.tsx`
  - ✅ 已移除 `/api/analysis` 前端路由
  - ✅ 已改用 `/api/v1/rag/chat/` 端點
  - ✅ 失敗時使用本地 mock 報告作為 fallback

- [x] **Analyst Assistant** - `src/app/dashboard/analyst-assistant/`
  - ✅ 已修改 `services.ts` 使用 `/api/v1/analyst-assistant/query/`
  - ✅ 已修改 `page.tsx` 使用 `/api/v1/analyst-assistant/start/`

- [x] **Planner Assistant** - `src/app/dashboard/planner-assistant/`
  - ✅ 已使用 `aiApi.chatWithHistory()` 連接 `/api/v1/rag/chat/`

- [x] **Document Assistant** - `src/app/dashboard/document-assistant/`
  - ✅ 已使用 `aiApi.chatWithHistory()` 連接 `/api/v1/rag/chat/`
  - 使用 `/api/v1/document-assistant/query/`
  - 使用 `/api/v1/document-assistant/process/`

---

## 🔧 Phase 0: 後端 API 端點確認

### 需要確認的端點
請檢查後端 Django urls.py 確認以下端點是否存在：

- [ ] `/api/v1/ai-service/chat/` - AI 聊天
- [ ] `/api/v1/ai-service/chat-with-history/` - 帶歷史的 AI 聊天
- [ ] `/api/v1/ai-service/providers/` - AI 供應商列表
- [ ] `/api/v1/ai-service/models/` - AI 模型列表
- [ ] `/api/v1/analyst-assistant/query/` - 分析師查詢
- [ ] `/api/v1/analyst-assistant/start/` - 分析師啟動
- [ ] `/api/v1/planner-assistant/query/` - 規劃師查詢
- [ ] `/api/v1/planner-assistant/start/` - 規劃師啟動
- [ ] `/api/v1/document-assistant/query/` - 文件查詢
- [ ] `/api/v1/document-assistant/process/` - 文件處理
- [ ] `/api/v1/finance-assistant/analyze/` - 財務分析

### 已確認存在的端點 (從 Django 404 頁面)
- ✅ `/api/v1/auth/token/`
- ✅ `/api/v1/auth/token/refresh/`
- ✅ `/api/v1/auth/google/`
- ✅ `/api/v1/auth/google/callback/`
- ✅ `/api/v1/auth/google/token/`
- ✅ `/api/v1/settings/api-keys/status/`
- ✅ `/api/v1/settings/api-keys/<provider>/`
- ✅ `/api/v1/settings/api-keys/<provider>/test/`
- ✅ `/api/v1/rag/query/`
- ✅ `/api/v1/rag/chat/`
- ✅ `/api/v1/rag/knowledge/`

---

## 🔐 Phase 1: 安全性與環境配置

### 環境設置
- [ ] 更新 `.env.local` 檔案
- [ ] 建立 `.env.local.example` 作為範例
- [ ] 確保 `.gitignore` 包含所有敏感檔案

### 認證系統
- [x] 整合 Google OAuth 2.0 登入按鈕
- [x] 實現 OAuth callback 處理
- [x] 更新 Auth Context 支援 Google 登入
- [x] 實現 token 自動刷新
- [ ] 添加登出功能

---

## 🔗 Phase 2: API 端點整合

### 認證相關
- [x] `/api/v1/auth/token/` - JWT 登入
- [ ] `/api/v1/auth/google/` - Google OAuth
- [ ] `/api/v1/auth/token/refresh/` - Token 刷新
- [x] `/api/v1/users/me/` - 當前用戶資訊

### RAG 知識庫 (新增)
- [x] 前端整合 `/api/v1/rag/query/` - 知識庫查詢
- [x] 前端整合 `/api/v1/rag/chat/` - RAG 增強聊天
- [x] 前端整合 `/api/v1/rag/knowledge/` - 知識庫列表
- [x] 建立知識庫管理頁面 (`/dashboard/settings/knowledge-base`)

### 設定頁面
- [x] API Key 管理頁面 (已有後端支援)
  - [x] 顯示 API Key 狀態
  - [x] 新增/更新 API Key
  - [x] 測試 API Key

### Users 模組
- [ ] `/api/v1/users/` - 用戶列表
- [ ] `/api/v1/users/{id}/` - 用戶詳情
- [ ] 建立用戶管理頁面

### HRMS 模組
- [ ] `/api/v1/departments/` - 部門管理 (替換 Mock 數據)
- [ ] `/api/v1/designations/` - 職位管理
- [ ] `/api/v1/projects/` - 專案管理 (替換 Mock 數據)
- [ ] `/api/v1/tasks/` - 任務管理 (替換 Mock 數據)
- [ ] `/api/v1/leave_applications/` - 請假管理 (替換 Mock 數據)
- [ ] `/api/v1/attendance/` - 出勤管理
- [ ] `/api/v1/payroll/` - 薪資管理

### Documents 模組
- [ ] `/api/v1/documents/` - 文件 CRUD (替換 Mock 數據)
- [ ] `/api/v1/document-assistant/upload/` - 文件上傳
- [ ] `/api/v1/document-assistant/{id}/info/` - 文件資訊
- [ ] `/api/v1/document-assistant/query/` - 文件查詢
- [x] `/api/v1/document-assistant/process/` - 文件處理

### Analytics 模組
- [x] `/api/v1/analyst-assistant/start/` - 啟動分析
- [x] `/api/v1/analyst-assistant/query/` - 分析查詢
- [ ] `/api/v1/dashboards/` - 儀表板 CRUD (替換 Mock 數據)
- [ ] `/api/v1/charts/` - 圖表 CRUD (替換 Mock 數據)

### AI Assistants
- [ ] `/api/v1/planner-assistant/start/` - 規劃助理啟動
- [ ] `/api/v1/planner-assistant/query/` - 規劃查詢
- [x] `/api/v1/finance-assistant/analyze/` - 收據分析

### Coredata
- [x] `/api/v1/currency-list/` - 貨幣列表
- [x] `/api/v1/country-list/` - 國家列表

---

## 💰 Phase 3: 會計系統 UI

### 會計儀表板
- [x] 會計首頁概覽
- [x] 關鍵財務指標卡片
- [x] 收入/支出趨勢圖

### 會計科目管理
- [x] 會計科目表 (Chart of Accounts) 頁面
- [x] 科目新增/編輯表單
- [x] 科目層級樹狀顯示

### 日記帳
- [x] 日記帳分錄列表
- [x] 新增分錄表單 (借貸平衡驗證)
- [x] 分錄搜尋與篩選

### 發票管理
- [x] 發票列表頁面
- [x] 發票建立表單
- [ ] 發票預覽與列印
- [ ] 發票 PDF 生成

### 付款與費用
- [x] 付款記錄頁面
- [x] 費用報銷頁面
- [ ] 費用審批流程

### 聯絡人/客戶管理
- [x] 聯絡人列表頁面
- [x] 客戶/供應商管理
- [x] 信用額度管理

### 設定管理
- [x] 貨幣管理頁面
- [x] 稅率管理頁面
- [x] 財年管理頁面
- [x] 會計期間管理頁面

### 報表中心
- [x] 資產負債表頁面
- [x] 損益表頁面
- [ ] 現金流量表頁面
- [x] 試算表頁面
- [ ] 報表匯出 (PDF/Excel)

### AI 會計助理
- [x] 智能記帳建議 (Document Assistant)
- [ ] 異常交易提醒
- [ ] 財務分析對話

---

## 🎨 Phase 4: UI/UX 改進

### 現有頁面優化
- [ ] Dashboard Overview 連接真實數據
- [ ] HRMS 員工列表連接 API
- [ ] Finance 頁面連接 API
- [ ] Projects 頁面連接 API

### 新增功能頁面
- [ ] Email Assistant (建立後端 API)
- [ ] Brainstorming Assistant (建立後端 API)
- [ ] Calendar 日曆功能

### 通用組件
- [ ] API Service 統一管理類
- [ ] Loading 狀態處理
- [ ] Error 錯誤處理
- [ ] Toast 通知優化

---

## 📱 Phase 5: 響應式與效能

### 響應式設計
- [ ] 移動端適配
- [ ] 平板適配
- [ ] 桌面端優化

### 效能優化
- [ ] 圖片優化
- [ ] 代碼分割
- [ ] 快取策略
- [ ] SSR/SSG 優化

---

## 🧪 Phase 6: 測試

### 單元測試
- [ ] 組件測試
- [ ] Hook 測試
- [ ] Utility 函數測試

### E2E 測試
- [ ] 登入流程測試
- [ ] CRUD 操作測試
- [ ] 報表生成測試

---

## 🚀 優先順序

1. **最高** - 環境配置與認證 (Phase 1)
2. **高** - API 端點整合 (Phase 2)
3. **高** - 會計系統 UI (Phase 3)
4. **中** - UI/UX 改進 (Phase 4)
5. **低** - 響應式與效能 (Phase 5)
6. **低** - 測試 (Phase 6)

---

## 🔧 API 服務配置

建立統一的 API 服務文件 `src/lib/api.ts`:

```typescript
// 建議的 API 服務結構
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = {
  auth: {
    login: (data) => fetch(`${API_BASE_URL}/api/v1/auth/token/`, ...),
    googleLogin: () => ...,
    refresh: () => ...,
  },
  users: {
    me: () => ...,
    list: () => ...,
    get: (id) => ...,
  },
  // ... 其他模組
};
```

---

## 📝 備註

- 所有 API 調用應使用環境變數 `NEXT_PUBLIC_API_BASE_URL`
- Mock 數據應逐步替換為真實 API 數據
- 保持組件的可重用性
- 使用 TypeScript 嚴格類型檢查

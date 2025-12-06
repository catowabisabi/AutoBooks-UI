# 📋 Wisematic ERP Frontend - TODO List

## 🎯 項目概覽
前端 Next.js 開發任務清單，連接 Django 後端 (http://127.0.0.1:8000)

---

## 🚀 最新更新 (2024-12-06) - AI 增強 & 多地區會計

### ✅ 已完成的新功能

#### 1. 多地區會計格式支援
- 📁 `src/config/accounting-regional-formats.ts` - 地區配置
  - 🇨🇦 加拿大 (GAAP + CRA)
  - 🇭🇰 香港 (HKFRS + IRD)
  - 🇨🇳 中國大陸 (CAS + 國稅)
  - 🇮🇳 印度 (Ind AS + IT Act)
  - 自動貨幣格式化、會計期間、稅率計算

#### 2. 會計種子數據生成器
- 📁 `src/config/accounting-seed-data.ts`
  - 自動生成測試用會計數據
  - 支援各地區會計科目表 (COA)
  - 生成發票、交易、聯絡人等假數據

#### 3. RAG 法規知識庫
- 📁 `src/config/accounting-rag-regulations.ts`
  - 各地區會計法規存儲
  - 支援 AI 查詢法規條文
  - 稅務合規指引

#### 4. 通用 AI 服務層
- 📁 `src/lib/ai-services.ts`
  - Finance AI: 現金流預測、異常檢測、付款預測
  - HRMS AI: 離職風險、薪酬分析、技能差距
  - Projects AI: 瓶頸檢測、資源分配、風險評估
  - Kanban AI: 智能優先排序、估時、工作量平衡

#### 5. React 會計 Hook
- 📁 `src/hooks/use-accounting.ts`
  - `useAccounting(region)` 統一訪問會計功能
  - 自動載入地區配置、格式化器、法規

#### 6. AI 增強 UI 組件
- 📁 `src/components/ai/finance-ai-cards.tsx`
  - `CashFlowAnalysisCard` - 現金流 AI 分析
  - `AnomalyDetectionCard` - 異常交易檢測
  - `PaymentPredictionCard` - 付款預測
  - `FinanceInsightsSummary` - 財務洞察摘要

- 📁 `src/components/ai/dashboard-ai-cards.tsx`
  - `AttritionRiskCard` - 員工離職風險 (HRMS)
  - `ProjectBottleneckCard` - 項目瓶頸檢測
  - `KanbanSmartPrioritization` - 看板智能排序
  - `UniversalAIInsightCard` - 通用 AI 洞察卡片

#### 7. 會計配置導出
- 📁 `src/config/accounting-index.ts`
  - 統一導出所有會計配置
  - 方便其他模組引用

---

## 📊 工具 API 狀態完整報告 (2024-12-06 更新)

### ✅ 有真實 API 的工具 (12個)
| 工具 | API 端點 | 狀態 |
|------|----------|------|
| Finance - Invoices | `/accounting/invoices/` | ✅ 完整 |
| Finance - Expenses | `/accounting/expenses/` | ✅ 完整 |
| Finance - Reports | `/accounting/reports/*` | ✅ 完整 |
| Finance - Journal | `/accounting/journal-entries/` | ✅ 完整 |
| Finance - Contacts | `/accounting/contacts/` | ✅ 完整 |
| Finance - Payments | `/accounting/payments/` | ✅ 完整 |
| Finance - Accounts | `/accounting/accounts/` | ✅ 完整 |
| Documents | `/documents/` | ✅ 完整 |
| Analyst Assistant | `/analyst-assistant/*` | ✅ 完整 |
| Planner Assistant | `/planner-assistant/*` | ✅ 完整 |
| Document Assistant | `/document-assistant/*` | ✅ 完整 |
| Analytics | `/analytics/*` | ✅ 完整 |

### ⚠️ Mock 數據/localStorage (需要 API)
| 工具 | 當前狀態 | 建議 |
|------|----------|------|
| Email | ✅ 已連接 API | 使用 `useEmailAccounts`, `useSendEmail` hooks |
| Calendar | 佔位符 | 需完整實現 |
| Kanban | ✅ localStorage + AI | 已添加 AI 助手面板 |
| Product Catalog | localStorage | 需產品 API |
| Business CRM | localStorage | 需 CRM API |

### 🤖 AI 增強狀態 (2024-12-06 更新)
| 工具 | AI 功能 | 組件 | 狀態 |
|------|---------|------|------|
| Finance | 現金流/異常/付款預測/合規 | `finance-ai-cards.tsx` | ✅ 已整合到頁面 |
| HRMS | 離職風險/瓶頸檢測 | `dashboard-ai-cards.tsx` | ✅ 已整合到頁面 |
| Projects | 瓶頸/任務優先級 | `dashboard-ai-cards.tsx` | ✅ 已整合到頁面 |
| Kanban | 智能排序/分析 | `kanban-ai-assistant.tsx` | ✅ 已整合到頁面 |
| Planner | AI Brainstorm/分析 | 原生支援 | ✅ |
| Analyst | 數據分析查詢 | 原生支援 | ✅ |

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

### 📝 最近更新 (2024-12-06)
- ✅ **AI 卡片整合到所有主要頁面**
  - Finance: `AICashFlowAnalysis`, `AIAnomalyDetection`, `AIPaymentPrediction`, `AIComplianceAlerts`
  - HRMS: `AIAttritionRisk`, `AIBottleneckDetection`
  - Projects: `AIBottleneckDetection`, `AITaskPrioritization`
  - Kanban: `KanbanAIAssistant` (獨立側邊面板)
- ✅ **Email 系統升級**
  - 移除 `mockAccounts`，使用真實 API hooks
  - `compose-email.tsx`: 使用 `useEmailAccounts`, `useSendEmail`
  - `email-client.tsx`: 使用 `useEmails`, `useMarkEmailRead`, `useArchiveEmail`, `useDeleteEmail`
  - `email-assistant-client.tsx`: 已連接 API
- ✅ 新增 `useArchiveEmail` hook
- ✅ Kanban 添加 AI 助手按鈕 (`kanban-ai-assistant.tsx`)

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
- [x] 報表匯出 (PDF/Excel)

### AI 會計助理
- [x] 智能記帳建議 (Document Assistant)
- [x] 異常交易提醒 (`AnomalyDetectionCard`)
- [x] 財務分析對話 (`FinanceInsightsSummary`)
- [x] 現金流預測 (`CashFlowAnalysisCard`)
- [x] 付款預測 (`PaymentPredictionCard`)

---

## 🔜 下一步工作計劃

### 高優先級 (下週)
1. **整合 AI 組件到實際頁面**
   - [ ] 在 Finance 頁面添加 AI 卡片
   - [ ] 在 HRMS 頁面添加離職風險卡片
   - [ ] 在 Projects 頁面添加瓶頸檢測
   - [ ] 在 Kanban 頁面添加智能排序

2. **Email 系統升級**
   - [ ] 移除 mockAccounts，使用真實 API
   - [ ] 實現 AI 郵件撰寫助手
   - [ ] 實現 AI 郵件分類
   - [ ] 實現 AI 郵件摘要

3. **Calendar 完整實現**
   - [ ] 日曆視圖 (日/週/月)
   - [ ] 事件 CRUD
   - [ ] 與 Email 整合

### 中優先級 (兩週內)
4. **後端 API 連接**
   - [ ] HRMS Employees API
   - [ ] Kanban Boards API
   - [ ] Product Catalog API
   - [ ] Business CRM API

5. **種子數據 UI**
   - [ ] 添加 "生成測試數據" 按鈕
   - [ ] 連接 `AccountingSeedData` 到 API

### 低優先級 (月內)
6. **i18n 完善**
   - [ ] 會計術語多語言
   - [ ] 地區特定格式
   - [ ] 法規文檔翻譯

---

## 📁 新增文件清單

```
src/config/
├── accounting-regional-formats.ts  # 🆕 多地區會計配置
├── accounting-seed-data.ts         # 🆕 種子數據生成器
├── accounting-rag-regulations.ts   # 🆕 法規知識庫
└── accounting-index.ts             # 🆕 統一導出

src/lib/
└── ai-services.ts                  # 🆕 通用 AI 服務層

src/hooks/
└── use-accounting.ts               # 🆕 會計 React Hook

src/components/ai/
├── finance-ai-cards.tsx            # 🆕 財務 AI 卡片
└── dashboard-ai-cards.tsx          # 🆕 儀表板 AI 卡片
```

---

## 🔧 使用方式

### 使用會計地區配置
```tsx
import { useAccounting } from '@/hooks/use-accounting';

function MyComponent() {
  const { config, formatCurrency, formatDate, regulations, aiServices } = useAccounting('HK');
  
  // 格式化貨幣
  const formatted = formatCurrency(1234.56); // "HK$1,234.56"
  
  // 獲取法規
  const taxRules = regulations.filter(r => r.category === 'taxation');
  
  // 使用 AI
  const insights = await aiServices.analyze(data);
}
```

### 使用 AI 服務
```tsx
import { aiServices } from '@/lib/ai-services';

// 財務 AI
const cashflow = await aiServices.finance.predictCashFlow(transactions);
const anomalies = await aiServices.finance.detectAnomalies(transactions);

// HRMS AI
const risks = await aiServices.hrms.predictAttritionRisk(employees);

// 項目 AI
const bottlenecks = await aiServices.projects.identifyBottlenecks(project);

// Kanban AI
const prioritized = await aiServices.kanban.smartPrioritize(tasks);
```

### 使用 AI 卡片組件
```tsx
import { CashFlowAnalysisCard, AnomalyDetectionCard } from '@/components/ai/finance-ai-cards';
import { AttritionRiskCard, KanbanSmartPrioritization } from '@/components/ai/dashboard-ai-cards';

// 在財務頁面
<CashFlowAnalysisCard transactions={transactions} />
<AnomalyDetectionCard transactions={transactions} />

// 在 HRMS 頁面
<AttritionRiskCard employees={employees} />

// 在看板頁面
<KanbanSmartPrioritization tasks={tasks} onReorder={handleReorder} />
```

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

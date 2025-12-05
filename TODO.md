# 📋 Wisematic ERP Frontend - TODO List

## 🎯 項目概覽
前端 Next.js 開發任務清單

---

## 🔐 Phase 1: 安全性與環境配置

### 環境設置
- [ ] 更新 `.env.local` 檔案
- [ ] 建立 `.env.local.example` 作為範例
- [ ] 確保 `.gitignore` 包含所有敏感檔案

### 認證系統
- [ ] 整合 Google OAuth 2.0 登入按鈕
- [ ] 實現 OAuth callback 處理
- [ ] 更新 Auth Context 支援 Google 登入
- [ ] 實現 token 自動刷新
- [ ] 添加登出功能

---

## 🔗 Phase 2: API 端點整合

### 認證相關
- [x] `/api/v1/auth/token/` - JWT 登入
- [ ] `/api/v1/auth/google/` - Google OAuth
- [ ] `/api/v1/auth/token/refresh/` - Token 刷新
- [x] `/api/v1/users/me/` - 當前用戶資訊

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
- [ ] 會計首頁概覽
- [ ] 關鍵財務指標卡片
- [ ] 收入/支出趨勢圖

### 會計科目管理
- [ ] 會計科目表 (Chart of Accounts) 頁面
- [ ] 科目新增/編輯表單
- [ ] 科目層級樹狀顯示

### 日記帳
- [ ] 日記帳分錄列表
- [ ] 新增分錄表單 (借貸平衡驗證)
- [ ] 分錄搜尋與篩選

### 發票管理
- [ ] 發票列表頁面
- [ ] 發票建立表單
- [ ] 發票預覽與列印
- [ ] 發票 PDF 生成

### 付款與費用
- [ ] 付款記錄頁面
- [ ] 費用報銷頁面
- [ ] 費用審批流程

### 報表中心
- [ ] 資產負債表頁面
- [ ] 損益表頁面
- [ ] 現金流量表頁面
- [ ] 試算表頁面
- [ ] 報表匯出 (PDF/Excel)

### AI 會計助理
- [ ] 智能記帳建議
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

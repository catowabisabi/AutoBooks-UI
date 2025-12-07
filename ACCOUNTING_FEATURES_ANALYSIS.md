# Accounting Features Analysis / 會計功能分析

## Overview / 概覽

This document provides a comprehensive analysis of accounting-related features in the Wisematic ERP system.

---

## 📊 Feature Summary Table

| Category | Working ✅ | Partial ⚠️ | Placeholder ❌ |
|----------|-----------|------------|----------------|
| Data Entry | 2 | 3 | 1 |
| Document Processing | 3 | 2 | 0 |
| Reporting | 1 | 3 | 0 |
| Approval Workflows | 1 | 1 | 0 |
| AI Assistant | 2 | 2 | 0 |

---

## 1. DATA ENTRY FEATURES / 資料輸入功能

### 1.1 Invoice Management / 發票管理
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Invoice List View / 發票列表 | ⚠️ Partial | Yes | Yes |
| Create New Invoice / 新增發票 | ⚠️ Partial | Partial | Yes |
| Edit Invoice / 編輯發票 | ❌ Placeholder | No | No |
| Invoice PDF Download / 發票PDF下載 | ✅ Working | Yes | Yes |
| Invoice Excel Export / 發票Excel匯出 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/finance/invoices/`
- **API Endpoints:** `/api/v1/accounting/invoices/` (CRUD operations)
- **Components:** `InvoiceList`, `NewInvoicePage`
- **Notes:** 
  - List view has real API integration with demo data fallback
  - Create form has UI but `TODO: Implement API call` comment found
  - PDF/Excel export working via `downloadInvoicePdf()` and `exportInvoicesToExcel()`

---

### 1.2 Expense Management / 費用管理
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Expense List View / 費用列表 | ❌ Placeholder | No | No |
| Create New Expense / 新增費用 | ⚠️ Partial | Partial | No |
| Expense Receipt Scanning / 收據掃描 | ⚠️ Partial | Yes | No |
| Expense Approval / 費用審批 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/finance/expenses/`
- **API Endpoints:** `/api/v1/accounting/expenses/` (CRUD), `/api/v1/finance-assistant/analyze/` (OCR)
- **Components:** `ExpenseList`, `ExpenseForm`
- **Notes:**
  - Expense list uses **hardcoded mock data** (not API connected)
  - New expense form has OCR scanning integration with backend
  - Demo data includes categories: Office Supplies, Travel, Software, Rent, etc.

---

### 1.3 Journal Entries / 日記帳分錄
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Journal Entry List / 分錄列表 | ✅ Working | Yes | Partial |
| Create Journal Entry / 新增分錄 | ✅ Working | Yes | Partial |
| View Entry Detail / 檢視分錄詳情 | ✅ Working | Yes | Partial |
| Post Entry / 過帳 | ✅ Working | Yes | Partial |
| Void Entry / 作廢分錄 | ✅ Working | Yes | Partial |
| Debit/Credit Balance Validation / 借貸平衡驗證 | ✅ Working | Client | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/journal/`
- **API Endpoints:** 
  - `GET/POST /api/v1/accounting/journal-entries/`
  - `POST /api/v1/accounting/journal-entries/{id}/post/`
  - `POST /api/v1/accounting/journal-entries/{id}/void/`
- **Notes:**
  - Fully functional with real API integration
  - Has demo data fallback (`getDemoEntries()`, `getDemoAccounts()`)
  - Real-time debit/credit balance validation
  - i18n: Uses inline bilingual text (English / 中文) rather than translation keys

---

### 1.4 Chart of Accounts / 會計科目
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Account Tree View / 科目樹狀圖 | ✅ Working | Yes | Yes |
| Account List View / 科目列表 | ✅ Working | Yes | Yes |
| Create Account / 新增科目 | ⚠️ Partial | Yes | Partial |
| Edit Account / 編輯科目 | ⚠️ Partial | Yes | Partial |
| Account Balance Display / 科目餘額顯示 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/finance/accounts/`
- **API Endpoints:** 
  - `/api/v1/accounting/accounts/`
  - `/api/v1/accounting/accounts/chart_of_accounts/`
- **Notes:**
  - Comprehensive demo data structure with nested accounts
  - Tree and list view modes available
  - Uses `useTranslation()` hook with keys like `chartOfAccounts.types.asset`

---

### 1.5 Contacts Management / 聯絡人管理
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Contact List / 聯絡人列表 | ✅ Working | Yes | Partial |
| Create Contact / 新增聯絡人 | ✅ Working | Yes | Partial |
| Edit Contact / 編輯聯絡人 | ✅ Working | Yes | Partial |
| Customer/Vendor Filter / 客戶供應商篩選 | ✅ Working | Yes | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/contacts/`
- **API Endpoints:** `/api/v1/accounting/contacts/`
- **Notes:**
  - Full CRUD operations with API
  - Contact types: CUSTOMER, VENDOR, BOTH
  - Demo data fallback available

---

### 1.6 Payments Management / 收付款管理
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Payment List / 收付款列表 | ✅ Working | Yes | Partial |
| Record Payment / 記錄收付款 | ✅ Working | Yes | Partial |
| Payment Filters / 收付款篩選 | ✅ Working | Yes | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/payments/`
- **API Endpoints:** `/api/v1/accounting/payments/`
- **Notes:**
  - Supports RECEIVED and MADE payment types
  - Payment methods: CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, OTHER
  - Demo data fallback available

---

## 2. DOCUMENT PROCESSING FEATURES / 文件處理功能

### 2.1 Receipt Upload & OCR / 收據上傳與OCR
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Single Receipt Upload / 單據上傳 | ✅ Working | Yes | Yes |
| Batch Receipt Upload / 批量上傳 | ✅ Working | Yes | Yes |
| AI OCR Analysis / AI光學字元辨識 | ✅ Working | Yes | Yes |
| Auto-categorization / 自動分類 | ✅ Working | Yes | Yes |
| Multi-language Detection / 多語言偵測 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/accounting-assistant/`
- **API Endpoints:** 
  - `POST /api/v1/accounting-assistant/upload/`
  - Batch upload via loop with `uploadReceipt()`
- **Services:** `uploadReceipt()`, `uploadReceiptsBatch()`
- **Notes:**
  - Supports auto_categorize and auto_journal flags
  - Returns ai_confidence_score, ai_suggestions, ai_warnings
  - Detected language field available

---

### 2.2 Document Classification / 文件分類
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| AI Document Type Detection / AI文件類型偵測 | ✅ Working | Yes | Yes |
| Manual Reclassification / 手動重新分類 | ✅ Working | Yes | Yes |
| Unrecognized Documents Page / 未識別文件頁面 | ⚠️ Partial | Yes | Yes |
| Batch Reclassification / 批量重新分類 | ⚠️ Partial | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/accounting-workspace/unrecognized/`
- **API Endpoints:** Via hooks `useReclassifyReceipt()`, `useBatchReclassify()`
- **Document Types:** 
  - sales_invoice, purchase_invoice, receipt, bank_statement
  - expense_claim, contract, payroll, tax_document
  - OFFICE_SUPPLIES, TRANSPORTATION, MEALS, ACCOMMODATION, etc.
- **Notes:**
  - Uses mock data fallback when API unavailable
  - Confidence score display (0-1 scale)

---

### 2.3 Data Extraction / 資料擷取
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Vendor Name Extraction / 供應商名稱擷取 | ✅ Working | Yes | Yes |
| Date Extraction / 日期擷取 | ✅ Working | Yes | Yes |
| Amount Extraction / 金額擷取 | ✅ Working | Yes | Yes |
| Line Items Extraction / 項目明細擷取 | ✅ Working | Yes | Yes |
| Tax Amount Extraction / 稅額擷取 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** Accounting Assistant services
- **Extracted Fields:**
  - vendor_name, vendor_address, vendor_phone, vendor_tax_id
  - receipt_number, receipt_date, receipt_time
  - currency, subtotal, tax_amount, tax_rate, discount_amount, total_amount
  - payment_method, items (array with description, quantity, unit_price, amount)

---

## 3. REPORTING FEATURES / 報表功能

### 3.1 Financial Reports / 財務報表
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Trial Balance / 試算表 | ⚠️ Partial | Yes | Yes (中文) |
| Balance Sheet / 資產負債表 | ⚠️ Partial | Yes | Yes (中文) |
| Income Statement / 損益表 | ⚠️ Partial | Yes | Yes (中文) |
| A/R Aging Report / 應收帳款帳齡 | ⚠️ Partial | Yes | Yes (中文) |

**Details:**
- **Location:** `/src/app/dashboard/finance/reports/`
- **API Endpoints:**
  - `getTrialBalance()` → `/api/v1/accounting/trial-balance/`
  - `getBalanceSheet()` → `/api/v1/accounting/balance-sheet/`
  - `getIncomeStatement()` → `/api/v1/accounting/income-statement/`
  - `getARAgingReport()` → `/api/v1/accounting/ar-aging/`
- **Notes:**
  - All reports have demo data fallback (DEMO_BALANCE_SHEET, etc.)
  - PDF and Excel export working via `downloadReportPDF()`, `exportReportToExcel()`
  - Period selector (Q1-Q4, Full Year)
  - UI displays primarily in Chinese with some English labels

---

### 3.2 Report Export / 報表匯出
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| PDF Export / PDF匯出 | ✅ Working | Client-side | Yes |
| Excel Export / Excel匯出 | ✅ Working | Client-side | Yes |
| Period Selection / 期間選擇 | ✅ Working | Client-side | Yes |

**Details:**
- Uses `@/lib/export-utils` for client-side generation
- Functions: `downloadReportPDF()`, `exportReportToExcel()`

---

## 4. APPROVAL WORKFLOWS / 審批流程

### 4.1 Expense Approval / 費用審批
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Pending Expense List / 待審費用列表 | ✅ Working | Yes | Partial |
| Approve Expense / 核准費用 | ✅ Working | Yes | Partial |
| Reject Expense / 駁回費用 | ✅ Working | Yes | Partial |
| Rejection Reason / 駁回原因 | ✅ Working | Yes | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/approvals/`
- **API Endpoints:**
  - `POST /api/v1/accounting-assistant/receipts/{id}/approve/`
  - (Reject uses similar endpoint)
- **Notes:**
  - Demo data fallback (DEMO_PENDING_EXPENSES)
  - Toast notifications for actions

---

### 4.2 Invoice Approval / 發票審批
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Draft Invoice List / 草稿發票列表 | ⚠️ Partial | Yes | Partial |
| Approve Invoice / 核准發票 | ⚠️ Partial | Demo | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/approvals/`
- **Notes:**
  - Lists DRAFT status invoices
  - Demo mode removes from list on approval

---

## 5. AI ASSISTANT FEATURES / AI助手功能

### 5.1 Accounting Assistant / 會計助手
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Receipt Upload Tab / 收據上傳標籤 | ✅ Working | Yes | Yes |
| Receipt List Tab / 收據列表標籤 | ✅ Working | Yes | Yes |
| Excel Comparison / Excel比對 | ✅ Working | Yes | Yes |
| Report Generation / 報表生成 | ✅ Working | Yes | Yes |
| AI Chat / AI聊天 | ✅ Working | Yes | Yes |
| Statistics Dashboard / 統計儀表板 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/accounting-assistant/`
- **API Endpoints:**
  - `POST /api/v1/accounting-assistant/ai-query/` - AI Q&A
  - `POST /api/v1/accounting-assistant/compare/` - Excel comparison
  - `POST /api/v1/accounting-assistant/reports/create/` - Report generation
  - `GET /api/v1/accounting-assistant/stats/` - Statistics
- **Notes:**
  - Multi-language response (en/zh)
  - Expense categories with i18n keys
  - Status badges with i18n keys

---

### 5.2 Journal Entry Generation / 分錄生成
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Auto Journal from Receipt / 從收據自動生成分錄 | ✅ Working | Yes | Yes |
| AI Review / AI審核 | ✅ Working | Yes | Yes |

**Details:**
- **API Endpoints:**
  - `POST /api/v1/accounting-assistant/receipts/{id}/create-journal/`
  - `POST /api/v1/accounting-assistant/receipts/{id}/ai-review/`

---

## 6. ACCOUNTING WORKSPACE / 會計工作區

### 6.1 Project Management / 專案管理
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Project List (Grid/List View) / 專案列表 | ✅ Working | Yes | Yes |
| Create Project / 新增專案 | ✅ Working | Yes | Yes |
| Delete Project / 刪除專案 | ✅ Working | Yes | Yes |
| Project Filters / 專案篩選 | ✅ Working | Client | Yes |
| Project Detail Page / 專案詳情頁 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/accounting-workspace/`
- **API via hooks:** `useProjects()`, `useCreateProject()`, `useDeleteProject()`
- **Project Types:** bookkeeping, audit_prep, tax_filing, custom
- **Project Status:** draft, in_progress, review_pending, completed, archived

---

### 6.2 Document Upload in Project / 專案文件上傳
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Drag & Drop Upload / 拖放上傳 | ✅ Working | Yes | Yes |
| Document List / 文件列表 | ✅ Working | Yes | Yes |
| Document Preview / 文件預覽 | ✅ Working | Yes | Yes |
| AI Classification / AI分類 | ✅ Working | Yes | Yes |
| Bulk Upload / 批量上傳 | ✅ Working | Yes | Yes |

**Details:**
- **Location:** `/src/app/dashboard/accounting-workspace/[projectId]/`
- **Uses:** react-dropzone for drag & drop
- **API:** `useUploadDocuments()`, `useDocuments()`

---

## 7. GENERAL LEDGER / 總帳

### 7.1 Ledger View / 帳本檢視
| Feature | Status | API | i18n |
|---------|--------|-----|------|
| Account Tree Navigation / 科目樹導航 | ✅ Working | Yes | Partial |
| Account Transaction History / 科目交易歷史 | ⚠️ Partial | Yes | Partial |
| Account Balance / 科目餘額 | ✅ Working | Yes | Partial |

**Details:**
- **Location:** `/src/app/dashboard/finance/ledgers/`
- **API:** `getChartOfAccounts()`, `getAccounts()`, `getJournalEntries()`

---

## 8. i18n STATUS / 國際化狀態

### Translation Coverage Summary
| Module | en.json | zh-TW.json | Inline Bilingual |
|--------|---------|------------|------------------|
| Chart of Accounts | ✅ | ✅ | ✅ |
| Journal Entries | ✅ | ✅ | ✅ |
| Invoices | ✅ | ✅ | Partial |
| Expenses | ❌ | ❌ | Partial |
| Reports | ❌ | ✅ | ✅ |
| Approvals | ❌ | ❌ | Partial |
| Accounting Assistant | ✅ | ✅ | ✅ |
| Accounting Workspace | ✅ | ✅ | ✅ |

**Notes:**
- Many pages use inline bilingual text: "English / 中文" format
- Translation files exist at `/src/locales/en.json` and `/src/locales/zh-TW.json`
- Accounting-related keys exist under `accounting`, `accountingAssistant` namespaces
- Some expense/report pages have limited i18n implementation

---

## 9. API INTEGRATION SUMMARY

### Backend Endpoints Used
```
/api/v1/accounting/accounts/
/api/v1/accounting/accounts/chart_of_accounts/
/api/v1/accounting/journal-entries/
/api/v1/accounting/journal-entries/{id}/post/
/api/v1/accounting/journal-entries/{id}/void/
/api/v1/accounting/contacts/
/api/v1/accounting/payments/
/api/v1/accounting/invoices/
/api/v1/accounting/invoices/{id}/pdf/
/api/v1/accounting/expenses/
/api/v1/accounting/currencies/
/api/v1/accounting/tax-rates/
/api/v1/accounting/fiscal-years/
/api/v1/accounting/periods/
/api/v1/accounting/trial-balance/
/api/v1/accounting/balance-sheet/
/api/v1/accounting/income-statement/
/api/v1/accounting/ar-aging/
/api/v1/accounting-assistant/upload/
/api/v1/accounting-assistant/receipts/
/api/v1/accounting-assistant/receipts/{id}/approve/
/api/v1/accounting-assistant/receipts/{id}/create-journal/
/api/v1/accounting-assistant/receipts/{id}/ai-review/
/api/v1/accounting-assistant/compare/
/api/v1/accounting-assistant/reports/
/api/v1/accounting-assistant/reports/create/
/api/v1/accounting-assistant/ai-query/
/api/v1/accounting-assistant/stats/
/api/v1/accounting-projects/
/api/v1/accounting-projects/{id}/
/api/v1/accounting-projects/{id}/stats/
/api/v1/accounting-projects/{id}/receipts/
/api/v1/accounting-projects/{id}/bulk-upload/
```

---

## 10. RECOMMENDATIONS / 建議

### High Priority
1. **Expense List** - Connect to real API instead of mock data
2. **Invoice Create** - Implement API call for creating invoices
3. **i18n Expenses** - Add translation keys for expense module

### Medium Priority
1. **Report API Integration** - Currently falls back to demo data too easily
2. **Invoice Edit** - Implement edit functionality
3. **i18n Consistency** - Replace inline bilingual text with proper translation keys

### Low Priority
1. **Approval History** - Add audit trail for approval actions
2. **Bulk Operations** - Enhance bulk approval/rejection workflows
3. **Export Customization** - Allow custom report templates

---

*Generated: December 7, 2025*
*Analysis covers: wisematic-erp-ui-main frontend codebase*

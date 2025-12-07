# Analyst Assistant 改進 TODO 清單

## 🔴 高優先級 - 安全與穩定性

### 後端 (Django API)

#### 1. 身份驗證與授權 ✅ 已完成
- [x] 為所有 Analyst API 端點添加 `IsAuthenticated` 權限
- [x] 實現 API 速率限制（Rate Limiting）
  - [x] 使用 Django REST Framework 的 throttling
  - [x] 為 AI 請求設置每分鐘/每小時限額
- [x] 統一錯誤訊息格式，隱藏內部細節
  ```python
  # 已實現 in analyst_viewset.py
  class AnalystRateThrottle(UserRateThrottle):
      rate = '30/minute'
  
  class AnonAnalystThrottle(AnonRateThrottle):
      rate = '10/minute'
  ```

#### 2. 代碼執行安全 (Critical) ✅ 已完成
- [x] **移除或限制 `eval()` 和 `exec()` 的使用**
  - 已創建 `safe_exec.py` 模組
  - 使用 AST 驗證白名單方法
- [x] 實現安全的查詢構建器
  ```python
  # 已實現 in safe_exec.py
  ALLOWED_ATTRS = {
      'groupby', 'sum', 'mean', 'count', 'head', 'tail',
      'sort_values', 'reset_index', 'to_dict', ...
  }
  
  def safe_eval(code_str, df):
      validate_code(code_str)  # AST 驗證
      ...
  ```
- [x] 添加代碼執行超時機制 (30秒)
- [x] 實現資源限制（受限的 builtins）

#### 3. 多租戶與資源控制 ✅ 已完成
- [x] 為 `dataframe_cache` 添加租戶隔離
  ```python
  # 已實現 in tenant_cache.py
  class TenantCache:
      def get(self, user_id, key):
          cache_key = f"user_{user_id}_{key}"
          ...
  ```
- [x] 設置 cache TTL（生存時間）- 預設 1 小時
- [x] 設置最大 cache 大小 - 預設 100 項
- [x] 添加 cache 清理機制 - 背景線程自動清理

#### 4. 檔案上傳驗證 ✅ 已完成
- [x] 添加檔案大小限制 (10MB 預設, 50MB CSV)
- [x] MIME 類型白名單驗證
- [x] 檔案內容掃描（危險簽名檢測）
  ```python
  # 已實現 in file_validation.py
  MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
  ALLOWED_MIMES = ['application/pdf', 'text/csv', ...]
  
  def validate_upload(file):
      validate_file_size(file)
      validate_mime_type(file)
      validate_no_dangerous_content(file)
  ```

#### 5. AI 請求控制 ✅ 已完成
- [x] 設置 OpenAI API 調用的溫度範圍限制 (0.0-1.5)
- [x] 設置 max_tokens 上限 (8192)
- [x] 實現用戶級別的 AI 請求配額 (100 請求/天, 100K tokens/天)
- [x] 添加 AI 使用審計日誌
  ```python
  # 已實現 in ai_request_controls.py
  class AIRequestController:
      quota_manager = QuotaManager()
      audit_logger = AuditLogger()
  ```

---

## 🟠 中優先級 - 功能改進

### 後端

#### 6. 數據庫索引 ✅ 已完成
- [x] 為常用查詢欄位添加索引
  ```python
  # 已實現 in 0002_add_performance_indexes.py
  # - Invoice: status, issue_date, created_at
  # - Payment: status, payment_date
  # - Contact: contact_type, company_name
  ```

#### 7. 可觀測性日誌 ✅ 已完成
- [x] 數據載入時間記錄
- [x] AI API 調用時間追蹤
- [x] Token 使用量追蹤
  ```python
  # 已實現 in observability.py
  @track_data_load
  def load_all_datasets(): ...
  
  token_tracker.record(user_id, input_tokens, output_tokens)
  ```

#### 8. DatabaseSchemaPanel API ✅ 已完成
- [x] 創建 /analyst-assistant/schema/ 端點
- [x] 前端連接真實 API
  ```python
  # 已實現 in analyst_viewset.py
  class AnalystSchemaView(APIView):
      def get(self, request):
          # 返回數據表結構
  ```

#### 9. RAG 整合 ✅ 已完成
- [x] 創建 RAG 服務模組
- [x] 讓 AI 參考用戶上傳的文件
  ```python
  # 已實現 in rag_service.py
  def get_relevant_documents(user_id, query):
      # 檢索相關文件
  
  def build_rag_context(user_id, query):
      # 構建上下文
  ```

#### 10. Dashboard 資料修復 ✅ 已完成
- [x] 添加詳細調試日誌
- [x] 修復數據引用問題（深拷貝）

---

## 🟡 低優先級 - 未來優化

### 11. JSONField 驗證
          "data": {"type": "array"},
          "message": {"type": "string"}
      }
  }
  ```
- [ ] 為常查欄位添加數據庫索引
  - `status`
  - `created_at`
  - `user_id`
  - `company_id`

#### 7. 可觀測性
- [ ] 添加數據載入統計
  ```python
  import logging
  import time
  
  logger = logging.getLogger('analyst')
  
  def load_all_datasets():
      start_time = time.time()
      # ... loading logic ...
      elapsed = time.time() - start_time
      logger.info(f"Data loaded: {row_count} rows in {elapsed:.2f}s")
  ```
- [ ] AI 調用追蹤（請求 ID、耗時、token 使用）
- [ ] 錯誤率監控

### 前端 (Next.js)

#### 8. DatabaseSchemaPanel 改進
- [x] 添加搜索功能
- [x] 添加加載狀態（skeleton）
- [x] 添加可折疊分組
- [ ] 接上真實 API `/analyst-assistant/start`
- [ ] 顯示最後同步時間
- [ ] 添加錯誤狀態和空狀態處理

#### 9. 無障礙與可用性
- [ ] 為可折疊/Tab 元件添加鍵盤焦點
- [ ] 添加 ARIA 標籤
- [ ] 為圖示添加 tooltip 說明
- [ ] 確保顏色對比度符合 WCAG 標準

#### 10. AI Chat 改進
- [x] 添加上下文標籤 (Context Chips)
- [x] 查詢類型提示
- [ ] **修復 AI 回應與查詢不相關的問題**
  - 目前 AI 回傳的圖表數據與用戶查詢無關
  - 需要改進後端的 query classifier
- [ ] 添加流式輸出 (Streaming)
- [ ] 添加對話歷史持久化

#### 11. 圖表與 Dashboard
- [x] 支援更多圖表類型（radar, funnel, treemap）
- [ ] **修復 Add to Dashboard 後數據為空的問題**
- [ ] 統一圖表組件的空狀態
- [ ] 添加圖表匯出功能（PNG, CSV）
- [ ] 添加查詢複製功能

---

## 🟡 低優先級 - 優化與美化

### 前端

#### 12. API 客戶端
- [ ] 建立型別化前端 API 客戶端
  ```typescript
  // 使用 zodios 或 ts-rest
  import { makeApi, Zodios } from "@zodios/core";
  import { z } from "zod";
  
  const analystApi = makeApi([
    {
      method: "post",
      path: "/analyst-assistant/query",
      alias: "sendQuery",
      parameters: [
        { name: "body", type: "Body", schema: z.object({ query: z.string() }) }
      ],
      response: z.object({
        type: z.string(),
        data: z.array(z.any()).optional(),
        message: z.string().optional()
      })
    }
  ]);
  ```
- [ ] 集中錯誤處理與權杖攔截
- [ ] 從 API 動態載入模型選單

#### 13. 樣式與美觀
- [ ] 替換樣板品牌與預設字體
- [ ] 選定一套主題色盤
- [ ] 添加漸層或紋理背景
- [ ] 添加進場動效（淡入/微移動）
- [ ] 調整字體大小，避免過小造成閱讀負擔

---

## ✅ 已完成

- [x] 業務數據 Switch 切換視圖
- [x] 修復 AI 對話 JSON 解析錯誤
- [x] AI 回應格式化顯示 (Markdown, Code blocks)
- [x] 修復 RAG 滾動問題
- [x] DatabaseSchemaPanel 增強（搜索、分組）
- [x] AIChatPanel 增強（上下文標籤、查詢提示）
- [x] 圖表類型多樣化
- [x] Dashboard 全屏和截圖功能
- [x] 移除左邊業務數據 UI (DataSidebarPanel)
- [x] 修復中間區域 width 變化問題

---

## 📋 實施優先順序

### Phase 1 - 安全 (1-2 週)
1. 身份驗證與速率限制
2. 移除/沙箱化代碼執行
3. 檔案上傳驗證

### Phase 2 - 穩定性 (1 週)
4. 多租戶 cache 隔離
5. 錯誤處理統一
6. 可觀測性

### Phase 3 - 功能 (2-3 週)
7. AI 圖表生成修復
8. Dashboard 數據問題修復
9. RAG 文件整合

### Phase 4 - 優化 (1-2 週)
10. 型別化 API 客戶端
11. 無障礙改進
12. 樣式美化

---

## 📝 注意事項

1. **代碼執行風險是最嚴重的安全問題**，應該優先處理
2. 建議在生產環境部署前完成 Phase 1
3. 所有 AI 相關功能應該有使用量追蹤
4. 考慮使用 Langchain 或類似框架來管理 AI 工作流程

---

*最後更新: 2024-12-07*

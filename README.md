# 個人博客系統

基於 JAMstack 架構的極簡個人博客系統，支持在線編輯、圖片上傳和自動部署。

## ✨ 特性

- 🎨 **極簡設計** - 優雅的極簡風格，專注內容展示
- ✏️ **在線編輯** - 所見即所得的 Markdown 編輯器，支持實時預覽
- 🖼️ **圖片管理** - 拖拽上傳圖片，自動優化和 CDN 分發
- 🔐 **安全認證** - Supabase 身份驗證，保護管理面板
- ⚡ **快速加載** - 靜態站點生成，GitHub Pages 托管
- 📱 **響應式** - 完美適配桌面和移動設備
- 🚀 **自動部署** - GitHub Actions 自動化部署流程

## 🏗️ 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    管理面板     │    │    Supabase     │    │    靜態博客     │
│   (React)       │◄──►│   (後端服務)    │    │ (GitHub Pages)  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • 身份驗證      │    │ • PostgreSQL    │    │ • HTML/CSS/JS   │
│ • 文章編輯      │    │ • 文件存儲      │    │ • 靜態資源      │
│ • 圖片管理      │    │ • 實時 API      │    │ • SEO 優化      │
│ • 靜態生成      │    │ • 行級安全      │    │ • RSS 訂閱      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速開始

### 1. 克隆項目

```bash
git clone https://github.com/xiaonaofua/blog2.git
cd blog2
```

### 2. 設置 Supabase

1. 在 [Supabase](https://supabase.com) 創建新項目
2. 在 SQL 編輯器中執行 `supabase-setup.sql`
3. 創建 `blog-images` 存儲桶並設置公共訪問權限
4. 更新 `admin/src/services/supabase.ts` 中的配置信息

### 3. 安裝依賴

```bash
npm run setup
```

### 4. 啟動開發服務器

```bash
npm run dev:admin
```

管理面板將在 http://localhost:3000 啟動。

### 5. 首次登錄

1. 在 Supabase 控制台的 Authentication 部分創建用戶
2. 使用創建的用戶登錄管理面板

## 📝 使用指南

### 創建文章

1. 登錄管理面板
2. 點擊「新建文章」
3. 使用所見即所得編輯器撰寫內容
4. 設置標題、URL 別名、摘要等信息
5. 點擊「發布文章」

### 管理圖片

1. 在「圖片管理」頁面上傳圖片
2. 拖拽文件或點擊上傳
3. 編輯 Alt 文本提升可訪問性
4. 複製圖片 URL 在文章中使用

### 靜態站點生成

1. 在「設置」頁面點擊「生成靜態站點」
2. 系統會自動生成 HTML 文件到 `docs` 目錄
3. GitHub Actions 會自動部署到 GitHub Pages

## 🔧 配置

### 環境變量

在 `admin/.env` 文件中配置：

```env
VITE_SUPABASE_URL=你的_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=你的_SUPABASE_匿名_KEY
```

### GitHub Pages 設置

1. 在倉庫設置中啟用 GitHub Pages
2. 選擇 `docs` 文件夾作為源
3. 配置自定義域名（可選）

### 自動部署設置

1. 在 Vercel 或 Netlify 創建項目
2. 連接 GitHub 倉庫
3. 設置環境變量
4. 配置 GitHub Secrets（如需要）

## 📂 項目結構

```
blog2/
├── admin/                  # 管理面板 (React)
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── services/      # API 服務
│   │   └── hooks/         # 自定義 Hooks
│   └── package.json
├── docs/                   # 靜態博客文件
│   ├── assets/            # 靜態資源
│   ├── posts/             # 生成的文章頁面
│   └── index.html         # 主頁
├── templates/              # HTML 模板
├── scripts/               # 構建腳本
├── .github/workflows/     # GitHub Actions
└── supabase-setup.sql     # 數據庫初始化
```

## 🛠️ 開發

### 本地開發

```bash
# 啟動管理面板開發服務器
npm run dev:admin

# 構建管理面板
npm run build:admin

# 生成靜態站點
npm run generate:static

# 代碼檢查
npm run lint
```

### 自定義主題

修改 `docs/assets/css/style.css` 中的 CSS 變量：

```css
:root {
  --color-accent: #your-color;
  --font-serif: 'Your-Font', serif;
}
```

### 添加新功能

1. 在 `admin/src` 中開發新功能
2. 更新數據庫架構（如需要）
3. 修改靜態生成器（如需要）
4. 測試並部署

## 📊 性能優化

- ✅ 圖片自動壓縮和 WebP 轉換
- ✅ CSS/JS 代碼壓縮
- ✅ 懶加載圖片
- ✅ CDN 緩存
- ✅ 預加載關鍵資源
- ✅ RSS 訂閱支持

## 🔒 安全特性

- ✅ Supabase 行級安全 (RLS)
- ✅ JWT 身份驗證
- ✅ HTTPS 強制加密
- ✅ XSS 防護
- ✅ CSRF 防護

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個項目。

## 📄 許可證

本項目採用 MIT 許可證。詳見 [LICENSE](LICENSE) 文件。

## 🙏 致謝

- [Supabase](https://supabase.com) - 後端服務
- [React](https://reactjs.org) - 前端框架
- [TipTap](https://tiptap.dev) - 編輯器
- [Tailwind CSS](https://tailwindcss.com) - 樣式框架
- [GitHub Pages](https://pages.github.com) - 靜態托管

## 📞 支持

如有問題，請：

1. 查閱 [Issues](https://github.com/xiaonaofua/blog2/issues)
2. 創建新的 Issue
3. 查看項目文檔

---

用 ❤️ 製作，為個人博客而生。
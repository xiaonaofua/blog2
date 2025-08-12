# 博客系統設置指南

## 第一步：設置 Supabase 數據庫

### 1. 創建 Supabase 項目

1. 訪問 [Supabase](https://supabase.com) 並登錄
2. 點擊 "New Project" 創建新項目
3. 選擇組織和填寫項目信息
4. 等待項目初始化完成（約 2 分鐘）

### 2. 執行數據庫初始化

在 Supabase 控制台的 SQL Editor 中**分步驟**執行以下 SQL：

#### 步驟 1：創建表結構
```sql
-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建文章表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 創建圖片表
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);
```

#### 步驟 2：創建索引
```sql
-- 創建索引
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS images_user_id_idx ON images(user_id);
```

#### 步驟 3：設置行級安全
```sql
-- 啟用行級安全
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 創建行級安全策略 - 用戶只能訪問自己的文章
DROP POLICY IF EXISTS "Users can only access their own posts" ON posts;
CREATE POLICY "Users can only access their own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

-- 用戶只能訪問自己的圖片
DROP POLICY IF EXISTS "Users can only access their own images" ON images;
CREATE POLICY "Users can only access their own images" ON images
  FOR ALL USING (auth.uid() = user_id);
```

#### 步驟 4：創建觸發器
```sql
-- 創建自動更新 updated_at 的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 posts 表創建觸發器
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. 創建存儲桶

1. 在 Supabase 控制台左側菜單點擊 "Storage"
2. 點擊 "Create bucket"
3. 桶名設為：`blog-images`
4. 設置為 Public bucket：✅
5. 點擊 "Create bucket"

### 4. 設置存儲桶策略

在 Storage > blog-images > Policies，添加以下策略：

**插入策略 (INSERT)**：
```sql
-- 允許經過身份驗證的用戶上傳圖片到自己的文件夾
auth.uid()::text = (storage.foldername(name))[1]
```

**選擇策略 (SELECT)**：
```sql
-- 允許公共訪問所有圖片
true
```

**更新策略 (UPDATE)**：
```sql
-- 允許用戶更新自己上傳的圖片
auth.uid()::text = (storage.foldername(name))[1]
```

**刪除策略 (DELETE)**：
```sql
-- 允許用戶刪除自己上傳的圖片
auth.uid()::text = (storage.foldername(name))[1]
```

### 5. 創建用戶帳號

1. 在 Supabase 控制台左側菜單點擊 "Authentication"
2. 點擊 "Users" 選項卡
3. 點擊 "Add user"
4. 選擇 "Create new user"
5. 填寫 Email 和 Password
6. 點擊 "Create user"

## 第二步：啟動管理面板

### 1. 安裝依賴

```bash
cd admin
npm install
```

### 2. 啟動開發服務器

```bash
npm run dev
```

### 3. 訪問管理面板

打開瀏覽器訪問 http://localhost:3000

使用剛才創建的用戶帳號登錄。

## 第三步：測試功能

1. **登錄測試**：使用 Supabase 用戶帳號登錄
2. **創建文章**：點擊「新建文章」測試編輯器
3. **上傳圖片**：在圖片管理中測試上傳功能
4. **發布文章**：完成一篇文章並發布

## 常見問題

### Q: 登錄時提示 "Invalid login credentials"
A: 確認在 Supabase Authentication 中創建了用戶，並使用正確的郵箱和密碼。

### Q: 圖片上傳失敗
A: 檢查 Storage 桶 `blog-images` 是否創建並設置了正確的策略。

### Q: 無法看到已發布的文章
A: 確認數據庫表創建成功，並且用戶有正確的 RLS 權限。

### Q: 開發服務器啟動失敗
A: 確認 Node.js 版本 ≥18，並且所有依賴都正確安裝。

## 獲取配置信息

在 Supabase 項目的 Settings > API 中找到：
- Project URL: `https://你的項目id.supabase.co`
- anon/public key: `eyJ...` (用於客戶端)

這些信息已經在 `admin/src/services/supabase.ts` 中配置好了。
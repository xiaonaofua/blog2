# 博客發文指南

## 🚀 啟動本地服務

```bash
npm run dev:admin
```

管理面板：http://localhost:3000

## ✏️ 發布新文章

1. 登錄管理面板
2. 點擊「新建文章」
3. 使用編輯器撰寫內容
4. 設置標題、URL別名、摘要
5. 點擊「發布文章」
6. 在「設置」頁面生成靜態站點

## 📤 上傳到 GitHub

### 方法一：Git 命令
```bash
git add .
git commit -m "新增文章: [文章標題]"
git push origin main
```

### 方法二：創建 upload.bat 文件
```batch
@echo off
git add .
set /p message="請輸入提交信息: "
git commit -m "%message%"
git push origin main
pause
```

## 🖼️ 圖片管理

1. 在「圖片管理」頁面上傳圖片
2. 複製圖片 URL 在文章中使用

---

博客地址: https://xiaonaofua.github.io/blog2/
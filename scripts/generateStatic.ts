#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { format } from 'date-fns'

// Supabase 配置
const supabaseUrl = 'https://bvdgbnlzfyygosqtknaw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZGdibmx6Znl5Z29zcXRrbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzM3OTQsImV4cCI6MjA3MDA0OTc5NH0.OYPJoXN9LNQuIfyWyDXs0V2BvdbS7Rkw-mXcVskrv4g'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 輸出目錄
const outputDir = path.join(process.cwd(), '..', 'docs')
const templatesDir = path.join(process.cwd(), '..', 'templates')

// 確保輸出目錄存在
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 讀取模板文件
const readTemplate = (templateName: string): string => {
  const templatePath = path.join(templatesDir, `${templateName}.html`)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`模板文件不存在: ${templatePath}`)
  }
  return fs.readFileSync(templatePath, 'utf-8')
}

// 替換模板變量
const replaceTemplateVars = (template: string, vars: Record<string, string>): string => {
  let result = template
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  return result
}

// 獲取已發布的文章
const getPublishedPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(`獲取文章失敗: ${error.message}`)
  }

  return data || []
}

// 生成主頁
const generateHomepage = async (posts: any[]) => {
  console.log('正在生成主頁...')
  
  const template = readTemplate('homepage')
  const latestPosts = posts.slice(0, 6) // 顯示最新 6 篇文章

  // 生成文章列表 HTML
  const postsHtml = latestPosts.map(post => {
    const publishDate = format(new Date(post.published_at), 'yyyy-MM-dd')
    const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    
    return `
      <article class="post-card">
        ${post.featured_image ? `
          <div class="post-image">
            <img src="${post.featured_image}" alt="${post.title}" loading="lazy">
          </div>
        ` : ''}
        <div class="post-content">
          <h2 class="post-title">
            <a href="/posts/${post.slug}.html">${post.title}</a>
          </h2>
          <p class="post-date">${publishDate}</p>
          <p class="post-excerpt">${excerpt}</p>
          <a href="/posts/${post.slug}.html" class="read-more">繼續閱讀 →</a>
        </div>
      </article>
    `
  }).join('\n')

  const vars = {
    title: '我的個人博客',
    description: '分享我的思考和經驗',
    posts: postsHtml,
    year: new Date().getFullYear().toString()
  }

  const html = replaceTemplateVars(template, vars)
  fs.writeFileSync(path.join(outputDir, 'index.html'), html)
}

// 生成文章頁面
const generatePostPages = async (posts: any[]) => {
  console.log('正在生成文章頁面...')
  
  const template = readTemplate('post')
  const postsDir = path.join(outputDir, 'posts')
  ensureDir(postsDir)

  for (const post of posts) {
    const publishDate = format(new Date(post.published_at), 'yyyy-MM-dd')
    const content = post.content

    const vars = {
      title: post.title,
      description: post.excerpt || '我的個人博客',
      'post-title': post.title,
      'post-date': publishDate,
      'post-content': content,
      year: new Date().getFullYear().toString()
    }

    const html = replaceTemplateVars(template, vars)
    fs.writeFileSync(path.join(postsDir, `${post.slug}.html`), html)
  }
}

// 生成文章歸檔頁面
const generateArchive = async (posts: any[]) => {
  console.log('正在生成歸檔頁面...')
  
  const template = readTemplate('archive')
  const postsDir = path.join(outputDir, 'posts')
  ensureDir(postsDir)

  // 按年份分組
  const postsByYear: Record<string, any[]> = {}
  posts.forEach(post => {
    const year = format(new Date(post.published_at), 'yyyy')
    if (!postsByYear[year]) {
      postsByYear[year] = []
    }
    postsByYear[year].push(post)
  })

  // 生成歸檔 HTML
  const archiveHtml = Object.entries(postsByYear)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .map(([year, yearPosts]) => {
      const postsHtml = yearPosts.map(post => {
        const publishDate = format(new Date(post.published_at), 'MM-dd')
        return `
          <li class="archive-item">
            <span class="archive-date">${publishDate}</span>
            <a href="/posts/${post.slug}.html" class="archive-title">${post.title}</a>
          </li>
        `
      }).join('\n')

      return `
        <section class="archive-year">
          <h2 class="year-title">${year}</h2>
          <ul class="archive-list">
            ${postsHtml}
          </ul>
        </section>
      `
    }).join('\n')

  const vars = {
    title: '文章歸檔 - 我的個人博客',
    description: '我的個人博客文章歸檔',
    archive: archiveHtml,
    year: new Date().getFullYear().toString()
  }

  const html = replaceTemplateVars(template, vars)
  fs.writeFileSync(path.join(postsDir, 'index.html'), html)
}

// 生成 RSS 訂閱
const generateRSS = async (posts: any[]) => {
  console.log('正在生成 RSS 訂閱...')
  
  const latestPosts = posts.slice(0, 10) // RSS 中顯示最新 10 篇文章
  const siteUrl = 'https://xiaonaofua.github.io/blog2' // 替換為您的實際域名

  const rssItems = latestPosts.map(post => {
    const publishDate = new Date(post.published_at).toUTCString()
    const content = post.content.replace(/<[^>]*>/g, '') // 移除 HTML 標籤
    
    return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${siteUrl}/posts/${post.slug}.html</link>
        <description><![CDATA[${post.excerpt || content.substring(0, 300)}]]></description>
        <pubDate>${publishDate}</pubDate>
        <guid>${siteUrl}/posts/${post.slug}.html</guid>
      </item>
    `
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>我的個人博客</title>
    <link>${siteUrl}</link>
    <description>分享我的思考和經驗</description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`

  fs.writeFileSync(path.join(outputDir, 'feed.xml'), rss)
}

// 生成站點地圖
const generateSitemap = async (posts: any[]) => {
  console.log('正在生成站點地圖...')
  
  const siteUrl = 'https://xiaonaofua.github.io/blog2' // 替換為您的實際域名
  
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/posts/`,
    ...posts.map(post => `${siteUrl}/posts/${post.slug}.html`)
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap)
}

// 複製靜態資源
const copyAssets = () => {
  console.log('正在複製靜態資源...')
  
  const assetsDir = path.join(outputDir, 'assets')
  ensureDir(assetsDir)
  ensureDir(path.join(assetsDir, 'css'))
  ensureDir(path.join(assetsDir, 'js'))
  ensureDir(path.join(assetsDir, 'images'))

  // 這裡可以複製 CSS、JS 等靜態文件
  // 實際項目中應該從模板目錄複製這些文件
}

// 主函數
const main = async () => {
  try {
    console.log('開始生成靜態站點...')
    
    // 確保輸出目錄存在
    ensureDir(outputDir)
    
    // 獲取文章數據
    const posts = await getPublishedPosts()
    console.log(`找到 ${posts.length} 篇已發布文章`)

    if (posts.length === 0) {
      console.log('沒有已發布的文章，將生成空的站點')
    }

    // 生成各個頁面
    await generateHomepage(posts)
    await generatePostPages(posts)
    await generateArchive(posts)
    await generateRSS(posts)
    await generateSitemap(posts)
    copyAssets()

    console.log('✅ 靜態站點生成完成！')
    console.log(`輸出目錄: ${outputDir}`)
    
  } catch (error) {
    console.error('❌ 生成失敗:', error)
    process.exit(1)
  }
}

// 運行腳本
if (require.main === module) {
  main()
}

export { main as generateStatic }
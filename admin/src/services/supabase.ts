import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvdgbnlzfyygosqtknaw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZGdibmx6Znl5Z29zcXRrbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzM3OTQsImV4cCI6MjA3MDA0OTc5NH0.OYPJoXN9LNQuIfyWyDXs0V2BvdbS7Rkw-mXcVskrv4g'

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// 數據庫類型定義
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
  user_id: string
}

export interface BlogImage {
  id: string
  filename: string
  original_name: string
  size: number
  mime_type: string
  storage_path: string
  public_url: string
  alt_text?: string
  created_at: string
  user_id: string
}

// 用戶認證狀態類型
export interface User {
  id: string
  email?: string
  created_at: string
}

// 認證相關函數
export const auth = {
  // 登錄
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 獲取當前用戶
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 監聽認證狀態變化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 文章相關操作
export const posts = {
  // 獲取所有文章
  getAll: async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  // 根據 ID 獲取文章
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // 根據 slug 獲取文章
  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()
    return { data, error }
  },

  // 創建文章
  create: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single()
    return { data, error }
  },

  // 更新文章
  update: async (id: string, post: Partial<Post>) => {
    const { data, error } = await supabase
      .from('posts')
      .update(post)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // 刪除文章
  delete: async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    return { error }
  },

  // 獲取已發布文章
  getPublished: async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    return { data, error }
  }
}

// 圖片相關操作
export const images = {
  // 獲取所有圖片
  getAll: async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 上傳圖片
  upload: async (file: File, fileName: string) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    // 生成文件路徑
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const filePath = `${user.user.id}/${year}/${month}/${fileName}`

    // 上傳到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file)

    if (uploadError) return { data: null, error: uploadError }

    // 獲取公共 URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    // 保存圖片信息到數據庫
    const { data, error } = await supabase
      .from('images')
      .insert([{
        filename: fileName,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        user_id: user.user.id
      }])
      .select()
      .single()

    return { data, error }
  },

  // 更新圖片信息
  update: async (id: string, updates: Partial<BlogImage>) => {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // 刪除圖片
  delete: async (id: string) => {
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) return { error: fetchError }

    // 從存儲中刪除文件
    const { error: storageError } = await supabase.storage
      .from('blog-images')
      .remove([image.storage_path])

    if (storageError) return { error: storageError }

    // 從數據庫中刪除記錄
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id)

    return { error }
  }
}
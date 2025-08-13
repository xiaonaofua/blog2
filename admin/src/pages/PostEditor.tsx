import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TipTapEditor } from '@/components/Editor/TipTapEditor'
import { usePost, useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import { images } from '@/services/supabase'
import { generateSlug, validateSlug, extractExcerpt } from '@/utils/slug'
import { useAuth } from '@/contexts/AuthContext'
import { handleSupabaseError, showErrorAlert } from '@/utils/errorHandler'

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id
  const { user } = useAuth()

  // 文章數據
  const { data: postData, isLoading } = usePost(id)
  
  // Mutations
  const createPostMutation = useCreatePost()
  const updatePostMutation = useUpdatePost()

  // 表單狀態
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 初始化表單數據
  useEffect(() => {
    if (postData?.data) {
      const post = postData.data
      setTitle(post.title)
      setSlug(post.slug)
      setContent(post.content)
      setExcerpt(post.excerpt || '')
      setFeaturedImage(post.featured_image || '')
      setStatus(post.status)
      setIsSlugManuallyEdited(true) // 編輯時認為 slug 已被手動編輯
    }
  }, [postData])

  // 自動生成 slug
  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      setSlug(generateSlug(title))
    }
  }, [title, isSlugManuallyEdited])

  // 自動保存 (草稿)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title && content && status === 'draft' && !isSaving) {
        handleSave('draft')
      }
    }, 30000) // 30 秒自動保存

    return () => clearTimeout(timer)
  }, [title, content, status])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    
    // 自動生成摘要
    if (content) {
      setExcerpt(extractExcerpt(content))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(value)
    setIsSlugManuallyEdited(true)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    
    // 自動生成摘要
    if (!excerpt || excerpt === extractExcerpt(content)) {
      setExcerpt(extractExcerpt(value))
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('用户未登录')
    }
    
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await images.upload(file, fileName)
    
    if (error) {
      throw error
    }
    
    return data.public_url
  }

  const handleSave = async (saveStatus: 'draft' | 'published') => {
    if (!title || !content) {
      alert('標題和內容不能為空')
      return
    }

    if (!validateSlug(slug)) {
      alert('URL 別名格式不正確，只能包含小寫字母、數字和連字符')
      return
    }

    setIsSaving(true)

    try {
      if (!user) {
        throw new Error('用户未登录')
      }

      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || extractExcerpt(content),
        featured_image: featuredImage || null,
        status: saveStatus,
        user_id: user.id,
        ...(saveStatus === 'published' && !isEditing ? { published_at: new Date().toISOString() } : {})
      }

      if (isEditing) {
        await updatePostMutation.mutateAsync({ id, ...postData })
      } else {
        const { data } = await createPostMutation.mutateAsync(postData)
        // 創建成功後跳轉到編輯頁面
        navigate(`/posts/edit/${data.id}`, { replace: true })
      }

      setStatus(saveStatus)
      setLastSaved(new Date())
      
      if (saveStatus === 'published') {
        alert('文章發布成功！🎉\n\n系統將在 5 分鐘內自動檢測並部署到博客。\n您可以在「設置」頁面查看部署狀態。')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      
      const appError = handleSupabaseError(error)
      showErrorAlert(appError)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = () => handleSave('published')
  const handleSaveDraft = () => handleSave('draft')

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? '編輯文章' : '新建文章'}
        </h1>
        
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              最後保存：{lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="btn btn-secondary"
            >
              {isSaving ? '保存中...' : '保存草稿'}
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isSaving || !title || !content}
              className="btn btn-primary"
            >
              {status === 'published' ? '更新發布' : '發布文章'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主編輯區 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 標題 */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="請輸入文章標題..."
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400 bg-transparent"
            />
          </div>

          {/* 內容編輯器 */}
          <div>
            <TipTapEditor
              content={content}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>

        {/* 側邊欄設置 */}
        <div className="space-y-6">
          {/* 文章設置 */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">文章設置</h3>
            </div>
            <div className="card-content space-y-4">
              {/* URL 別名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL 別名
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="input text-sm"
                  placeholder="url-alias"
                />
                <p className="mt-1 text-xs text-gray-500">
                  只能包含小寫字母、數字和連字符
                </p>
              </div>

              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  摘要
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="textarea text-sm"
                  rows={3}
                  placeholder="文章摘要（可選，系統會自動生成）"
                />
              </div>

              {/* 特色圖片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特色圖片 URL
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="input text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                {featuredImage && (
                  <div className="mt-2">
                    <img
                      src={featuredImage}
                      alt="特色圖片預覽"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* 狀態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  狀態
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="input text-sm"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已發布</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
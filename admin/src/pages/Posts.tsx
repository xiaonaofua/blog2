import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePosts, useDeletePost, usePublishPost, useUnpublishPost } from '@/hooks/usePosts'
import { format } from 'date-fns'

export const Posts: React.FC = () => {
  const { data: postsData, isLoading } = usePosts()
  const deletePostMutation = useDeletePost()
  const publishPostMutation = usePublishPost()
  const unpublishPostMutation = useUnpublishPost()

  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const posts = postsData?.data || []
  
  // 過濾和搜索
  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter
    const matchesSearch = search === '' || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`確定要刪除文章「${title}」嗎？此操作無法撤銷。`)) {
      try {
        await deletePostMutation.mutateAsync(id)
        alert('文章已刪除')
      } catch (error) {
        console.error('Delete error:', error)
        alert('刪除失敗')
      }
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishPostMutation.mutateAsync(id)
      alert('文章已發布')
    } catch (error) {
      console.error('Publish error:', error)
      alert('發布失敗')
    }
  }

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishPostMutation.mutateAsync(id)
      alert('文章已撤回')
    } catch (error) {
      console.error('Unpublish error:', error)
      alert('撤回失敗')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link to="/posts/new" className="btn btn-primary">
          新建文章
        </Link>
      </div>

      {/* 搜索和篩選 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章..."
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            全部 ({posts.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-secondary'}`}
          >
            已發布 ({posts.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
          >
            草稿 ({posts.filter(p => p.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="card">
        <div className="card-content p-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {search ? '沒有找到匹配的文章' : '還沒有文章'}
              </p>
              {!search && (
                <Link to="/posts/new" className="btn btn-primary mt-4">
                  創建第一篇文章
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      標題
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Link
                            to={`/posts/edit/${post.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? '已發布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{format(new Date(post.updated_at), 'yyyy-MM-dd')}</span>
                          <span className="text-xs">{format(new Date(post.updated_at), 'HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/posts/edit/${post.id}`}
                            className="btn btn-ghost text-sm"
                          >
                            編輯
                          </Link>
                          
                          {post.status === 'draft' ? (
                            <button
                              onClick={() => handlePublish(post.id)}
                              className="btn btn-ghost text-sm text-green-600 hover:text-green-700"
                              disabled={publishPostMutation.isLoading}
                            >
                              發布
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublish(post.id)}
                              className="btn btn-ghost text-sm text-yellow-600 hover:text-yellow-700"
                              disabled={unpublishPostMutation.isLoading}
                            >
                              撤回
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="btn btn-ghost text-sm text-red-600 hover:text-red-700"
                            disabled={deletePostMutation.isLoading}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { format } from 'date-fns'

export const Dashboard: React.FC = () => {
  const { data: postsData, isLoading } = usePosts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const posts = postsData?.data || []
  const publishedPosts = posts.filter(p => p.status === 'published')
  const draftPosts = posts.filter(p => p.status === 'draft')
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <Link to="/posts/new" className="btn btn-primary">
          新建文章
        </Link>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">總文章數</p>
                <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">已發布</p>
                <p className="text-3xl font-bold text-green-600">{publishedPosts.length}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">草稿</p>
                <p className="text-3xl font-bold text-yellow-600">{draftPosts.length}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近文章 */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">最近文章</h2>
            <Link to="/posts" className="text-primary-600 hover:text-primary-700 text-sm">
              查看全部
            </Link>
          </div>
        </div>
        <div className="card-content">
          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">還沒有文章</p>
              <Link to="/posts/new" className="btn btn-primary mt-4">
                創建第一篇文章
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/posts/edit/${post.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600 truncate"
                      >
                        {post.title}
                      </Link>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? '已發布' : '草稿'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {post.status === 'published' && post.published_at
                        ? `發布於 ${format(new Date(post.published_at), 'yyyy-MM-dd HH:mm')}`
                        : `更新於 ${format(new Date(post.updated_at), 'yyyy-MM-dd HH:mm')}`
                      }
                    </p>
                  </div>
                  <Link
                    to={`/posts/edit/${post.id}`}
                    className="btn btn-ghost text-sm"
                  >
                    編輯
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
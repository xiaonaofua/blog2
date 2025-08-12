import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const Settings: React.FC = () => {
  const { user } = useAuth()
  const [generating, setGenerating] = useState(false)

  const handleGenerateStatic = async () => {
    setGenerating(true)
    try {
      // 這裡會調用靜態站點生成 API
      const response = await fetch('/api/generate-static', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('靜態站點生成成功！')
      } else {
        throw new Error('生成失敗')
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('生成失敗，請稍後再試')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設置</h1>
        <p className="text-gray-600 mt-1">管理您的博客設置和偏好</p>
      </div>

      {/* 用戶信息 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">用戶信息</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">電子郵箱</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="input bg-gray-50 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">用戶 ID</label>
              <input
                type="text"
                value={user?.id || ''}
                readOnly
                className="input bg-gray-50 mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 博客設置 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">博客設置</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                博客標題
              </label>
              <input
                type="text"
                defaultValue="我的個人博客"
                className="input"
                placeholder="輸入博客標題"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                博客描述
              </label>
              <textarea
                defaultValue="分享我的思考和經驗"
                className="textarea"
                rows={3}
                placeholder="輸入博客描述"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub 倉庫 URL
              </label>
              <input
                type="url"
                defaultValue="https://github.com/xiaonaofua/blog2.git"
                className="input"
                placeholder="https://github.com/username/repo.git"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 靜態站點生成 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">靜態站點生成</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              將您的博客內容生成為靜態 HTML 文件，並自動部署到 GitHub Pages。
            </p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateStatic}
                disabled={generating}
                className="btn btn-primary"
              >
                {generating ? (
                  <>
                    <div className="spinner mr-2"></div>
                    生成中...
                  </>
                ) : (
                  '生成靜態站點'
                )}
              </button>
              
              <div className="text-sm text-gray-500">
                最後生成：還未生成過
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase 配置 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">數據庫配置</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                value="https://bvdgbnlzfyygosgqtknak.supabase.co"
                readOnly
                className="input bg-gray-50 text-sm"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">提示</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>
                      如果您需要修改數據庫配置，請更新 Supabase 項目設置，
                      然後重新部署管理面板。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 危險操作 */}
      <div className="card border-red-200">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-red-800">危險操作</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              以下操作具有不可逆性，請謹慎執行。
            </p>
            
            <button className="btn btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50">
              清空所有文章
            </button>
            
            <button className="btn btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50">
              清空所有圖片
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
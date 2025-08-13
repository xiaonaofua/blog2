import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const Settings: React.FC = () => {
  const { user } = useAuth()

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

      {/* 自動部署狀態 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">🚀 自動部署</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full bg-green-400 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">自動部署已啟用</h3>
                  <div className="mt-1 text-sm text-green-700">
                    <p>
                      您的博客已配置為自動部署模式。當您發布新文章時，系統會在 <strong>5 分鐘內</strong> 自動檢測變更並部署到 GitHub Pages。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">📝 發布流程</div>
                <div className="text-blue-800">
                  寫作 → 發布文章 → 5分鐘內自動部署
                </div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-medium text-purple-900 mb-1">⚡ 部署頻率</div>
                <div className="text-purple-800">
                  每 5 分鐘檢查一次新內容
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">部署狀態</p>
                  <p className="text-xs text-gray-500">
                    可以在 GitHub Actions 頁面查看詳細日誌
                  </p>
                </div>
                <a 
                  href="https://github.com/xiaonaofua/blog2/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  查看部署日誌 ↗
                </a>
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
import React, { useState, useEffect } from 'react'
import { testConnection, testPostCreation, testImageUpload } from '@/utils/connectionTest'
import { runFullUserTest } from '@/utils/userTest'
import { supabase } from '@/services/supabase'

export const Diagnostics: React.FC = () => {
  const [connectionResults, setConnectionResults] = useState<any>(null)
  const [postTestResults, setPostTestResults] = useState<any>(null)
  const [imageTestResults, setImageTestResults] = useState<any>(null)
  const [userTestResults, setUserTestResults] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const runConnectionTest = async () => {
    setIsLoading(true)
    try {
      const results = await testConnection()
      setConnectionResults(results)
    } catch (error) {
      console.error('Connection test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runPostTest = async () => {
    setIsLoading(true)
    try {
      const results = await testPostCreation()
      setPostTestResults(results)
    } catch (error) {
      console.error('Post test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runImageTest = async () => {
    setIsLoading(true)
    try {
      const results = await testImageUpload()
      setImageTestResults(results)
    } catch (error) {
      console.error('Image test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runUserTest = async () => {
    setIsLoading(true)
    try {
      const results = await runFullUserTest('co2sou@gmail.com', 'A@aaaaa1')
      setUserTestResults(results)
    } catch (error) {
      console.error('User test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    try {
      const [conn, post, image] = await Promise.all([
        testConnection(),
        testPostCreation(),
        testImageUpload()
      ])
      setConnectionResults(conn)
      setPostTestResults(post)
      setImageTestResults(image)
    } catch (error) {
      console.error('All tests error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">系统诊断</h1>
      
      {/* 当前用户状态 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">用户认证状态</h2>
        </div>
        <div className="card-body">
          {currentUser ? (
            <div className="text-green-600">
              ✅ 已登录: {currentUser.email}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ 未登录
            </div>
          )}
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">运行测试</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex gap-4">
            <button
              onClick={runConnectionTest}
              disabled={isLoading}
              className="btn btn-primary"
            >
              测试连接
            </button>
            <button
              onClick={runPostTest}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              测试文章创建
            </button>
            <button
              onClick={runImageTest}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              测试图片上传
            </button>
            <button
              onClick={runUserTest}
              disabled={isLoading}
              className="btn btn-warning"
            >
              测试用户账户
            </button>
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="btn btn-accent"
            >
              运行所有测试
            </button>
          </div>
          
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="spinner"></div>
              <span>正在运行测试...</span>
            </div>
          )}
        </div>
      </div>

      {/* 连接测试结果 */}
      {connectionResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">连接测试结果</h2>
          </div>
          <div className="card-body space-y-3">
            <div className={`flex items-center gap-2 ${connectionResults.auth ? 'text-green-600' : 'text-red-600'}`}>
              {connectionResults.auth ? '✅' : '❌'} 认证连接
            </div>
            <div className={`flex items-center gap-2 ${connectionResults.database ? 'text-green-600' : 'text-red-600'}`}>
              {connectionResults.database ? '✅' : '❌'} 数据库连接
            </div>
            <div className={`flex items-center gap-2 ${connectionResults.storage ? 'text-green-600' : 'text-red-600'}`}>
              {connectionResults.storage ? '✅' : '❌'} 存储连接
            </div>
            
            {connectionResults.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-600 mb-2">错误详情:</h3>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  {connectionResults.errors.map((error: string, index: number) => (
                    <div key={index} className="text-red-700 text-sm">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 文章测试结果 */}
      {postTestResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">文章创建测试结果</h2>
          </div>
          <div className="card-body">
            <div className={`flex items-center gap-2 ${postTestResults.success ? 'text-green-600' : 'text-red-600'}`}>
              {postTestResults.success ? '✅' : '❌'} {postTestResults.message}
            </div>
          </div>
        </div>
      )}

      {/* 图片测试结果 */}
      {imageTestResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">图片上传测试结果</h2>
          </div>
          <div className="card-body">
            <div className={`flex items-center gap-2 ${imageTestResults.success ? 'text-green-600' : 'text-red-600'}`}>
              {imageTestResults.success ? '✅' : '❌'} {imageTestResults.message}
            </div>
          </div>
        </div>
      )}

      {/* 用户测试结果 */}
      {userTestResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">用户账户测试结果</h2>
          </div>
          <div className="card-body space-y-3">
            <div className={`flex items-center gap-2 ${userTestResults.overall ? 'text-green-600' : 'text-red-600'}`}>
              {userTestResults.overall ? '✅' : '❌'} {userTestResults.message}
            </div>
            
            {userTestResults.login && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">登录测试:</h4>
                <div className={`text-sm ${userTestResults.login.success ? 'text-green-600' : 'text-red-600'}`}>
                  {userTestResults.login.message}
                </div>
              </div>
            )}
            
            {userTestResults.permissions && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">权限测试:</h4>
                <div className={`text-sm ${userTestResults.permissions.success ? 'text-green-600' : 'text-red-600'}`}>
                  {userTestResults.permissions.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 常见问题解决方案 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">常见问题解决方案</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <h3 className="font-semibold text-blue-600">1. 认证问题</h3>
            <p className="text-sm text-gray-600">
              确保您已正确登录，检查浏览器控制台是否有认证错误。
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-600">2. 数据库权限问题</h3>
            <p className="text-sm text-gray-600">
              检查 Supabase 控制台中的 RLS 策略设置，确保用户有正确的权限。
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-600">3. 存储桶配置问题</h3>
            <p className="text-sm text-gray-600">
              确保在 Supabase 控制台中创建了 'blog-images' 存储桶，并设置了正确的权限策略。
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-600">4. 网络连接问题</h3>
            <p className="text-sm text-gray-600">
              检查网络连接，确保可以访问 Supabase 域名。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

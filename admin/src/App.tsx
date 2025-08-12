import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Posts } from '@/pages/Posts'
import { PostEditor } from '@/pages/PostEditor'
import { Images } from '@/pages/Images'
import { Settings } from '@/pages/Settings'
import { Diagnostics } from '@/pages/Diagnostics'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 登錄頁面 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保護的路由 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/posts/new" element={<PostEditor />} />
                  <Route path="/posts/edit/:id" element={<PostEditor />} />
                  <Route path="/images" element={<Images />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/diagnostics" element={<Diagnostics />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
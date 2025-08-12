import { supabase } from '@/services/supabase'

// 测试用户登录
export const testUserLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        success: false,
        message: `登录失败: ${error.message}`,
        error: error
      }
    }

    if (data.user) {
      return {
        success: true,
        message: `登录成功: ${data.user.email}`,
        user: data.user
      }
    }

    return {
      success: false,
      message: '登录失败: 未返回用户信息',
      error: null
    }
  } catch (error: any) {
    return {
      success: false,
      message: `登录异常: ${error.message}`,
      error: error
    }
  }
}

// 测试用户权限
export const testUserPermissions = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        message: '用户未登录，无法测试权限',
        error: authError
      }
    }

    // 测试数据库读取权限
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1)

    if (postsError) {
      return {
        success: false,
        message: `数据库读取权限测试失败: ${postsError.message}`,
        error: postsError
      }
    }

    // 测试存储权限
    const { data: storage, error: storageError } = await supabase.storage
      .from('blog-images')
      .list('', { limit: 1 })

    if (storageError) {
      return {
        success: false,
        message: `存储权限测试失败: ${storageError.message}`,
        error: storageError
      }
    }

    return {
      success: true,
      message: '用户权限测试通过',
      user: user,
      permissions: {
        database: true,
        storage: true
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `权限测试异常: ${error.message}`,
      error: error
    }
  }
}

// 完整用户测试
export const runFullUserTest = async (email: string, password: string) => {
  console.log('开始用户测试...')
  
  // 1. 测试登录
  console.log('1. 测试用户登录...')
  const loginResult = await testUserLogin(email, password)
  console.log('登录结果:', loginResult)
  
  if (!loginResult.success) {
    return {
      overall: false,
      login: loginResult,
      permissions: null,
      message: '登录失败，无法继续测试'
    }
  }
  
  // 2. 测试权限
  console.log('2. 测试用户权限...')
  const permissionsResult = await testUserPermissions()
  console.log('权限测试结果:', permissionsResult)
  
  const overall = loginResult.success && permissionsResult.success
  
  return {
    overall,
    login: loginResult,
    permissions: permissionsResult,
    message: overall ? '所有测试通过' : '部分测试失败'
  }
}

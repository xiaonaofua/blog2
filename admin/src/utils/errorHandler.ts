// 统一错误处理工具
export interface AppError {
  code: string
  message: string
  details?: string
  suggestion?: string
}

export const handleSupabaseError = (error: any): AppError => {
  console.error('Supabase error:', error)

  // 网络连接错误
  if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败',
      details: error.message,
      suggestion: '请检查网络连接，确保可以访问 Supabase 服务'
    }
  }

  // 认证错误
  if (error.message?.includes('JWT') || error.message?.includes('auth')) {
    return {
      code: 'AUTH_ERROR',
      message: '认证失败',
      details: error.message,
      suggestion: '请重新登录或检查登录状态'
    }
  }

  // 权限错误
  if (error.message?.includes('RLS') || error.message?.includes('permission')) {
    return {
      code: 'PERMISSION_ERROR',
      message: '权限不足',
      details: error.message,
      suggestion: '请检查数据库权限设置或联系管理员'
    }
  }

  // 存储桶错误
  if (error.message?.includes('bucket') || error.message?.includes('storage')) {
    return {
      code: 'STORAGE_ERROR',
      message: '存储服务错误',
      details: error.message,
      suggestion: '请检查存储桶配置和权限设置'
    }
  }

  // 数据库错误
  if (error.message?.includes('duplicate key') || error.message?.includes('constraint')) {
    return {
      code: 'DATABASE_ERROR',
      message: '数据冲突',
      details: error.message,
      suggestion: '请检查输入数据，确保唯一性约束不被违反'
    }
  }

  // 默认错误
  return {
    code: 'UNKNOWN_ERROR',
    message: '未知错误',
    details: error.message || '没有详细错误信息',
    suggestion: '请查看控制台错误信息或联系技术支持'
  }
}

export const showErrorAlert = (error: AppError) => {
  const message = `${error.message}\n\n${error.suggestion}`
  alert(message)
}

export const logError = (error: AppError, context?: string) => {
  console.group(`错误 [${error.code}] ${context || ''}`)
  console.error('错误信息:', error.message)
  console.error('错误详情:', error.details)
  console.error('解决建议:', error.suggestion)
  console.groupEnd()
}

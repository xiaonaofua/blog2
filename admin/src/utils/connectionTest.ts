import { supabase } from '@/services/supabase'

export const testConnection = async () => {
  const results = {
    auth: false,
    database: false,
    storage: false,
    errors: [] as string[]
  }

  try {
    // 测试认证连接
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      results.errors.push(`认证错误: ${authError.message}`)
    } else {
      results.auth = true
      console.log('当前用户:', user?.email || '未登录')
    }
  } catch (error: any) {
    results.errors.push(`认证连接失败: ${error.message}`)
  }

  try {
    // 测试数据库连接
    const { data, error: dbError } = await supabase
      .from('posts')
      .select('count')
      .limit(1)
    
    if (dbError) {
      results.errors.push(`数据库错误: ${dbError.message}`)
    } else {
      results.database = true
    }
  } catch (error: any) {
    results.errors.push(`数据库连接失败: ${error.message}`)
  }

  try {
    // 测试存储连接
    const { data, error: storageError } = await supabase.storage
      .from('blog-images')
      .list('', { limit: 1 })
    
    if (storageError) {
      results.errors.push(`存储错误: ${storageError.message}`)
    } else {
      results.storage = true
    }
  } catch (error: any) {
    results.errors.push(`存储连接失败: ${error.message}`)
  }

  return results
}

export const testPostCreation = async () => {
  try {
    // 检查用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: '用户未登录，无法测试文章创建' }
    }

    const testPost = {
      title: '测试文章',
      slug: `test-${Date.now()}`,
      content: '这是一个测试文章',
      excerpt: '测试摘要',
      status: 'draft' as const,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([testPost])
      .select()
      .single()

    if (error) {
      throw error
    }

    // 删除测试文章
    await supabase
      .from('posts')
      .delete()
      .eq('id', data.id)

    return { success: true, message: '文章创建测试成功' }
  } catch (error: any) {
    return { success: false, message: `文章创建测试失败: ${error.message}` }
  }
}

export const testImageUpload = async () => {
  try {
    // 检查用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: '用户未登录，无法测试图片上传' }
    }

    // 创建一个测试文件
    const testContent = 'test image content'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    
    // 生成文件路径
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const filePath = `${user.id}/${year}/${month}/test-${Date.now()}.txt`
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, testFile)

    if (error) {
      throw error
    }

    // 删除测试文件
    await supabase.storage
      .from('blog-images')
      .remove([data.path])

    return { success: true, message: '图片上传测试成功' }
  } catch (error: any) {
    return { success: false, message: `图片上传测试失败: ${error.message}` }
  }
}

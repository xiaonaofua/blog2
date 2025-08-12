import { useQuery, useMutation, useQueryClient } from 'react-query'
import { posts, Post } from '@/services/supabase'

// 獲取所有文章
export const usePosts = () => {
  return useQuery('posts', posts.getAll, {
    staleTime: 5 * 60 * 1000, // 5 分鐘
  })
}

// 獲取單個文章
export const usePost = (id?: string) => {
  return useQuery(
    ['post', id],
    () => posts.getById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  )
}

// 創建文章
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => 
      posts.create(post),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts')
      },
    }
  )
}

// 更新文章
export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, ...post }: { id: string } & Partial<Post>) => 
      posts.update(id, post),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('posts')
        queryClient.invalidateQueries(['post', variables.id])
      },
    }
  )
}

// 刪除文章
export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id: string) => posts.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts')
      },
    }
  )
}

// 發布文章
export const usePublishPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id: string) => posts.update(id, { 
      status: 'published',
      published_at: new Date().toISOString()
    }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('posts')
        queryClient.invalidateQueries(['post', variables])
      },
    }
  )
}

// 取消發布文章
export const useUnpublishPost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id: string) => posts.update(id, { 
      status: 'draft',
      published_at: null
    }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('posts')
        queryClient.invalidateQueries(['post', variables])
      },
    }
  )
}
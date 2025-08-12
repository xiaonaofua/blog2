import { useQuery, useMutation, useQueryClient } from 'react-query'
import { images, BlogImage } from '@/services/supabase'

// 獲取所有圖片
export const useImages = () => {
  return useQuery('images', images.getAll, {
    staleTime: 5 * 60 * 1000, // 5 分鐘
  })
}

// 上傳圖片
export const useUploadImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ file, fileName, altText }: { file: File, fileName: string, altText?: string }) => 
      images.upload(file, fileName).then(result => {
        // 如果有 alt 文本，更新數據庫記錄
        if (result.data && altText) {
          return images.update(result.data.id, { alt_text: altText })
        }
        return result
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images')
      },
    }
  )
}

// 刪除圖片
export const useDeleteImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (id: string) => images.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images')
      },
    }
  )
}

// 更新圖片信息
export const useUpdateImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, ...updates }: { id: string } & Partial<BlogImage>) => 
      images.update(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images')
      },
    }
  )
}
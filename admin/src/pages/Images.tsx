import React, { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { useImages, useUploadImage, useDeleteImage, useUpdateImage } from '@/hooks/useImages'
import { format } from 'date-fns'

export const Images: React.FC = () => {
  const { data: imagesData, isLoading } = useImages()
  const uploadImageMutation = useUploadImage()
  const deleteImageMutation = useDeleteImage()
  const updateImageMutation = useUpdateImage()

  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAltText, setEditAltText] = useState('')

  const images = imagesData?.data || []

  const handleUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    
    try {
      await uploadImageMutation.mutateAsync({ file, fileName })
      alert('圖片上傳成功！')
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('上傳失敗：' + (error.message || '未知錯誤'))
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    if (window.confirm(`確定要刪除圖片「${filename}」嗎？此操作無法撤銷。`)) {
      try {
        await deleteImageMutation.mutateAsync(id)
        alert('圖片已刪除')
        if (selectedImage?.id === id) {
          setSelectedImage(null)
        }
      } catch (error: any) {
        console.error('Delete error:', error)
        alert('刪除失敗：' + (error.message || '未知錯誤'))
      }
    }
  }

  const handleEditAltText = (image: any) => {
    setEditingId(image.id)
    setEditAltText(image.alt_text || '')
  }

  const handleSaveAltText = async () => {
    if (!editingId) return

    try {
      await updateImageMutation.mutateAsync({
        id: editingId,
        alt_text: editAltText
      })
      setEditingId(null)
      setEditAltText('')
      alert('Alt 文本已更新')
    } catch (error: any) {
      console.error('Update error:', error)
      alert('更新失敗：' + (error.message || '未知錯誤'))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL 已復制到剪貼板')
    }).catch(() => {
      alert('復制失敗')
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">圖片管理</h1>
        <div className="text-sm text-gray-600">
          總計 {images.length} 張圖片
        </div>
      </div>

      {/* 上傳區域 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">上傳新圖片</h2>
        </div>
        <div className="card-content">
          <ImageUploader
            onUpload={handleUpload}
            isUploading={uploadImageMutation.isLoading}
          />
        </div>
      </div>

      {/* 圖片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="card overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img
                src={image.public_url}
                alt={image.alt_text || image.original_name}
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedImage(image)}
              />
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-medium text-gray-900 truncate" title={image.original_name}>
                  {image.original_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(image.size)} • {format(new Date(image.created_at), 'yyyy-MM-dd')}
                </p>
              </div>

              {/* Alt 文本編輯 */}
              {editingId === image.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="輸入 Alt 文本"
                    className="input text-sm"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleSaveAltText}
                      className="btn btn-primary text-xs flex-1"
                      disabled={updateImageMutation.isLoading}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary text-xs flex-1"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    Alt: {image.alt_text || '無'}
                  </p>
                  <button
                    onClick={() => handleEditAltText(image)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    編輯 Alt 文本
                  </button>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex gap-1">
                <button
                  onClick={() => copyToClipboard(image.public_url)}
                  className="btn btn-secondary text-xs flex-1"
                >
                  復制 URL
                </button>
                <button
                  onClick={() => handleDelete(image.id, image.original_name)}
                  className="btn btn-ghost text-xs text-red-600 hover:text-red-700"
                  disabled={deleteImageMutation.isLoading}
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-gray-500 text-lg">還沒有上傳任何圖片</p>
          <p className="text-gray-400 text-sm mt-2">使用上面的上傳區域來添加您的第一張圖片</p>
        </div>
      )}

      {/* 圖片預覽模態框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedImage.original_name}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={selectedImage.public_url}
                alt={selectedImage.alt_text || selectedImage.original_name}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">文件大小：</span>
                    <span>{formatFileSize(selectedImage.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">上傳時間：</span>
                    <span>{format(new Date(selectedImage.created_at), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">URL：</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={selectedImage.public_url}
                      readOnly
                      className="input text-xs flex-1"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedImage.public_url)}
                      className="btn btn-secondary text-xs"
                    >
                      復制
                    </button>
                  </div>
                </div>

                {selectedImage.alt_text && (
                  <div>
                    <span className="text-gray-600">Alt 文本：</span>
                    <span>{selectedImage.alt_text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  className?: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  isUploading = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isUploading) {
        const file = acceptedFiles[0]
        try {
          await onUpload(file)
        } catch (error) {
          console.error('Upload error:', error)
        }
      }
    },
    [onUpload, isUploading]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: isUploading
  })

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
        ${isDragActive 
          ? 'border-primary-400 bg-primary-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-2">
        <div className="text-6xl">📸</div>
        
        {isUploading ? (
          <div>
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">正在上傳...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? '釋放以上傳圖片' : '拖拽圖片到這裡'}
            </p>
            <p className="text-sm text-gray-600">
              或者 <span className="text-primary-600 font-medium">點擊選擇文件</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              支持 JPG、PNG、GIF、WebP 格式，最大 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  onImageUpload?: (file: File) => Promise<string>
}

const MenuBar: React.FC<{ editor: any; onImageUpload?: (file: File) => Promise<string> }> = ({ 
  editor, 
  onImageUpload 
}) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && onImageUpload) {
        try {
          const url = await onImageUpload(file)
          editor.chain().focus().setImage({ src: url }).run()
        } catch (error) {
          console.error('Error uploading image:', error)
          alert('圖片上傳失敗')
        }
      }
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('請輸入鏈接 URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="editor-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`editor-button ${editor.isActive('bold') ? 'is-active' : ''}`}
        type="button"
        title="粗體"
      >
        <strong>B</strong>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`editor-button ${editor.isActive('italic') ? 'is-active' : ''}`}
        type="button"
        title="斜體"
      >
        <em>I</em>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`editor-button ${editor.isActive('code') ? 'is-active' : ''}`}
        type="button"
        title="代碼"
      >
        {'</>'}
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`editor-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
        type="button"
        title="標題 1"
      >
        H1
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`editor-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        type="button"
        title="標題 2"
      >
        H2
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`editor-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
        type="button"
        title="標題 3"
      >
        H3
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`editor-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        type="button"
        title="無序列表"
      >
        •
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`editor-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        type="button"
        title="有序列表"
      >
        1.
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`editor-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        type="button"
        title="引用"
      >
        &quot;
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={setLink}
        className={`editor-button ${editor.isActive('link') ? 'is-active' : ''}`}
        type="button"
        title="鏈接"
      >
        🔗
      </button>
      
      {onImageUpload && (
        <button
          onClick={addImage}
          className="editor-button"
          type="button"
          title="插入圖片"
        >
          🖼️
        </button>
      )}
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="editor-button"
        type="button"
        title="撤銷"
      >
        ↶
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="editor-button"
        type="button"
        title="重做"
      >
        ↷
      </button>
    </div>
  )
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ 
  content, 
  onChange, 
  onImageUpload 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  // 當 content 從外部更新時同步編輯器內容
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border border-gray-200 rounded-lg">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  )
}
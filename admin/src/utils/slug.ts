import slugify from 'slugify'

export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export const extractExcerpt = (content: string, maxLength: number = 200): string => {
  // 移除 HTML 標籤
  const textContent = content.replace(/<[^>]*>/g, '')
  
  // 截取指定長度
  if (textContent.length <= maxLength) {
    return textContent
  }
  
  // 在單詞邊界截取
  const truncated = textContent.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}
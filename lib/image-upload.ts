// Image upload utilities with multiple free providers

// Option 1: Base64 (Current implementation - completely free)
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Option 2: ImgBB (Free tier - unlimited storage)
export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!apiKey) throw new Error('ImgBB API key not configured')

  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', apiKey)

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')

    const data = await response.json()
    return data.data.url
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw error
  }
}

// Option 3: Cloudinary (Free tier - 25GB storage)
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config not set')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) throw new Error('Upload failed')

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

// Option 4: Supabase Storage (Free tier - 1GB storage)
export const uploadToSupabase = async (file: File, userId: string): Promise<string> => {
  // You'll need to install @supabase/supabase-js
  // npm install @supabase/supabase-js
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase config not set')
  }

  // This is just a template - you'd need to implement the actual Supabase client
  /*
  import { createClient } from '@supabase/supabase-js'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const fileName = `products/${userId}_${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: publicUrl } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return publicUrl.publicUrl
  */
  
  throw new Error('Supabase implementation needed')
}

// Image compression utility to reduce file size
export const compressImage = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      
      let { width, height } = img
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height)
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

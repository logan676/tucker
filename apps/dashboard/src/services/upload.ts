import api from './api'

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

export type ImageType = 'logo' | 'banner' | 'product' | 'document' | 'general'

export const uploadApi = {
  uploadImage: async (
    file: File,
    folder: string = 'general',
    type: ImageType = 'general'
  ): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('type', type)

    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadImages: async (
    files: File[],
    folder: string = 'general',
    type: ImageType = 'general'
  ): Promise<UploadResult[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('folder', folder)
    formData.append('type', type)

    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage: async (publicId: string): Promise<void> => {
    return api.delete(`/upload/image/${encodeURIComponent(publicId)}`)
  },
}

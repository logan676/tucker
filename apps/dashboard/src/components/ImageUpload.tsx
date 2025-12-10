import { useState } from 'react'
import { Upload, message, Spin } from 'antd'
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import type { RcFile, UploadProps } from 'antd/es/upload'
import { uploadApi, type ImageType } from '@/services/upload'

interface ImageUploadProps {
  value?: string
  onChange?: (url: string | undefined) => void
  folder?: string
  imageType?: ImageType
  width?: number | string
  height?: number | string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  imageType = 'general',
  width = 104,
  height = 104,
  placeholder = 'Upload',
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!')
      return false
    }

    return true
  }

  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options

    setLoading(true)
    try {
      const result = await uploadApi.uploadImage(file as File, folder, imageType)
      onChange?.(result.url)
      onSuccess?.(result)
      message.success('Image uploaded successfully')
    } catch (error) {
      onError?.(error as Error)
      message.error('Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onChange?.(undefined)
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{placeholder}</div>
    </div>
  )

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Upload
        name="file"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={customUpload}
        style={{ width, height }}
      >
        {value ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={value}
              alt="uploaded"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spin />
              </div>
            )}
          </div>
        ) : (
          uploadButton
        )}
      </Upload>
      {value && (
        <DeleteOutlined
          onClick={handleRemove}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            cursor: 'pointer',
            color: '#ff4d4f',
            fontSize: 16,
            background: 'white',
            borderRadius: '50%',
            padding: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
      )}
    </div>
  )
}

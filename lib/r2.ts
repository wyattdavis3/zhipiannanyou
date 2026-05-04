import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  signatureVersion: 'v4',
  forcePathStyle: true,
})

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/png'
): Promise<string> {
  console.log('[R2 uploadToR2] 开始上传文件:', fileName)
  console.log('[R2 uploadToR2] 文件大小:', fileBuffer.length, 'bytes')
  console.log('[R2 uploadToR2] Content-Type:', contentType)
  console.log('[R2 uploadToR2] Bucket:', process.env.R2_BUCKET_NAME)
  
  try {
    const result = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      })
    )
    console.log('[R2 uploadToR2] 上传成功，响应:', JSON.stringify(result, null, 2))
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`
    console.log('[R2 uploadToR2] 生成永久链接:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('[R2 uploadToR2] 上传失败 =======================')
    console.error('[R2 uploadToR2] 错误类型:', (error as Error).constructor.name)
    console.error('[R2 uploadToR2] 错误消息:', (error as Error).message)
    console.error('[R2 uploadToR2] 错误详情:', JSON.stringify(error, null, 2))
    throw error
  }
}

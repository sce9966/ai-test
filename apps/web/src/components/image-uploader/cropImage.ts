/**
 * 图片裁剪区域（相对原图像素）。
 */
export interface CropArea {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 加载图片元素。
 *
 * @param src 图片地址或 Data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('图片加载失败')))
    image.src = src
  })
}

/**
 * 按裁剪区域从源图生成 JPEG Blob。
 *
 * @param imageSrc 源图地址
 * @param crop 裁剪区域
 */
export async function cropImageToBlob(imageSrc: string, crop: CropArea): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const width = Math.max(1, Math.round(crop.width))
  const height = Math.max(1, Math.round(crop.height))
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建画布')
  }

  ctx.drawImage(image, crop.left, crop.top, crop.width, crop.height, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new Error('裁剪失败'))
      },
      'image/jpeg',
      0.92,
    )
  })
}

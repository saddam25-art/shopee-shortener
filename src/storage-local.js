import fs from 'fs'
import path from 'path'
import { getImagesDir } from './db/local-db.js'

export async function uploadImage(fileBuffer, filename) {
  const imagesDir = getImagesDir()
  const filePath = path.join(imagesDir, filename)
  
  fs.writeFileSync(filePath, fileBuffer)
  
  // Return local URL path
  return `/images/${filename}`
}

export async function deleteImage(filename) {
  const imagesDir = getImagesDir()
  const filePath = path.join(imagesDir, filename)
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export function getImagePath(filename) {
  const imagesDir = getImagesDir()
  return path.join(imagesDir, filename)
}

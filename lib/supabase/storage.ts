import { createAdminClient } from './server'

/**
 * Upload a file to the media bucket
 * Returns the public URL of the uploaded file
 */
export async function uploadMedia(
  file: File,
  folder: 'challenges' | 'assignments' | 'clients' | 'announcements' = 'assignments'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createAdminClient()

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`

    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return { url: null, error: error.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Unexpected error uploading file:', err)
    return { url: null, error: 'Failed to upload file' }
  }
}

/**
 * Delete a file from the media bucket
 */
export async function deleteMedia(url: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient()

    // Extract the path from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/media/')

    if (pathParts.length !== 2) {
      return { success: false, error: 'Invalid media URL' }
    }

    const filePath = decodeURIComponent(pathParts[1])

    const { error } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Unexpected error deleting file:', err)
    return { success: false, error: 'Failed to delete file' }
  }
}

/**
 * Get media bucket info and stats
 */
export async function getMediaBucketInfo(): Promise<{
  exists: boolean
  public: boolean
  fileCount?: number
  error?: string
}> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.storage.getBucket('media')

    if (error) {
      return { exists: false, public: false, error: error.message }
    }

    // List files to get count
    const { data: files } = await supabase.storage.from('media').list()

    return {
      exists: true,
      public: data.public,
      fileCount: files?.length ?? 0,
    }
  } catch (err) {
    return { exists: false, public: false, error: 'Failed to get bucket info' }
  }
}

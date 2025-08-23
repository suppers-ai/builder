import { jsonResponse, errorResponse, getSupabaseClient } from "../../_common/index.ts";

export async function handleImageUpload(req: Request, context: { userId: string }): Promise<Response> {
  const origin = req.headers.get('origin');
  const { userId } = context;
  
  if (!userId) {
    return errorResponse('Authentication required', { status: 401, origin: origin || undefined });
  }
  
  try {
    const supabase = getSupabaseClient();

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', { status: 400, origin: origin || undefined });
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return errorResponse('File too large (max 10MB)', { status: 400, origin: origin || undefined });
    }

    if (!file.type.startsWith('image/')) {
      return errorResponse('File must be an image', { status: 400, origin: origin || undefined });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `payments/${userId}/${timestamp}-${randomId}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('application-files')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return errorResponse('Failed to upload file', { status: 500, origin: origin || undefined });
    }

    // Create storage_objects record with is_public=true for payment images
    const { data: storageObject, error: dbError } = await supabase
      .from('storage_objects')
      .insert({
        user_id: userId,
        name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        is_public: true, // Make payment images publicly accessible
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          purpose: 'payments',
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to create storage object record:', dbError);
      // Continue anyway, file is uploaded
    }

    // Generate public share URL for the image
    const shareUrl = `http://localhost:54321/functions/v1/api/share/file/${storageObject?.id || fileName}`;
    
    // Also generate direct storage URL as fallback
    const { data: { publicUrl } } = supabase.storage
      .from('application-files')
      .getPublicUrl(fileName);
    
    // Fix URL for local development - replace kong:8000 with localhost:54321
    const fixedUrl = publicUrl.replace('kong:8000', 'localhost:54321');

    return jsonResponse({
      success: true,
      url: shareUrl, // Use share URL which checks is_public flag
      directUrl: fixedUrl, // Fallback direct storage URL
      storageObjectId: storageObject?.id,
      fileName: data.path
    }, { origin: origin || undefined });

  } catch (error) {
    console.error('Upload handler error:', error);
    return errorResponse('Internal server error', { status: 500, origin: origin || undefined });
  }
}
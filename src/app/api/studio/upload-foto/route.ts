import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import fs from 'fs-extra';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

let siteAssetsBucketCreated = false;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    const uploadedPhotos: Array<{
      id: string;
      url: string;
      proxyUrl?: string;
      title: string;
      source: 'google' | 'instagram' | 'web';
    }> = [];

    const supabase = getSupabaseAdmin();

    // Garante que o bucket 'site-assets' exista no Supabase Storage
    if (supabase && !siteAssetsBucketCreated) {
      try {
        await supabase.storage.createBucket('site-assets', { public: true });
        siteAssetsBucketCreated = true;
      } catch (_) {
        siteAssetsBucketCreated = true;
      }
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name || `foto-${Date.now()}-${i}.jpg`;
      const cleanName = originalName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9.]+/g, '-');

      const contentType = file.type || 'image/jpeg';
      let uploadedUrl = '';

      // 1. Tenta upload no Supabase Storage (bucket 'site-assets')
      if (supabase) {
        try {
          const filePath = `uploads/${Date.now()}-${i}-${cleanName}`;
          const { data, error } = await supabase.storage
            .from('site-assets')
            .upload(filePath, buffer, {
              contentType,
              upsert: true
            });

          if (!error && data) {
            const { data: pubData } = supabase.storage
              .from('site-assets')
              .getPublicUrl(filePath);
            if (pubData?.publicUrl) {
              uploadedUrl = pubData.publicUrl;
            }
          }
        } catch (stErr: any) {
          console.warn('[Upload Foto] Erro Supabase Storage:', stErr?.message);
        }
      }

      // 2. Fallback: salva localmente em public/uploads se o Supabase não estiver configurado
      if (!uploadedUrl) {
        try {
          const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.ensureDir(publicUploadsDir);
          const localFileName = `${Date.now()}-${i}-${cleanName}`;
          const localFilePath = path.join(publicUploadsDir, localFileName);
          await fs.writeFile(localFilePath, buffer);
          uploadedUrl = `/uploads/${localFileName}`;
        } catch (fsErr: any) {
          console.warn('[Upload Foto] Erro FS local:', fsErr?.message);
        }
      }

      if (uploadedUrl) {
        uploadedPhotos.push({
          id: `upload_${Date.now()}_${i}`,
          url: uploadedUrl,
          proxyUrl: uploadedUrl,
          title: originalName.replace(/\.[^/.]+$/, ''),
          source: 'google'
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: uploadedPhotos.length,
      photos: uploadedPhotos
    });
  } catch (error: any) {
    console.error('[API Upload Foto] Erro:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao processar upload.' },
      { status: 500 }
    );
  }
}

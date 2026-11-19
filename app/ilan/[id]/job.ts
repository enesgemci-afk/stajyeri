import { cache } from 'react';
import { supabase } from '@/lib/supabaseClient';

// İlan detayı: layout (meta + JSON-LD) ve page (SSR içerik) aynı sorguyu
// paylaşsın diye React cache ile sarıldı — istek başına tek DB çağrısı.
export interface JobDetailData {
  id: string;
  title: string;
  description: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota: number;
  has_lunch: boolean;
  has_shuttle: boolean;
  created_at: string;
  is_active: boolean | null;
  company_id?: string | null;
  company_details?: {
    company_name: string;
    has_master_trainer: boolean;
    logo_url?: string | null;
    logo_color?: string | null;
  } | null;
}

export const getJobForPage = cache(async (id: string): Promise<JobDetailData | null> => {
  const { data, error } = await supabase
    .from('job_posts')
    .select(
      `*,
      company_details (
        company_name,
        has_master_trainer,
        logo_url,
        logo_color
      )`
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as JobDetailData;
});

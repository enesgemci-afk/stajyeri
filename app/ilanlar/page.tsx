import { supabase } from '@/lib/supabaseClient';
import IlanlarClient from './IlanlarClient';

// Sayfa her istekte taze ilan listesiyle sunucuda oluşturulur (SEO + hız).
export const dynamic = 'force-dynamic';

interface JobPost {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota?: number | null;
  has_lunch?: boolean;
  has_shuttle?: boolean;
  created_at?: string;
  company_details?: {
    company_name?: string;
    logo_url?: string | null;
    logo_color?: string | null;
  } | null;
}

export default async function IlanlarPage() {
  const { data } = await supabase
    .from('job_posts')
    .select(
      `id, title, field_name, program_type, city, district, quota, has_lunch, has_shuttle,
       wage_info, created_at,
       company_details ( company_name, logo_url, logo_color )`
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return <IlanlarClient initialJobs={(data ?? []) as unknown as JobPost[]} />;
}
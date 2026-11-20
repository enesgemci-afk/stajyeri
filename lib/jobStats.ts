import { supabase } from '@/lib/supabaseClient';

/** Aktif ilan sayısını her istekte DB'den okur (SSR metadata/sitemap için). */
export async function getActiveJobCount(): Promise<number> {
  const { count, error } = await supabase
    .from('job_posts')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  if (error) return 0;
  return count ?? 0;
}

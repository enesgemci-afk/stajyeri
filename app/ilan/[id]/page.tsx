import IlanClient from './IlanClient';
import { getJobForPage } from './job';

interface Props {
  params: Promise<{ id: string }>;
}

// Sunucu bileşeni: ilanı önceden çeker, böylece başlık/açıklama şirket ve şehir
// bilgisiyle birlikte SSR HTML'ine girer (arama motorları boş sayfa görmesin).
export default async function IlanDetayPage({ params }: Props) {
  const { id } = await params;
  const job = await getJobForPage(id);

  return <IlanClient initialJob={job} />;
}

import AdPlacement from './AdPlacement';

/** İlan listesinde her 6 kart sonrası için; 8+ ilan yoksa feed reklamı üretmez. */
export default function JobFeedAd({ route, jobCount, index }: { route: '/' | '/ilanlar'; jobCount: number; index: number }) {
  if (jobCount < 8 || (index + 1) % 6 !== 0) return null;
  return (
    <div className="md:col-span-2">
      <AdPlacement route={route} slot={route === '/' ? 'home-in-feed-fluid' : 'jobs-in-feed-fluid'} />
    </div>
  );
}

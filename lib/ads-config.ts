export type AdPlacement = {
  slot: string;
  format: 'horizontal' | 'rectangle' | 'vertical' | 'fluid';
  layout?: 'in-article' | 'in-feed';
  label?: boolean;
};

/** Sayfa deseni → izinli reklam yerleşimleri (tek gerçek kaynak). */
export const AD_PLACEMENTS: Record<string, AdPlacement[]> = {
  '/blog/[slug]': [
    { slot: 'blog-second-paragraph-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'blog-end-horizontal', format: 'horizontal' },
    { slot: 'blog-sidebar-rectangle', format: 'rectangle' },
  ],
  '/mesem': [
    { slot: 'mesem-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'mesem-end-horizontal', format: 'horizontal' },
  ],
  '/imep': [
    { slot: 'imep-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'imep-end-horizontal', format: 'horizontal' },
  ],
  '/meslek': [
    { slot: 'meslek-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'meslek-end-horizontal', format: 'horizontal' },
  ],
  '/meslek/[alan]': [
    { slot: 'meslek-alan-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'meslek-alan-end-horizontal', format: 'horizontal' },
  ],
  '/rehber/mulakat-provasi': [
    { slot: 'prova-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'prova-end-horizontal', format: 'horizontal' },
  ],
  '/rehber/mulakat-sorulari': [
    { slot: 'sorular-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'sorular-end-horizontal', format: 'horizontal' },
  ],
  '/rehber/onyazi': [
    { slot: 'onyazi-mid-fluid', format: 'fluid', layout: 'in-article' },
    { slot: 'onyazi-end-horizontal', format: 'horizontal' },
  ],
  '/staj-ucretleri': [
    { slot: 'wage-result-fluid', format: 'fluid' },
  ],
  '/alan-secim': [
    { slot: 'alan-result-fluid', format: 'fluid' },
  ],
  '/patika': [
    { slot: 'patika-result-fluid', format: 'fluid' },
  ],
  '/ilanlar': [
    { slot: 'jobs-in-feed-fluid', format: 'fluid', layout: 'in-feed' },
    { slot: 'jobs-empty-horizontal', format: 'horizontal' },
  ],
  '/': [
    { slot: 'home-in-feed-fluid', format: 'fluid', layout: 'in-feed' },
    { slot: 'home-empty-horizontal', format: 'horizontal' },
  ],
  '/ilan/[id]': [
    { slot: 'job-detail-end-horizontal', format: 'horizontal' },
    { slot: 'job-detail-sidebar-rectangle', format: 'rectangle' },
  ],
};

export function getAdPlacement(route: string, slot: string): AdPlacement | undefined {
  return AD_PLACEMENTS[route]?.find((p) => p.slot === slot);
}

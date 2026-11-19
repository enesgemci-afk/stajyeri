import { serializeJsonLd } from '@/lib/seo';

// JSON-LD'yi sayfaya güvenli biçimde gömer (Next.js dokümanı: native <script>).
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

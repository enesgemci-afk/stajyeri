import AdSlot from './AdSlot';
import { getAdPlacement } from '@/lib/ads-config';

/** Config kaydındaki tek yerleşimi üretir; tanımsızsa hiçbir şey göstermez. */
export default function AdPlacement({ route, slot }: { route: string; slot: string }) {
  const placement = getAdPlacement(route, slot);
  if (!placement) return null;
  return <AdSlot {...placement} />;
}

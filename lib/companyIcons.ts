// Hazır işletme sembolleri: logosu olmayan işletmeler ilan verirken bunlardan seçebilir.
// Seçim, company_details.logo_url alanina 'icon:<key>' metni olarak kaydedilir;
// JobCard / ilan detayindaki CompanyAvatar bunu goruntuye cevirir (SQL degisikligi gerektirmez).
import {
  Factory,
  Building2,
  Car,
  Zap,
  Wrench,
  ChefHat,
  Laptop,
  Scissors,
  Shirt,
  Hammer,
  Truck,
  Flower2,
  Camera,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';

export interface CompanyIconPreset {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** MESEM alanlarina uygun 14 hazir sembol */
export const COMPANY_ICON_PRESETS: CompanyIconPreset[] = [
  { key: 'factory', label: 'Fabrika / Üretim', Icon: Factory },
  { key: 'building', label: 'İnşaat', Icon: Building2 },
  { key: 'car', label: 'Otomotiv', Icon: Car },
  { key: 'zap', label: 'Elektrik / Elektronik', Icon: Zap },
  { key: 'wrench', label: 'Teknik Servis', Icon: Wrench },
  { key: 'chef', label: 'Gastronomi', Icon: ChefHat },
  { key: 'laptop', label: 'Bilişim', Icon: Laptop },
  { key: 'scissors', label: 'Kuaför / Terzilik', Icon: Scissors },
  { key: 'shirt', label: 'Tekstil / Konfeksiyon', Icon: Shirt },
  { key: 'hammer', label: 'Marangozluk / Mobilya', Icon: Hammer },
  { key: 'truck', label: 'Lojistik / Taşımacılık', Icon: Truck },
  { key: 'flower', label: 'Tarım / Peyzaj', Icon: Flower2 },
  { key: 'camera', label: 'Medya / Fotoğraf', Icon: Camera },
  { key: 'gym', label: 'Spor', Icon: Dumbbell },
];

/** logo_url 'icon:<key>' ise ilgili hazir sembolu dondurur; degilse null. */
export function resolveCompanyIcon(logoUrl?: string | null): CompanyIconPreset | null {
  if (!logoUrl || !logoUrl.startsWith('icon:')) return null;
  const key = logoUrl.slice('icon:'.length);
  return COMPANY_ICON_PRESETS.find((p) => p.key === key) ?? null;
}

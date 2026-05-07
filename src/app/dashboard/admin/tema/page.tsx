export const dynamic = "force-dynamic";

import { getSiteSettings } from "@/lib/siteSettings";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";

export default async function TemaPage() {
  const settings = await getSiteSettings();
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tema & Görünüm</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform genelinde görünümü özelleştir — değişiklikler anında önizlenir
        </p>
      </div>
      <ThemeCustomizer initial={settings} />
    </div>
  );
}

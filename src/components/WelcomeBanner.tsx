"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function WelcomeBanner({
  name,
  dashboardHref,
}: {
  name: string;
  dashboardHref: string;
}) {
  return (
    <div className="bg-gradient-to-r from-[#0a7ea4] to-[#0891b2] rounded-2xl p-6 mb-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold text-lg">
              Hoş geldin{name ? `, ${name.split(" ")[0]}` : ""}!
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            Acentelerin seni bulabilmesi için profilini tamamla. Ne kadar detaylı
            olursa o kadar çok fırsat gelir.
          </p>
        </div>
        <Link
          href={dashboardHref}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-medium whitespace-nowrap"
        >
          Panele Geç
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 bg-white/20 rounded-full h-1.5">
          <div className="bg-yellow-300 h-1.5 rounded-full w-1/5" />
        </div>
        <span className="text-xs text-white/70">%20 tamamlandı</span>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RehberAra } from "@/components/RehberAra";

export default async function RehberBulPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--upe-ink)" }}>Rehber Bul</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-3)" }}>
          Tarih, şehir ve uzmanlığa göre müsait rehber ara. Profiller doğrudan size yönlendirilir.
        </p>
      </div>
      <Suspense>
        <RehberAra />
      </Suspense>
    </div>
  );
}

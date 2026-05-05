import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";

// getServerSession may return null or Session; null case has no .user
type MaybeSession = { user?: { role?: string; adminId?: string; id?: string } } | null;

function isAdmin(session: MaybeSession) {
  return session?.user?.role === "ADMIN" || !!session?.user?.adminId;
}

export async function GET() {
  const settings = await getSiteSettings();
  return Response.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Yetkisiz" }, { status: 403 });

  const body = await req.json() as Record<string, string>;
  const u = (session as MaybeSession)!.user!;
  const adminId = u.adminId ?? u.id ?? "unknown";

  const updates = Object.entries(body).map(([key, value]) =>
    prisma.siteSettings.upsert({
      where: { key },
      update: { value, updatedBy: adminId },
      create: { key, value, updatedBy: adminId },
    })
  );

  await prisma.$transaction(updates);
  return Response.json({ ok: true });
}

import { Resend } from "resend";

const FROM = "RehberSepeti <onboarding@resend.dev>";

export async function sendWelcomeEmail({
  to,
  name,
  role,
}: {
  to: string;
  name: string;
  role: "REHBER" | "ACENTE";
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const isRehber = role === "REHBER";
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://rehbersepeti.com";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `RehberSepeti'ne hoş geldin, ${name}! 🎉`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0a7ea4;padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px">
              Rehber<span style="color:#FFD93D">Sepeti</span>
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600">
              Hoş geldin, ${name}! 👋
            </h2>
            <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6">
              ${isRehber
                ? "RehberSepeti'ne <strong>Tur Rehberi</strong> olarak katıldın. Profilini tamamla, hizmet verdiğin ülkeleri ve uzmanlık alanlarını ekle — acenteler seni bulsun."
                : "RehberSepeti'ne <strong>Seyahat Acentesi</strong> olarak katıldın. Profil bilgilerini tamamla ve rehber arama aracıyla ihtiyacın olan rehberi bul."
              }
            </p>

            ${isRehber ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:12px;padding:20px;margin-bottom:28px">
              <tr><td>
                <p style="margin:0 0 10px;color:#0a7ea4;font-size:14px;font-weight:600">📋 Profilini tamamlamak için:</p>
                <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2">
                  <li>Biyografi ve şehir bilgisi ekle</li>
                  <li>Konuştuğun dilleri seç</li>
                  <li>Uzmanlık alanlarını belirt</li>
                  <li>Hizmet vereceğin ülke lisanslarını yükle</li>
                </ul>
              </td></tr>
            </table>
            ` : `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:12px;padding:20px;margin-bottom:28px">
              <tr><td>
                <p style="margin:0 0 10px;color:#0a7ea4;font-size:14px;font-weight:600">📋 Başlamak için:</p>
                <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2">
                  <li>Şirket profilini tamamla</li>
                  <li>Rehber Bul aracıyla rehber ara</li>
                  <li>Beğendiğin rehberle direkt mesajlaş</li>
                </ul>
              </td></tr>
            </table>
            `}

            <a href="${baseUrl}/dashboard"
               style="display:inline-block;background:#0a7ea4;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px">
              Panelime Git →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">
              © 2025 RehberSepeti · Bu maili almak istemiyorsan
              <a href="${baseUrl}" style="color:#9ca3af">buradan</a> ulaş.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

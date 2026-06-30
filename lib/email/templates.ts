// ─── Email HTML Templates ────────────────────────────────────

export function approvalRequestEmail({
  clientName,
  clientEmail,
  approveUrl,
  rejectUrl,
}: {
  clientName: string;
  clientEmail: string;
  approveUrl: string;
  rejectUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle inscription — Coachdazet Formation</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1B2B5E;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:400;letter-spacing:0.5px;">
                Coachdazet <span style="color:#C0603A;">Formation</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1B2B5E;font-size:20px;">
                Nouvelle inscription en attente
              </h2>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 8px;">
                <strong>${clientName}</strong> vient de s'inscrire sur la plateforme de formation.
              </p>
              <p style="color:#6B7280;font-size:14px;margin:0 0 32px;">
                Email : ${clientEmail}
              </p>

              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Avant d'approuver, vérifiez que ce client a bien effectué son paiement, puis cliquez sur le bouton correspondant :
              </p>

              <!-- Approve Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:#1B2B5E;border-radius:8px;padding:14px 32px;">
                    <a href="${approveUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:block;">
                      ✅ Approuver l'accès
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Reject Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border:2px solid #1B2B5E;border-radius:8px;padding:12px 32px;">
                    <a href="${rejectUrl}" style="color:#1B2B5E;font-size:15px;font-weight:600;text-decoration:none;display:block;">
                      ❌ Refuser l'accès
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9CA3AF;font-size:12px;margin:32px 0 0;line-height:1.6;">
                Ces liens sont à usage unique et expirent dans 7 jours. Si vous avez déjà traité cette demande, ignorez cet email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F5F5;padding:20px 40px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                Coachdazet Formation · formation.coachdazet.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function welcomeEmail({ clientName }: { clientName: string }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue sur Coachdazet Formation</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1B2B5E;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:400;letter-spacing:0.5px;">
                Coachdazet <span style="color:#C0603A;">Formation</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1B2B5E;font-size:24px;">
                Bienvenue, ${clientName} ! 🎉
              </h2>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Votre accès à la formation <strong>Finances Personnelles Coachdazet</strong> vient d'être activé.
              </p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 32px;">
                Vous avez maintenant accès à l'ensemble des 5 modules et à toutes les ressources complémentaires.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#C0603A;border-radius:8px;padding:14px 32px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:block;">
                      Accéder à ma formation →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9CA3AF;font-size:13px;margin:32px 0 0;line-height:1.6;">
                Si vous avez des questions, répondez directement à cet email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F5F5;padding:20px 40px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                Coachdazet Formation · formation.coachdazet.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function rejectionEmail({ clientName }: { clientName: string }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Information — Coachdazet Formation</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1B2B5E;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:400;">
                Coachdazet <span style="color:#C0603A;">Formation</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1B2B5E;font-size:20px;">Bonjour ${clientName},</h2>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Nous n'avons pas pu valider votre accès à la formation pour le moment.
              </p>
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez régulariser votre situation, répondez directement à cet email ou contactez-nous via le site <a href="https://www.coachdazet.com" style="color:#1B2B5E;">coachdazet.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#F5F5F5;padding:20px 40px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">Coachdazet Formation</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function passwordResetEmail({
  resetUrl,
}: {
  resetUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1B2B5E;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:400;">
                Coachdazet <span style="color:#C0603A;">Formation</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1B2B5E;font-size:20px;">Réinitialisation du mot de passe</h2>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1B2B5E;border-radius:8px;padding:14px 32px;">
                    <a href="${resetUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:block;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

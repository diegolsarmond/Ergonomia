import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"ERGOMINAS" <${from}>`,
    to,
    subject: 'Redefinição de senha — ERGOMINAS',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
    <div style="background:linear-gradient(to right,#14b8a6,#06b6d4);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ERGOMINAS</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Sistema de Avaliação Ergonômica</p>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:18px;">Redefinição de senha</h2>
      <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:14px 28px;background:linear-gradient(to right,#14b8a6,#06b6d4);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
        Redefinir minha senha
      </a>
      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
        Este link expira em <strong style="color:#94a3b8;">1 hora</strong>.
        Se você não solicitou a redefinição de senha, ignore este e-mail — sua senha permanece a mesma.
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="margin:0;color:#475569;font-size:12px;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${resetUrl}" style="color:#14b8a6;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

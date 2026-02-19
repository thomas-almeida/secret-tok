export const affiliateCommissionTemplate = (user, data) => {
  const { name, email } = user;
  const { newBalance, totalAssociated } = data;
  const balanceFormatted = (newBalance / 100).toFixed(2).replace('.', ',');
  const frontendUrl = process.env.FRONTEND_URL || 'https://rapidinhas.vercel.app';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Comissão</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #171717; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🎉 Nova Venda Realizada!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 18px; line-height: 1.5;">
                Olá, <strong>${name}</strong>!
              </p>
              
              <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 16px; line-height: 1.5;">
                Uma nova venda foi realizada através do seu link de afiliado. 
                Sua comissão foi adicionada ao seu saldo com sucesso!
              </p>

              <!-- Stats Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #262626; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Total de Referenciados
                    </p>
                    <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      ${totalAssociated} 👥
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px 20px 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Saldo Atual
                    </p>
                    <p style="margin: 0; color: #22c55e; font-size: 28px; font-weight: bold;">
                      R$ ${balanceFormatted}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top: 10px;">
                    <a href="${frontendUrl}/afiliate" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; width: 100%; box-sizing: border-box; text-align: center;">
                      Ver Meu Painel de Afiliado
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © 2025 Rapidinhas. Todos os direitos reservados.
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

  const text = `
🎉 Nova Venda Realizada!

Olá, ${name}!

Uma nova venda foi realizada através do seu link de afiliado. 
Sua comissão foi adicionada ao seu saldo com sucesso!

Total de Referenciados: ${totalAssociated}
Saldo Atual: R$ ${balanceFormatted}

Acesse seu painel: ${frontendUrl}/afiliate
  `.trim();

  return {
    subject: `Parabéns ${name}, você vendeu! 🎉`,
    html,
    text
  };
};

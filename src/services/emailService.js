const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient, emailConfig, isSESConfigured } = require('../config/ses');

/**
 * Email Service for LusitanEstate
 * Handles all email sending via Amazon SES
 */

// Email Templates
const templates = {
  // Email Verification Template
  verification: (name, verificationUrl) => ({
    subject: 'Verifique o seu email - LusitanEstate',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LusitanEstate</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Plataforma Imobiliária de Portugal</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Olá ${name}!</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                Bem-vindo à LusitanEstate! Para completar o seu registo e começar a utilizar a nossa plataforma, por favor verifique o seu endereço de email clicando no botão abaixo.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verificar Email
                </a>
              </div>
              <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Se não conseguir clicar no botão, copie e cole o seguinte link no seu navegador:
              </p>
              <p style="color: #0066cc; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este link expira em 24 horas. Se não solicitou esta verificação, pode ignorar este email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} LusitanEstate. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${name}!\n\nBem-vindo à LusitanEstate! Para completar o seu registo, verifique o seu email visitando: ${verificationUrl}\n\nEste link expira em 24 horas.\n\n© ${new Date().getFullYear()} LusitanEstate`
  }),

  // Password Reset Template
  passwordReset: (name, resetUrl) => ({
    subject: 'Redefinir palavra-passe - LusitanEstate',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LusitanEstate</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Redefinir Palavra-passe</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                Olá ${name}, recebemos um pedido para redefinir a sua palavra-passe. Clique no botão abaixo para criar uma nova palavra-passe.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #d94f2a 0%, #b8432a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Redefinir Palavra-passe
                </a>
              </div>
              <p style="color: #999999; font-size: 12px; margin: 20px 0 0 0;">
                Este link expira em 1 hora. Se não solicitou esta alteração, pode ignorar este email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${name}!\n\nRecebemos um pedido para redefinir a sua palavra-passe. Visite: ${resetUrl}\n\nEste link expira em 1 hora.\n\n© ${new Date().getFullYear()} LusitanEstate`
  }),

  // Inquiry Confirmation (sent to the person making the inquiry)
  inquiryConfirmation: (inquiry, property) => ({
    subject: `Confirmação de Pedido - ${property.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LusitanEstate</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Pedido Recebido!</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                Olá ${inquiry.name}, o seu pedido de informação foi recebido com sucesso. O proprietário/agente será notificado e entrará em contacto consigo brevemente.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px;">Detalhes do Imóvel</h3>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Imóvel:</strong> ${property.title}</p>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Localização:</strong> ${property.location?.city || 'N/A'}, ${property.location?.district || 'N/A'}</p>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Preço:</strong> €${property.price?.toLocaleString('pt-PT') || 'N/A'}</p>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Tipo de Pedido:</strong> ${getInquiryTypeLabel(inquiry.inquiryType)}</p>
              </div>
              <div style="background-color: #e8f4fd; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
                <p style="color: #4a4a4a; margin: 0; font-size: 14px;"><strong>A sua mensagem:</strong></p>
                <p style="color: #4a4a4a; margin: 10px 0 0 0; font-style: italic;">"${inquiry.message}"</p>
              </div>
              <p style="color: #6b6b6b; font-size: 14px; margin: 20px 0 0 0;">
                Pode acompanhar o estado do seu pedido na sua área de cliente.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} LusitanEstate. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${inquiry.name}!\n\nO seu pedido de informação foi recebido.\n\nImóvel: ${property.title}\nLocalização: ${property.location?.city || 'N/A'}\nPreço: €${property.price?.toLocaleString('pt-PT') || 'N/A'}\n\nA sua mensagem: "${inquiry.message}"\n\nO proprietário/agente entrará em contacto brevemente.\n\n© ${new Date().getFullYear()} LusitanEstate`
  }),

  // Inquiry Notification (sent to property owner/agent)
  inquiryNotification: (inquiry, property, recipientName) => ({
    subject: `Novo Pedido de Informação - ${property.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #d94f2a 0%, #b8432a 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Novo Pedido!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">LusitanEstate</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Olá ${recipientName}!</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                Recebeu um novo pedido de informação para o seu imóvel. Responda o mais brevemente possível para maximizar as suas hipóteses de negócio.
              </p>
              <div style="background-color: #fff8f6; border: 1px solid #f5d5cf; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #d94f2a; margin: 0 0 15px 0; font-size: 18px;">Dados do Interessado</h3>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Nome:</strong> ${inquiry.name}</p>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #0066cc;">${inquiry.email}</a></p>
                ${inquiry.phone ? `<p style="color: #4a4a4a; margin: 5px 0;"><strong>Telefone:</strong> <a href="tel:${inquiry.phone}" style="color: #0066cc;">${inquiry.phone}</a></p>` : ''}
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>Tipo de Pedido:</strong> ${getInquiryTypeLabel(inquiry.inquiryType)}</p>
              </div>
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px;">Imóvel</h3>
                <p style="color: #4a4a4a; margin: 5px 0;"><strong>${property.title}</strong></p>
                <p style="color: #6b6b6b; margin: 5px 0;">${property.location?.city || 'N/A'}, ${property.location?.district || 'N/A'}</p>
              </div>
              <div style="background-color: #e8f4fd; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
                <p style="color: #4a4a4a; margin: 0; font-size: 14px;"><strong>Mensagem:</strong></p>
                <p style="color: #4a4a4a; margin: 10px 0 0 0; font-style: italic;">"${inquiry.message}"</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${emailConfig.clientUrl}/dashboard/inquiries" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Ver no Painel
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${recipientName}!\n\nRecebeu um novo pedido de informação.\n\nDados do Interessado:\nNome: ${inquiry.name}\nEmail: ${inquiry.email}\nTelefone: ${inquiry.phone || 'Não fornecido'}\nTipo: ${getInquiryTypeLabel(inquiry.inquiryType)}\n\nImóvel: ${property.title}\n\nMensagem: "${inquiry.message}"\n\n© ${new Date().getFullYear()} LusitanEstate`
  }),

  // Inquiry Response (sent when agent responds to inquiry)
  inquiryResponse: (inquiry, property, response) => ({
    subject: `Resposta ao seu pedido - ${property.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Resposta Recebida!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">LusitanEstate</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Olá ${inquiry.name}!</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                O proprietário/agente respondeu ao seu pedido de informação sobre o imóvel <strong>${property.title}</strong>.
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                <p style="color: #4a4a4a; margin: 0; font-size: 14px;"><strong>Resposta:</strong></p>
                <p style="color: #4a4a4a; margin: 10px 0 0 0; line-height: 1.6;">${response}</p>
              </div>
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 15px; margin: 20px 0;">
                <p style="color: #6b6b6b; margin: 0; font-size: 13px;"><strong>O seu pedido original:</strong></p>
                <p style="color: #6b6b6b; margin: 10px 0 0 0; font-style: italic; font-size: 13px;">"${inquiry.message}"</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${emailConfig.clientUrl}/properties/${property._id}" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Ver Imóvel
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${inquiry.name}!\n\nO proprietário/agente respondeu ao seu pedido sobre ${property.title}.\n\nResposta: "${response}"\n\nO seu pedido original: "${inquiry.message}"\n\n© ${new Date().getFullYear()} LusitanEstate`
  }),

  // Welcome Email (after verification)
  welcome: (name) => ({
    subject: 'Bem-vindo à LusitanEstate!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcfb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Bem-vindo!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">LusitanEstate</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Olá ${name}!</h2>
              <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px 0;">
                A sua conta foi verificada com sucesso! Está agora pronto para explorar milhares de imóveis em todo o Portugal.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px;">O que pode fazer agora:</h3>
                <ul style="color: #4a4a4a; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Pesquisar imóveis em todos os 20 distritos</li>
                  <li>Guardar os seus imóveis favoritos</li>
                  <li>Contactar agentes e proprietários</li>
                  <li>Publicar os seus próprios anúncios</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${emailConfig.clientUrl}/properties" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #004d99 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Começar a Explorar
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Olá ${name}!\n\nA sua conta foi verificada com sucesso! Está agora pronto para explorar milhares de imóveis em Portugal.\n\nVisite: ${emailConfig.clientUrl}/properties\n\n© ${new Date().getFullYear()} LusitanEstate`
  })
};

// Helper function to get inquiry type label in Portuguese
function getInquiryTypeLabel(type) {
  const labels = {
    viewing: 'Visita ao Imóvel',
    information: 'Pedido de Informação',
    offer: 'Proposta',
    general: 'Questão Geral'
  };
  return labels[type] || type;
}

/**
 * Send email via Amazon SES
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (fallback)
 * @returns {Promise<object>} - SES response or error
 */
async function sendEmail(to, subject, html, text) {
  // Check if SES is configured
  if (!isSESConfigured()) {
    console.warn('SES not configured. Email not sent to:', to);
    return { success: false, message: 'Email service not configured' };
  }

  const params = {
    Source: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html
        },
        Text: {
          Charset: 'UTF-8',
          Data: text
        }
      }
    },
    ReplyToAddresses: [emailConfig.replyToEmail]
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log(`Email sent successfully to ${to}. MessageId: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error('SES Email Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send verification email to new user
 */
async function sendVerificationEmail(user, verificationToken) {
  const verificationUrl = `${emailConfig.clientUrl}/verify-email?token=${verificationToken}`;
  const template = templates.verification(user.name, verificationUrl);
  return sendEmail(user.email, template.subject, template.html, template.text);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${emailConfig.clientUrl}/reset-password?token=${resetToken}`;
  const template = templates.passwordReset(user.name, resetUrl);
  return sendEmail(user.email, template.subject, template.html, template.text);
}

/**
 * Send inquiry confirmation to the person making the inquiry
 */
async function sendInquiryConfirmation(inquiry, property) {
  const template = templates.inquiryConfirmation(inquiry, property);
  return sendEmail(inquiry.email, template.subject, template.html, template.text);
}

/**
 * Send inquiry notification to property owner/agent
 */
async function sendInquiryNotification(inquiry, property, recipientEmail, recipientName) {
  const template = templates.inquiryNotification(inquiry, property, recipientName);
  return sendEmail(recipientEmail, template.subject, template.html, template.text);
}

/**
 * Send inquiry response notification to inquirer
 */
async function sendInquiryResponseEmail(inquiry, property, response) {
  const template = templates.inquiryResponse(inquiry, property, response);
  return sendEmail(inquiry.email, template.subject, template.html, template.text);
}

/**
 * Send welcome email after successful verification
 */
async function sendWelcomeEmail(user) {
  const template = templates.welcome(user.name);
  return sendEmail(user.email, template.subject, template.html, template.text);
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInquiryConfirmation,
  sendInquiryNotification,
  sendInquiryResponseEmail,
  sendWelcomeEmail,
  templates,
  getInquiryTypeLabel
};

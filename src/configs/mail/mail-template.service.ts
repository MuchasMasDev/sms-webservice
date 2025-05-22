import { Injectable } from '@nestjs/common';

interface TemplateOptions {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

interface WelcomeTemplateOptions {
  mail: string;
  password: string;
  platformName?: string;
  activationUrl?: string;
}

@Injectable()
export class MailTemplateService {
  /**
   * Template principal con tonos lila/púrpura
   */
  createPurpleTemplate(options: TemplateOptions): string {
    const { title, content, buttonText, buttonUrl, footerText } = options;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
                drop-shadow: 
                    0 25px 50px rgba(102, 126, 234, 0.25),
                    0 12px 24px rgba(139, 92, 246, 0.15),
                    0 6px 12px rgba(168, 85, 247, 0.1);
                box-shadow:
                    0 4px 12px rgba(139, 92, 246, 0.2),
                    0 2px 6px rgba(168, 85, 247, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
                padding: 0;
                width: 100%;
                box-sizing: border-box;
                margin-top: 40px;
                margin-bottom: 40px;
            }
            .header {
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 4px 12px rgba(139, 92, 246, 0.3);
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.15"/><circle cx="10" cy="50" r="0.5" fill="white" opacity="0.15"/><circle cx="90" cy="30" r="0.5" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            }
            .logo {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                position: relative;
                z-index: 1;
                text-shadow: 
                    0 2px 4px rgba(0,0,0,0.3),
                    0 4px 8px rgba(0,0,0,0.15),
                    0 8px 16px rgba(0,0,0,0.1);
            }
            .subtitle {
                color: rgba(255,255,255,0.9);
                font-size: 16px;
                margin: 8px 0 0 0;
                position: relative;
                z-index: 1;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            .content {
                padding: 40px 30px;
                position: relative;
            }
            .content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
                box-shadow: 0 1px 3px rgba(139, 92, 246, 0.1);
            }
            .content h1 {
                color: #6b46c1;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 20px 0;
                text-align: center;
                text-shadow: 0 1px 2px rgba(107, 70, 193, 0.1);
            }
            .content p {
                color: #4b5563;
                font-size: 16px;
                margin: 0 0 20px 0;
                line-height: 1.7;
            }
            .highlight-box {
                background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                border: 1px solid #d8b4fe;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                position: relative;
                box-shadow: 
                    0 4px 12px rgba(139, 92, 246, 0.08),
                    0 2px 6px rgba(168, 85, 247, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
            }
            .highlight-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(to bottom, #8b5cf6, #a855f7);
                border-radius: 2px;
                box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white !important;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 
                    0 8px 20px rgba(139, 92, 246, 0.35),
                    0 4px 12px rgba(168, 85, 247, 0.25),
                    0 2px 6px rgba(192, 132, 252, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .button:hover {
                transform: translateY(-3px);
                box-shadow: 
                    0 12px 28px rgba(139, 92, 246, 0.45),
                    0 6px 16px rgba(168, 85, 247, 0.35),
                    0 3px 8px rgba(192, 132, 252, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            .footer {
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                padding: 30px;
                text-align: center;
                box-shadow: 
                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                    0 -2px 8px rgba(0, 0, 0, 0.02);
            }
            .footer p {
                color: #64748b;
                font-size: 14px;
                margin: 0 0 10px 0;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #8b5cf6, #a855f7);
                border-radius: 50%;
                text-decoration: none;
                line-height: 40px;
                color: white;
                font-weight: bold;
                box-shadow: 
                    0 4px 12px rgba(139, 92, 246, 0.3),
                    0 2px 6px rgba(168, 85, 247, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transition: all 0.2s ease;
            }
            .social-links a:hover {
                transform: translateY(-2px);
                box-shadow: 
                    0 6px 16px rgba(139, 92, 246, 0.4),
                    0 3px 8px rgba(168, 85, 247, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            @media (max-width: 600px) {
                .email-container {
                    margin: 20px 10px;
                    border-radius: 12px;
                }
                .header {
                    padding: 30px 20px;
                }
                .content {
                    padding: 30px 20px;
                }
                .logo {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1 class="logo">Muchas Más</h1>
                <p class="subtitle">Sistema de Gestión De Becarias - SGB</p>
            </div>
            <div class="content">
                <h1>${title}</h1>
                <div class="highlight-box">
                    ${content}
                </div>
                ${
                  buttonText && buttonUrl
                    ? `<div style="text-align: center;">
                     <a href="${buttonUrl}" class="button">${buttonText}</a>
                   </div>`
                    : ''
                }
            </div>
            <div class="footer">
                <p><strong>Muchas Más</strong></p>
                <p>${footerText || 'Conectando oportunidades, creando futuro'}</p>
                <p style="font-size: 12px; color: #94a3b8;">
                    Este correo fue enviado desde una dirección de solo envío. Por favor, no respondas a este mensaje.
                </p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Template específico para emails de bienvenida
   */
  createWelcomeTemplate(options: WelcomeTemplateOptions): string {
    const {
      platformName = 'Sistema De Gestión De Becarias',
      activationUrl,
      mail,
      password,
    } = options;

    const content = `
      <p>Querida becaria,</p>

    <p>¡Nos alegra darte la bienvenida al nuevo <strong>Sistema de Gestión de Becarias de Muchas Más</strong>!</p>

    <p>Este espacio ha sido creado especialmente para ti, con el objetivo de mantener tu información actualizada y dar seguimiento a tu proceso de formación académica y en derechos de las mujeres.</p>

    <p>A continuación, te compartimos tus credenciales de acceso:</p>

    <ul>
    <li><strong>Correo:</strong> ${mail}</li>
    <li><strong>Contraseña temporal:</strong> ${password}</li>
    </ul>

    <p>Una vez que ingreses, por favor <strong>verifica que toda la información en el sistema sea correcta</strong>. Podrás actualizar tus datos personales(Y próximamente académicos) fácilmente.</p>

    <p>De igual forma, te recomendamos que cambies tu contraseña temporal por una de tu elección. Puedes hacerlo desde la sección de <strong>Perfil</strong>, dando click en la esquina superior derecha.</p>

    <p>Esta plataforma está en constante desarrollo para alcanzar altos estándares de calidad. Muy pronto se irán incorporando nuevas funciones y mejoras. Te avisaremos sobre cada novedad y te guiaremos en su uso cuando sea necesario.</p>

    <p>Si tienes alguna duda o dificultad para ingresar, puedes escribirnos a <a href="mailto:eugeniarecinos@muchasmas.org">eugeniarecinos@muchasmas.org</a> y con gusto te apoyaremos.</p>

    <p>Gracias por seguir construyendo esta comunidad con nosotras.</p>

    `;

    return this.createPurpleTemplate({
      title: `¡Bienvenida a la nueva plataforma!`,
      content,
      buttonText: 'Comenzar ahora',
      buttonUrl: activationUrl || '#',
      footerText: `Gracias por unirte a ${platformName}`,
    });
  }

  /**
   * Template simple y limpio para contenido personalizado
   */
  createSimpleTemplate(title: string, htmlContent: string): string {
    return this.createPurpleTemplate({
      title,
      content: htmlContent,
    });
  }

  /**
   * Genera versión de texto plano desde HTML (para fallback)
   */
  generateTextVersion(
    title: string,
    htmlContent: string,
    buttonText?: string,
    buttonUrl?: string,
  ): string {
    // Remover etiquetas HTML y limpiar el contenido
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '') // Remover etiquetas HTML
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    let result = `${title}\n\n${textContent}`;

    if (buttonText && buttonUrl) {
      result += `\n\n${buttonText}: ${buttonUrl}`;
    }

    result += '\n\n---\nMuchas Más\nTu plataforma de confianza';

    return result;
  }
}

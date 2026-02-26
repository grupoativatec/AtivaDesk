import nodemailer from "nodemailer";

/**
 * Configuração do transporter de email usando SMTP
 */
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error("Configurações SMTP não encontradas no .env");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465, // true para 465, false para outras portas
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

/**
 * Extrai imagens do HTML da descrição
 */
function extractImagesFromHtml(
  html: string,
): Array<{ src: string; alt?: string; isBase64: boolean }> {
  const images: Array<{ src: string; alt?: string; isBase64: boolean }> = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // Extrair alt se existir
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : undefined;
    const isBase64 = src.startsWith("data:image/");

    images.push({ src, alt, isBase64 });
  }

  return images;
}

/**
 * Converte HTML rico para HTML compatível com email
 * Preserva formatação básica (negrito, itálico, listas, parágrafos)
 * Substitui imagens base64 por CID e mantém imagens URL
 */
function convertHtmlForEmail(
  html: string,
  base64ImageCids: Map<string, string> = new Map(),
): string {
  if (!html || html.trim() === "") return "";

  // Remover scripts e estilos perigosos
  let cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Substituir imagens base64 por CID e manter imagens URL
  cleanHtml = cleanHtml.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    (match, src) => {
      if (src.startsWith("data:image/")) {
        // Imagem base64 - substituir por cid
        let cid: string | undefined = base64ImageCids.get(src);

        // Se não encontrar exato, tentar encontrar por prefixo
        if (!cid) {
          for (const [key, value] of base64ImageCids.entries()) {
            const srcPrefix = src.substring(0, 50);
            const keyPrefix = key.substring(0, 50);
            if (srcPrefix === keyPrefix) {
              cid = value;
              break;
            }
          }
        }

        if (cid) {
          const altMatch = match.match(/alt=["']([^"']*)["']/i);
          const alt = altMatch ? altMatch[1] : "Imagem do chamado";
          return `<img src="cid:${cid}" alt="${alt}" style="max-width:100%; height:auto; display:block; margin:12px 0; border-radius:8px; border:1px solid #E5E7EB;" />`;
        }
        // Se não encontrar cid, remover
        return "";
      } else {
        // Imagem URL - manter
        const altMatch = match.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : "Imagem do chamado";
        return `<img src="${src}" alt="${alt}" style="max-width:100%; height:auto; display:block; margin:12px 0; border-radius:8px; border:1px solid #E5E7EB;" />`;
      }
    },
  );

  // Converter tags para estilos inline compatíveis com email
  cleanHtml = cleanHtml
    // Parágrafos
    .replace(
      /<p[^>]*>/gi,
      '<p style="margin: 0 0 12px 0; line-height: 1.6; color: #111827;">',
    )
    // Negrito
    .replace(/<strong[^>]*>/gi, '<strong style="font-weight: 700;">')
    .replace(/<b[^>]*>/gi, '<strong style="font-weight: 700;">')
    // Itálico
    .replace(/<em[^>]*>/gi, '<em style="font-style: italic;">')
    .replace(/<i[^>]*>/gi, '<em style="font-style: italic;">')
    // Links
    .replace(
      /<a[^>]+href=["']([^"']+)["'][^>]*>/gi,
      '<a href="$1" style="color: #7C3AED; text-decoration: underline;">',
    )
    // Listas
    .replace(
      /<ul[^>]*>/gi,
      '<ul style="margin: 12px 0; padding-left: 24px; list-style-type: disc;">',
    )
    .replace(
      /<ol[^>]*>/gi,
      '<ol style="margin: 12px 0; padding-left: 24px; list-style-type: decimal;">',
    )
    .replace(/<li[^>]*>/gi, '<li style="margin: 4px 0; line-height: 1.6;">')
    // Títulos
    .replace(
      /<h1[^>]*>/gi,
      '<h1 style="font-size: 20px; font-weight: 700; margin: 16px 0 12px 0; color: #111827;">',
    )
    .replace(
      /<h2[^>]*>/gi,
      '<h2 style="font-size: 18px; font-weight: 700; margin: 14px 0 10px 0; color: #111827;">',
    )
    .replace(
      /<h3[^>]*>/gi,
      '<h3 style="font-size: 16px; font-weight: 600; margin: 12px 0 8px 0; color: #111827;">',
    )
    // Quebras de linha
    .replace(/<br[^>]*>/gi, "<br>");

  // Limpar tags vazias
  cleanHtml = cleanHtml
    .replace(/<p[^>]*>\s*<\/p>/gi, "")
    .replace(/<div[^>]*>\s*<\/div>/gi, "");

  return cleanHtml.trim();
}

/**
 * Converte HTML para texto plano (para versão texto do email)
 */
function htmlToPlainText(html: string): string {
  if (!html) return "";

  return html
    .replace(/<h[1-6][^>]*>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<ul[^>]*>/gi, "\n")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<ol[^>]*>/gi, "\n")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<strong[^>]*>/gi, "**")
    .replace(/<\/strong>/gi, "**")
    .replace(/<b[^>]*>/gi, "**")
    .replace(/<\/b>/gi, "**")
    .replace(/<em[^>]*>/gi, "*")
    .replace(/<\/em>/gi, "*")
    .replace(/<i[^>]*>/gi, "*")
    .replace(/<\/i>/gi, "*")
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Envia email de notificação sobre novo ticket criado
 */
export async function sendNewTicketEmail({
  ticketId,
  ticketTitle,
  openedByName,
  openedByEmail,
  category,
  priority,
  unit,
  description,
  attachments = [],
}: {
  ticketId: string;
  ticketTitle: string;
  openedByName: string;
  openedByEmail?: string | null;
  category: string;
  priority: string;
  unit: string | null;
  description: string;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }>;
}) {
  try {
    const emailDestino = process.env.EMAIL_DESTINO;

    if (!emailDestino) {
      throw new Error("EMAIL_DESTINO não configurado no .env");
    }

    // Separar múltiplos emails (separados por vírgula)
    const destinatarios = emailDestino.split(",").map((email) => email.trim());

    const transporter = createTransporter();

    // Mapear prioridades para português
    const priorityMap: Record<string, string> = {
      LOW: "Baixa",
      MEDIUM: "Média",
      HIGH: "Alta",
      URGENT: "Urgente",
    };

    // Mapear categorias para português
    const categoryMap: Record<string, string> = {
      HARDWARE: "Hardware",
      SOFTWARE: "Software",
      NETWORK: "Rede",
      EMAIL: "Email",
      ACCESS: "Acesso",
      OTHER: "Outro",
    };

    // Mapear unidades
    const unitMap: Record<string, string> = {
      ITJ: "ITJ",
      SFS: "SFS",
      FOZ: "FOZ",
      DIO: "DIO",
      AOL: "AOL",
    };

    const ticketIdShort = ticketId.substring(0, 5).toUpperCase();

    // Extrair imagens da descrição HTML
    const imagesFromDescription = extractImagesFromHtml(description);

    // Separar imagens base64 e URLs
    const base64Images = imagesFromDescription.filter((img) => img.isBase64);
    const urlImages = imagesFromDescription.filter((img) => !img.isBase64);

    // Separar anexos em imagens e outros arquivos
    const imageAttachments = attachments.filter((att) =>
      att.mimeType.startsWith("image/"),
    );
    const otherAttachments = attachments.filter(
      (att) => !att.mimeType.startsWith("image/"),
    );

    // Preparar attachments para todas as imagens (base64 + URLs + anexos)
    const allImageAttachments: Array<{
      filename: string;
      url?: string;
      content?: Buffer;
      cid?: string;
      contentType?: string;
      isBase64: boolean;
    }> = [];
    const base64ImageCids = new Map<string, string>();

    // Adicionar imagens base64 da descrição com CID para exibição inline
    base64Images.forEach((img, idx) => {
      const base64Match = img.src.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const mimeType = base64Match[1];
        const base64Data = base64Match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const cid = `image-${ticketIdShort}-${idx}@ativadesk`;

        // Mapear src para cid
        base64ImageCids.set(img.src, cid);

        allImageAttachments.push({
          filename: `imagem-${idx + 1}.${mimeType === "jpeg" ? "jpg" : mimeType}`,
          content: buffer,
          cid: cid,
          contentType: `image/${mimeType}`,
          isBase64: true,
        });
      }
    });

    // Adicionar imagens URL da descrição
    urlImages.forEach((img, idx) => {
      const filename = img.src.split("/").pop() || `imagem-url-${idx + 1}`;
      allImageAttachments.push({
        filename: filename,
        url: img.src,
        isBase64: false,
      });
    });

    // Adicionar anexos de imagem do banco
    imageAttachments.forEach((att) => {
      allImageAttachments.push({
        filename: att.filename,
        url: att.url,
        isBase64: false,
      });
    });

    // Cor primária do tema (roxo/azul) - convertido de oklch para hex aproximado
    const primaryColor = "#7C3AED"; // Roxo vibrante do tema
    const primaryDark = "#6D28D9";

    // URL base da aplicação
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://ativadesk.grupoativa.net:19831";
    const ticketUrl = `${appBaseUrl}/admin/tickets/${ticketId}`;

    // Criar HTML do email
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Novo Chamado - AtivaDesk</title>
</head>

<body style="margin:0; padding:0; background-color:#F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;">
  <!-- Preheader -->
  <div style="display:none; font-size:1px; color:#F3F4F6; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Novo chamado ${ticketIdShort} criado por ${openedByName}. Prioridade: ${priorityMap[priority] || priority}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F3F4F6; padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="800" cellspacing="0" cellpadding="0" border="0" style="width:800px; max-width:800px; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); padding:32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#FFFFFF;">
                      <div style="font-size:12px; letter-spacing:.12em; text-transform:uppercase; opacity:.95; font-weight:600; margin-bottom:8px;">
                        AtivaDesk
                      </div>
                      <div style="font-size:28px; font-weight:700; margin-bottom:12px; letter-spacing:-0.02em; line-height:1.2;">
                        Novo Chamado Criado
                      </div>
                      <div style="font-size:14px; color:#E9D5FF; font-weight:500; margin-bottom:16px;">
                        ID <span style="font-weight:700; color:#FFFFFF; font-family: 'Courier New', monospace; letter-spacing:0.1em;">${ticketIdShort}</span> • ${categoryMap[category] || category}
                      </div>
                    </div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <!-- Badge prioridade -->
                    ${(() => {
                      const p = (priority || "").toUpperCase();
                      const label = priorityMap[p] || p;
                      const badge =
                        p === "URGENT"
                          ? { bg: "#FEE2E2", fg: "#991B1B", br: "#FCA5A5" }
                          : p === "HIGH"
                            ? { bg: "#FFEDD5", fg: "#9A3412", br: "#FDBA74" }
                            : p === "MEDIUM"
                              ? { bg: "#FEF9C3", fg: "#854D0E", br: "#FDE047" }
                              : { bg: "#DCFCE7", fg: "#166534", br: "#86EFAC" };

                      return `
                          <div style="
                            display:inline-block;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                            font-size:12px;
                            font-weight:700;
                            padding:8px 16px;
                            border-radius:24px;
                            background:${badge.bg};
                            color:${badge.fg};
                            border:1px solid ${badge.br};
                            white-space:nowrap;
                            text-transform:uppercase;
                            letter-spacing:0.06em;">
                            ${label}
                          </div>
                        `;
                    })()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF; padding:24px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#111827; font-size:14px; line-height:1.6;">
                
                <p style="margin:0 0 20px 0; color:#4B5563; font-size:15px;">
                  Um novo chamado foi registrado no sistema. Seguem os detalhes:
                </p>

                <!-- Card: Detalhes -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                  style="border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; margin-bottom:20px;">
                  <tr>
                    <td style="background:linear-gradient(to right, #F9FAFB 0%, #F3F4F6 100%); padding:16px 20px; border-bottom:1px solid #E5E7EB;">
                      <div style="font-size:11px; font-weight:700; color:#6B7280; letter-spacing:.08em; text-transform:uppercase;">
                        Detalhes do Chamado
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding:10px 0; width:140px; color:#6B7280; font-weight:600; font-size:13px; vertical-align:top;">
                            Título
                          </td>
                          <td style="padding:10px 0; color:#111827; font-size:14px; font-weight:500;">
                            ${ticketTitle}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0; width:140px; color:#6B7280; font-weight:600; font-size:13px; vertical-align:top;">
                            Criado por
                          </td>
                          <td style="padding:10px 0; color:#111827; font-size:14px;">
                            ${openedByName}${openedByEmail ? ` <span style="color:#6B7280;">&lt;${openedByEmail}&gt;</span>` : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0; width:140px; color:#6B7280; font-weight:600; font-size:13px; vertical-align:top;">
                            Categoria
                          </td>
                          <td style="padding:10px 0; color:#111827; font-size:14px;">
                            <span style="display:inline-block; padding:4px 10px; background:#F3F4F6; border-radius:6px; font-size:12px; font-weight:600; color:#374151;">
                              ${categoryMap[category] || category}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0; width:140px; color:#6B7280; font-weight:600; font-size:13px; vertical-align:top;">
                            Unidade
                          </td>
                          <td style="padding:10px 0; color:#111827; font-size:14px;">
                            ${unit ? unitMap[unit] || unit : '<span style="color:#9CA3AF;">Não informado</span>'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0; width:140px; color:#6B7280; font-weight:600; font-size:13px; vertical-align:top;">
                            ID do Chamado
                          </td>
                          <td style="padding:10px 0; color:#111827; font-size:14px;">
                            <span style="font-weight:800; color:${primaryColor}; font-family: 'Courier New', monospace; letter-spacing:0.1em;">${ticketIdShort}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Descrição -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="border:1px solid #E5E7EB; border-radius:12px; padding:20px; background:#FAFBFC;">
                      <div style="font-size:11px; font-weight:700; color:#6B7280; letter-spacing:.08em; text-transform:uppercase; margin-bottom:16px;">
                        Descrição
                      </div>
                      <div style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        font-size:14px;
                        line-height:1.7;
                        color:#111827;
                        background:#FFFFFF;
                        border:1px solid #E5E7EB;
                        border-radius:8px;
                        padding:20px;">
                        ${convertHtmlForEmail(description, base64ImageCids)}
                      </div>
                    </td>
                  </tr>
                </table>

                ${
                  allImageAttachments.length > 0 || otherAttachments.length > 0
                    ? `
                <!-- Anexos -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="border:1px solid #E5E7EB; border-radius:12px; padding:20px; background:#FAFBFC;">
                      <div style="font-size:11px; font-weight:700; color:#6B7280; letter-spacing:.08em; text-transform:uppercase; margin-bottom:16px;">
                        Anexos (${allImageAttachments.length + otherAttachments.length})
                      </div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        ${allImageAttachments
                          .map(
                            (img, idx) => `
                        <tr>
                          <td style="padding:12px 0; border-bottom:${idx < allImageAttachments.length - 1 || otherAttachments.length > 0 ? "1px solid #E5E7EB" : "none"};">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td colspan="2" style="padding-bottom:10px;">
                                  <div style="border:1px solid #E5E7EB; border-radius:8px; overflow:hidden; background:#FFFFFF; max-width:100%;">
                                    ${
                                      img.isBase64 && img.cid
                                        ? `
                                      <img src="cid:${img.cid}" alt="${img.filename}" style="max-width:100%; height:auto; display:block; width:100%;" />
                                    `
                                        : img.url
                                          ? `
                                      <img src="${img.url}" alt="${img.filename}" style="max-width:100%; height:auto; display:block; width:100%;" />
                                    `
                                          : ""
                                    }
                                    <div style="padding:8px 12px; background:#F9FAFB; font-size:12px; color:#6B7280; border-top:1px solid #E5E7EB;">
                                      ${img.filename}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        `,
                          )
                          .join("")}
                        ${otherAttachments
                          .map(
                            (att) => `
                        <tr>
                          <td style="padding:10px 0; border-bottom:1px solid #E5E7EB;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="vertical-align:middle;">
                                  <div style="display:inline-block; padding:6px 10px; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:6px; font-size:12px; color:#111827; font-weight:500;">
                                    ${att.filename}
                                  </div>
                                </td>
                                <td align="right" style="vertical-align:middle;">
                                  <a href="${att.url}" style="display:inline-block; padding:6px 12px; background:${primaryColor}; color:#FFFFFF; text-decoration:none; border-radius:6px; font-size:12px; font-weight:600;">
                                    Download
                                  </a>
                                </td>
                              </tr>
                              ${
                                att.size > 0
                                  ? `
                              <tr>
                                <td colspan="2" style="padding-top:4px;">
                                  <span style="font-size:11px; color:#9CA3AF;">${(att.size / 1024).toFixed(1)} KB</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                            </table>
                          </td>
                        </tr>
                        `,
                          )
                          .join("")}
                      </table>
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }

                <!-- Link para o ticket -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td align="center" style="padding:16px 0;">
                      <a href="${ticketUrl}" style="
                        color:${primaryColor};
                        text-decoration:underline;
                        font-size:14px;
                        font-weight:500;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                        Ver chamado no sistema
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB; border-top:1px solid #E5E7EB; padding:20px 24px; border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#6B7280; font-size:12px; line-height:1.6;">
                      <div style="margin-bottom:8px;">
                        <span style="color:${primaryColor}; font-weight:700;">AtivaDesk</span> • Sistema de Gestão de TI
                      </div>
                      <div style="color:#9CA3AF; font-size:11px;">
                        Este é um e-mail automático. Por favor, não responda este e-mail.
                      </div>
                      <div style="margin-top:12px; padding-top:12px; border-top:1px solid #E5E7EB; color:#9CA3AF; font-size:11px;">
                        © ${new Date().getFullYear()} AtivaDesk • Todos os direitos reservados
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // Preparar attachments para nodemailer (apenas imagens base64 com CID para exibição inline)
    const emailAttachments = allImageAttachments
      .filter((img) => img.isBase64 && img.content && img.cid)
      .map((img) => ({
        filename: img.filename!,
        content: img.content!,
        cid: img.cid!,
        contentType: img.contentType!,
      }));

    // Enviar email
    const info = await transporter.sendMail({
      from: `"AtivaDesk" <${process.env.SMTP_USER}>`,
      to: destinatarios,
      subject: `Novo Chamado Criado - ${ticketIdShort}: ${ticketTitle}`,
      html: htmlContent,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
      text: `
Novo Chamado Criado - AtivaDesk

ID do Chamado: ${ticketIdShort}
Título: ${ticketTitle}
Criado por: ${openedByName}${openedByEmail ? ` (${openedByEmail})` : ""}
Categoria: ${categoryMap[category] || category}
Prioridade: ${priorityMap[priority] || priority}
Unidade: ${unit ? unitMap[unit] || unit : "Não informado"}

Descrição:
${htmlToPlainText(description)}

${allImageAttachments.length > 0 ? `\nImagens anexadas: ${allImageAttachments.length}\n` : ""}
${otherAttachments.length > 0 ? `\nAnexos: ${otherAttachments.map((a) => a.filename).join(", ")}\n` : ""}

---
Este é um email automático do AtivaDesk - Sistema de Gestão de TI.
Por favor, não responda este email.
      `.trim(),
    });

    console.log("Email enviado com sucesso:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}

/**
 * Envia email de alerta para certificados SSL próximos do vencimento
 */
export async function sendExpiringCertificatesEmail({
  certificates,
  daysThreshold = 5,
}: {
  certificates: Array<{
    id: string;
    domain: string;
    expiresAt: Date;
    pendingRenewal?: boolean;
  }>;
  daysThreshold?: number;
}) {
  if (certificates.length === 0) {
    return { success: true, skipped: true as const };
  }

  try {
    const emailDestino = process.env.EMAIL_DESTINO;

    if (!emailDestino) {
      throw new Error("EMAIL_DESTINO não configurado no .env");
    }

    const destinatarios = emailDestino.split(",").map((email) => email.trim());
    const transporter = createTransporter();

    const now = Date.now();
    const sortedCertificates = [...certificates].sort(
      (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime(),
    );

    const rowsHtml = sortedCertificates
      .map((certificate) => {
        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (certificate.expiresAt.getTime() - now) / (1000 * 60 * 60 * 24),
          ),
        );

        const urgencyBadge =
          daysRemaining <= 1
            ? { bg: "#FEE2E2", fg: "#991B1B", br: "#FCA5A5" }
            : daysRemaining <= 3
              ? { bg: "#FFEDD5", fg: "#9A3412", br: "#FDBA74" }
              : { bg: "#FEF9C3", fg: "#854D0E", br: "#FDE047" };

        return `
          <tr>
            <td style="padding:12px; border-bottom:1px solid #E5E7EB; font-size:14px; color:#111827; font-weight:600;">
              ${certificate.domain}
            </td>
            <td style="padding:12px; border-bottom:1px solid #E5E7EB; font-size:14px; color:#111827;">
              ${certificate.expiresAt.toLocaleDateString("pt-BR")}
            </td>
            <td style="padding:12px; border-bottom:1px solid #E5E7EB;">
              <span style="
                display:inline-block;
                padding:4px 10px;
                border-radius:999px;
                border:1px solid ${urgencyBadge.br};
                background:${urgencyBadge.bg};
                color:${urgencyBadge.fg};
                font-size:12px;
                font-weight:700;">
                ${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}
              </span>
            </td>
            <td style="padding:12px; border-bottom:1px solid #E5E7EB; font-size:13px; color:#6B7280;">
              ${certificate.pendingRenewal ? "Renovação pendente" : "Acompanhar"}
            </td>
          </tr>
        `;
      })
      .join("");

    const primaryColor = "#7C3AED";
    const primaryDark = "#6D28D9";

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Alerta de Certificados SSL - AtivaDesk</title>
</head>

<body style="margin:0; padding:0; background-color:#F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;">
  <div style="display:none; font-size:1px; color:#F3F4F6; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    ${sortedCertificates.length} certificado(s) vencendo em menos de ${daysThreshold} dias.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F3F4F6; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="800" cellspacing="0" cellpadding="0" border="0" style="width:800px; max-width:800px; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); padding:32px 32px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#FFFFFF;">
                <div style="font-size:28px; font-weight:700; margin-bottom:12px; letter-spacing:-0.02em; line-height:1.2;">
                  Alerta de Vencimento SSL
                </div>
                <div style="font-size:14px; color:#E9D5FF; font-weight:500;">
                  ${sortedCertificates.length} certificado(s) vencendo em menos de ${daysThreshold} dias
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF; padding:24px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#111827; font-size:14px; line-height:1.6;">
                <p style="margin:0 0 20px 0; color:#4B5563; font-size:15px;">
                  Identificamos certificados com vencimento próximo. Recomenda-se renovar antes do prazo crítico.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                  style="border:1px solid #E5E7EB; border-radius:12px; overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(to right, #F9FAFB 0%, #F3F4F6 100%); padding:14px 12px; border-bottom:1px solid #E5E7EB; font-size:12px; font-weight:700; text-transform:uppercase; color:#6B7280;">
                      Domínio
                    </td>
                    <td style="background:linear-gradient(to right, #F9FAFB 0%, #F3F4F6 100%); padding:14px 12px; border-bottom:1px solid #E5E7EB; font-size:12px; font-weight:700; text-transform:uppercase; color:#6B7280;">
                      Vencimento
                    </td>
                    <td style="background:linear-gradient(to right, #F9FAFB 0%, #F3F4F6 100%); padding:14px 12px; border-bottom:1px solid #E5E7EB; font-size:12px; font-weight:700; text-transform:uppercase; color:#6B7280;">
                      Dias restantes
                    </td>
                    <td style="background:linear-gradient(to right, #F9FAFB 0%, #F3F4F6 100%); padding:14px 12px; border-bottom:1px solid #E5E7EB; font-size:12px; font-weight:700; text-transform:uppercase; color:#6B7280;">
                      Status
                    </td>
                  </tr>
                  ${rowsHtml}
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#F9FAFB; border-top:1px solid #E5E7EB; padding:20px 24px; border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:#6B7280; font-size:12px; line-height:1.6;">
                      <div style="color:#9CA3AF; font-size:11px;">
                        Este é um e-mail automático. Por favor, não responda este e-mail.
                      </div>
                      <div style="margin-top:12px; padding-top:12px; border-top:1px solid #E5E7EB; color:#9CA3AF; font-size:11px;">
                        © ${new Date().getFullYear()} AtivaDesk • Todos os direitos reservados
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const plainList = sortedCertificates
      .map((certificate) => {
        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (certificate.expiresAt.getTime() - now) / (1000 * 60 * 60 * 24),
          ),
        );
        return `- ${certificate.domain} | vence em ${certificate.expiresAt.toLocaleDateString("pt-BR")} (${daysRemaining} dia${daysRemaining === 1 ? "" : "s"})`;
      })
      .join("\n");

    const info = await transporter.sendMail({
      from: `"AtivaDesk" <${process.env.SMTP_USER}>`,
      to: destinatarios,
      subject: `Alerta SSL: ${sortedCertificates.length} certificado(s) vencendo em menos de ${daysThreshold} dias`,
      html: htmlContent,
      text: `
Alerta de Vencimento SSL - AtivaDesk

Foram encontrados ${sortedCertificates.length} certificado(s) com vencimento em menos de ${daysThreshold} dias:

${plainList}

---
Este é um e-mail automático do AtivaDesk - Sistema de Gestão de TI.
Por favor, não responda este email.
      `.trim(),
    });

    console.log("Email de alerta SSL enviado com sucesso:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("Erro ao enviar alerta de certificados:", error);
    throw error;
  }
}

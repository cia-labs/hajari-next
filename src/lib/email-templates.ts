/**
 * Brand colors matching Atria University email design
 */
export const EMAIL_COLORS = {
    primary: '#686AA8',
    primaryDark: '#5A6AB0',
    text: '#1F2937',
    textLight: '#6B7280',
    background: '#FFFFFF',
    border: '#E5E7EB',
} as const;

/**
 * Base email template wrapper
 * This provides consistent branding across all emails
 */
export function createBaseEmailTemplate({
    title,
    subtitle,
    content,
    preheader,
    useCid = true,
}: {
    title: string;
    subtitle?: string;
    content: string;
    preheader?: string;
    useCid?: boolean;
}): string {
    // Use CID for embedded logo (recommended) or fallback to external URL
    // CID (Content-ID) embeds the logo in the email, preventing broken images
    const atriaLogo = useCid 
        ? 'cid:atria-logo'
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/AU%20Logo_For_Light%20Background.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                min-width: 100% !important;
                border: 7px solid #DFDEDE !important;
                border-radius: 0 !important;
            }
            .mobile-padding {
                padding: 35px 30px !important;
            }
            .mobile-padding-small {
                padding: 30px !important;
            }
            .mobile-padding-hero {
                padding: 40px 30px !important;
            }
            .mobile-text-size {
                font-size: 22px !important;
                line-height: 1.2 !important;
            }
            .mobile-outer-padding {
                padding: 0 !important;
            }
            .mobile-logo {
                height: 55px !important;
            }
            .mobile-info-box {
                padding: 25px 20px !important;
                margin: 25px 0 !important;
            }
            .mobile-footer-text {
                font-size: 13px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;">
    ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
    
    <!-- Outer wrapper with background -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F3F4F6;">
        <tr>
            <td class="mobile-outer-padding" style="padding: 40px 20px;">
                <!-- Main email container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border: 12px solid #DFDEDE;">
                    
                    <!-- Header with logo -->
                    <tr>
                        <td class="mobile-padding-small" style="padding: 30px 40px; background-color: #FFFFFF; text-align: center;">
                            <img src="${atriaLogo}" alt="Atria University" class="mobile-logo" style="height: 60px; width: auto; display: inline-block; max-width: 100%;" />
                        </td>
                    </tr>

                    <!-- Hero banner -->
                    <tr>
                        <td class="mobile-padding-hero" style="background-color: ${EMAIL_COLORS.primary}; padding: 40px 40px; text-align: left;">
                            <h1 class="mobile-text-size" style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; line-height: 1.2;">
                                ${title}
                            </h1>
                            ${subtitle ? `<p style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 16px; font-weight: 400; opacity: 0.95;">${subtitle}</p>` : ''}
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 40px 40px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="mobile-padding" style="padding: 30px 40px; background-color: #F9FAFB; border-top: 1px solid ${EMAIL_COLORS.border};">
                            <p class="mobile-footer-text" style="margin: 0 0 10px 0; color: ${EMAIL_COLORS.text}; font-size: 14px; font-weight: 700;">
                                Best regards,
                            </p>
                            <p class="mobile-footer-text" style="margin: 0; color: ${EMAIL_COLORS.textLight}; font-size: 14px; font-weight: 700; line-height: 1.5;">
                                Atria University IT Team
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

/**
 * Create a call-to-action button
 */
export function createEmailButton({
    text,
    url,
}: {
    text: string;
    url: string;
}): string {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
    <tr>
        <td style="border-radius: 6px; background-color: ${EMAIL_COLORS.primary};">
            <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px;">
                ${text}
            </a>
        </td>
    </tr>
</table>
    `.trim();
}

/**
 * Create an info box section with properly aligned labels and values
 */
export function createInfoBox({
    title,
    items,
}: {
    title?: string;
    items: { label: string; value: string }[];
}): string {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="mobile-info-box" style="background-color: #F9FAFB; border-radius: 6px; margin: 20px 0; padding: 20px; border: 1px solid #E5E7EB;">
    ${
        title
            ? `
    <tr>
        <td style="padding-bottom: 16px;">
            <strong style="color: ${EMAIL_COLORS.text}; font-size: 15px;">${title}</strong>
        </td>
    </tr>`
            : ''
    }
    ${items
        .map(
            (item) => `
    <tr>
        <td style="padding: 8px 0;">
            <p style="margin: 0; line-height: 1.5;">
                <span style="color: ${EMAIL_COLORS.textLight}; font-size: 14px; font-weight: 600;">
                    ${item.label}
                </span>
                <span style="color: ${EMAIL_COLORS.text}; font-size: 14px; font-weight: 700;">
                    ${item.value}
                </span>
            </p>
        </td>
    </tr>`,
        )
        .join('')}
</table>
    `.trim();
}

/**
 * Create a note/warning box
 */
export function createNoteBox({
    text,
    type = 'info',
}: {
    text: string;
    type?: 'info' | 'warning';
}): string {
    const bgColor = type === 'warning' ? '#FEF3C7' : '#EFF6FF';
    const borderColor = type === 'warning' ? '#F59E0B' : '#3B82F6';
    const textColor = type === 'warning' ? '#92400E' : '#1E40AF';

    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 6px; margin: 20px 0;">
    <tr>
        <td style="padding: 16px 20px; color: ${textColor}; font-size: 14px; line-height: 1.6;">
            <strong>Note:</strong> ${text}
        </td>
    </tr>
</table>
    `.trim();
}

/**
 * Create a simple text paragraph
 */
export function createParagraph(text: string): string {
    return `<p style="margin: 0 0 16px 0; color: ${EMAIL_COLORS.text}; font-size: 15px; line-height: 1.6;">${text}</p>`;
}

/**
 * Create a bold text paragraph
 */
export function createBoldParagraph(text: string): string {
    return `<p style="margin: 0 0 16px 0; color: ${EMAIL_COLORS.text}; font-size: 15px; font-weight: 700; line-height: 1.6;">${text}</p>`;
}

/**
 * Create an ordered list
 */
export function createOrderedList(items: string[]): string {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
    ${items
        .map(
            (item, index) => `
    <tr>
        <td style="padding: 6px 0; vertical-align: top; width: 30px; color: ${EMAIL_COLORS.text}; font-size: 15px; font-weight: 600;">
            ${index + 1}.
        </td>
        <td style="padding: 6px 0; color: ${EMAIL_COLORS.text}; font-size: 15px; line-height: 1.6;">
            ${item}
        </td>
    </tr>`,
        )
        .join('')}
</table>
    `.trim();
}

/**
 * Create an unordered list
 */
export function createUnorderedList(items: string[]): string {
    return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
    ${items
        .map(
            (item) => `
    <tr>
        <td style="padding: 6px 0; vertical-align: top; width: 30px; color: ${EMAIL_COLORS.text}; font-size: 15px;">
            •
        </td>
        <td style="padding: 6px 0; color: ${EMAIL_COLORS.text}; font-size: 15px; line-height: 1.6;">
            ${item}
        </td>
    </tr>`,
        )
        .join('')}
</table>
    `.trim();
}

/**
 * Create a section heading
 */
export function createHeading(text: string): string {
    return `<h3 style="margin: 24px 0 12px 0; color: ${EMAIL_COLORS.text}; font-size: 16px; font-weight: 600;">${text}</h3>`;
}

/**
 * Create a link for fallback
 */
export function createLinkFallback(url: string): string {
    return `
<p style="margin: 16px 0; padding: 12px; background-color: #F3F4F6; border-radius: 6px; font-size: 13px; color: ${EMAIL_COLORS.textLight}; word-break: break-all;">
    If the button doesn't work, copy and paste this link:<br/>
    <a href="${url}" style="color: ${EMAIL_COLORS.primary}; text-decoration: underline;">${url}</a>
</p>
    `.trim();
}

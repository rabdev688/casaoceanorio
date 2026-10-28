import { PROPERTY_ADDRESS } from './dates.ts'

const OCEAN = '#06333d'
const BLUE = '#0b6373'
const INK = '#142f36'
const MUTED = '#4e6165'
const CREAM = '#f7f5f0'
const LINE = '#e4ebe9'
const SAND = '#e9f3f2'
const ALERT = '#c0392b'
const ALERT_BG = '#fdf4f3'

const FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK};">${text}</p>`
}

function heading(text: string) {
  return `<h2 style="margin:0 0 20px;font-size:20px;font-weight:600;line-height:1.3;color:${INK};letter-spacing:-0.02em;">${escapeHtml(text)}</h2>`
}

function labelValue(label: string, value: string) {
  const safe = escapeHtml(value || '—')
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:13px;font-weight:600;color:${MUTED};width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${LINE};font-size:15px;color:${INK};vertical-align:top;">${safe}</td>
  </tr>`
}

export function detailsTable(rows: { label: string; value: string }[]) {
  const body = rows
    .map((row) => labelValue(row.label, row.value))
    .join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;border-collapse:collapse;background:${SAND};border-radius:10px;">
    <tr><td style="padding:4px 20px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        ${body}
      </table>
    </td></tr>
  </table>`
}

function sectionTitle(text: string) {
  return `<p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">${escapeHtml(text)}</p>`
}

export function alertBanner(message: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;border-collapse:collapse;">
    <tr><td style="padding:14px 18px;background:${ALERT_BG};border-left:4px solid ${ALERT};border-radius:0 8px 8px 0;font-size:15px;line-height:1.5;color:${INK};">
      ${escapeHtml(message)}
    </td></tr>
  </table>`
}

export function textLink(href: string, label: string) {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `<a href="${safeHref}" style="color:${BLUE};text-decoration:none;font-weight:500;">${safeLabel}</a>`
}

export function buttonLink(href: string, label: string) {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-collapse:collapse;">
    <tr><td style="border-radius:8px;background:${BLUE};">
      <a href="${safeHref}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${safeLabel}</a>
    </td></tr>
  </table>`
}

export function phoneLinks(willie: string, shelly: string) {
  const w = escapeHtml(willie)
  const s = escapeHtml(shelly)
  return `Willie at ${textLink(`tel:${willie.replace(/\D/g, '')}`, w)} or Shelly at ${textLink(`tel:${shelly.replace(/\D/g, '')}`, s)}`
}

type EmailContent = {
  title: string
  preheader?: string
  headline: string
  bodyHtml: string
}

export function renderEmail(content: EmailContent) {
  const preheader = content.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(content.preheader)}&nbsp;&zwnj;&nbsp;</div>`
    : ''
  const site = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '')
  let homeLink = 'Casa Oceano Rio'
  if (site) {
    try {
      const host = new URL(site).host.replace(/^www\./, '')
      homeLink = textLink(site, host)
    } catch {
      homeLink = textLink(site, 'Visit website')
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};">
${preheader}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${CREAM};border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(4,37,45,0.06);">
        <tr>
          <td style="padding:28px 32px 24px;background:${OCEAN};">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.72);">Tybee Island</p>
            <p style="margin:0;font-size:22px;font-weight:600;line-height:1.2;color:#ffffff;letter-spacing:-0.02em;">Casa Oceano Rio</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 28px;">
            ${heading(content.headline)}
            ${content.bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid ${LINE};background:${CREAM};">
            <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(PROPERTY_ADDRESS)}</p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED};">${homeLink}</p>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${MUTED};max-width:560px;text-align:center;">You received this message regarding a booking at Casa Oceano Rio.</p>
    </td>
  </tr>
</table>
</body>
</html>`
}

export { sectionTitle, paragraph }

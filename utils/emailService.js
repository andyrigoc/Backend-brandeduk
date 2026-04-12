// utils/emailService.js
const { Resend } = require("resend");

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("✅ Resend email service initialized");
} else {
  console.log("⚠️ RESEND_API_KEY not set - email service disabled");
}

/* ========== HELPERS ========== */

function esc(text) {
  if (text == null) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function fmt(num, decimals = 2) {
  if (num === null || num === undefined || num === 'POA') return num;
  return parseFloat(num).toFixed(decimals);
}

/* ==========================================================
   QUOTE EMAIL
========================================================== */

function generateQuoteEmailHTML(data) {
  const c = data.customer || {};
  const s = data.summary || {};
  const basket = data.basket || [];
  const custs = data.customizations || [];

  const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer';
  const email = c.email || '';
  const phone = c.phone || '';
  const company = c.company || null;
  const address = c.address || null;

  /* ---- Basket ---- */
  let basketHTML = '';
  if (basket.length > 0) {
    basket.forEach((item, i) => {
      let sizesText = '';
      if (item.sizes && typeof item.sizes === 'object') {
        const arr = [];
        Object.entries(item.sizes).forEach(([sz, qty]) => { if (qty > 0) arr.push(`${esc(sz)}: ${qty}`); });
        sizesText = arr.length ? arr.join(', ') : (item.sizesSummary ? esc(item.sizesSummary) : '');
      } else {
        sizesText = item.sizesSummary ? esc(item.sizesSummary) : '';
      }
      basketHTML += `
      <div style="background:#fff;padding:12px;margin:8px 0;border-radius:6px;border:1px solid #e5e7eb;">
        <div style="font-weight:bold;color:#7c3aed;margin-bottom:8px;">Item #${i + 1}: ${esc(item.name || 'Product')} (${esc(item.code || 'N/A')})</div>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Color:</td><td style="border-bottom:1px solid #e5e7eb;">${esc(item.color || 'N/A')}</td></tr>
          <tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Total Quantity:</td><td style="border-bottom:1px solid #e5e7eb;"><strong>${item.quantity || 0} units</strong></td></tr>
          ${sizesText ? `<tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Sizes:</td><td style="color:#6b7280;font-size:0.9em;border-bottom:1px solid #e5e7eb;">${sizesText}</td></tr>` : ''}
          <tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Unit Price:</td><td style="border-bottom:1px solid #e5e7eb;">&pound;${fmt(item.unitPrice)}</td></tr>
          <tr><td style="font-weight:bold;color:#374151;">Item Total:</td><td><strong>&pound;${fmt(item.itemTotal)}</strong></td></tr>
        </table>
      </div>`;
    });
  }

  /* ---- Customizations ---- */
  let custsHTML = '';
  if (custs.length > 0) {
    custs.forEach(cu => {
      const method = (cu.method || 'N/A').toUpperCase();
      const type = esc(cu.type || 'N/A');
      const position = esc(cu.position || 'Unknown');
      const hasLogo = cu.hasLogo ?? false;
      const logoIcon = hasLogo ? '&#9989; Yes' : '&#10060; No';
      const text = cu.text ? ` - Text: ${esc(cu.text)}` : '';
      const uPrice = cu.unitPrice === 'POA' ? 'POA' : `&pound;${fmt(cu.unitPrice)}`;
      const lTotal = cu.lineTotal === 'POA' ? 'POA' : `&pound;${fmt(cu.lineTotal)}`;
      const qty = cu.quantity || 0;

      let logoHTML = '';
      if (cu.logo) {
        if (cu.logo.startsWith('data:')) {
          const posSlug = (cu.position || 'unknown').replace(/\s+/g, '-');
          const ext = cu.logo.startsWith('data:image/png') ? 'png' : 'jpg';
          logoHTML = `<br><span style="color:#7c3aed;font-size:13px;">&#128206; Logo attached: <strong>logo-${esc(posSlug)}.${ext}</strong></span>`;
        } else {
          logoHTML = `<br><img src="${esc(cu.logo)}" alt="Logo" style="max-width:150px;max-height:100px;margin-top:8px;border:1px solid #e5e7eb;border-radius:4px;"><br><a href="${esc(cu.logo)}" target="_blank" style="color:#7c3aed;font-size:12px;">Download Logo</a>`;
        }
      }

      custsHTML += `
      <tr>
        <td style="font-weight:bold;color:#374151;padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;">${position}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <strong>${method}</strong> - ${type}<br>
          Logo Uploaded: ${logoIcon}${text}${logoHTML}<br>
          <small>Unit: ${uPrice} &times; Qty: ${qty} = ${lTotal}</small>
        </td>
      </tr>`;
    });
  } else {
    custsHTML = '<tr><td colspan="2" style="padding:10px;">No customizations selected</td></tr>';
  }

  /* ---- Uploaded Logos Section ---- */
  let logosSection = '';
  const logosWithData = custs.filter(cu => cu.logo);
  if (logosWithData.length > 0) {
    let rows = '';
    logosWithData.forEach(cu => {
      let imgTag;
      if (cu.logo.startsWith('data:')) {
        const posSlug = (cu.position || 'unknown').replace(/\s+/g, '-');
        const ext = cu.logo.startsWith('data:image/png') ? 'png' : 'jpg';
        imgTag = `<span style="color:#7c3aed;">&#128206; See attached file: <strong>logo-${esc(posSlug)}.${ext}</strong></span>`;
      } else {
        imgTag = `<a href="${esc(cu.logo)}" target="_blank" style="color:#7c3aed;">View Logo</a><br><img src="${esc(cu.logo)}" style="max-width:200px;max-height:150px;border:2px dashed #ea580c;padding:4px;border-radius:6px;">`;
      }
      rows += `<tr><td style="font-weight:bold;color:#374151;padding:10px;border-bottom:1px solid #e5e7eb;"><strong>${esc(cu.position || 'Unknown')}:</strong></td><td style="padding:10px;border-bottom:1px solid #e5e7eb;">${imgTag}</td></tr>`;
    });
    logosSection = `
    <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
      <h2 style="margin-top:0;color:#374151;">&#128444; Uploaded Logos</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
    </div>`;
  }

  /* ---- Summary ---- */
  const garmentCost = fmt(s.garmentCost);
  const customizationCost = fmt(s.customizationCost);
  const digitizingFee = fmt(s.digitizingFee);
  const subtotal = fmt(s.subtotal);
  const vatAmount = fmt(s.vatAmount);
  const displayTotal = fmt(s.displayTotal || s.totalExVat);
  const totalQty = s.totalQuantity || 0;
  const totalItems = s.totalItems || basket.length || 0;
  const vatMode = s.vatMode || 'ex';

  /* ---- Customer Notes ---- */
  const notes = Array.isArray(data.notes) ? [...data.notes] : [];
  const orderNotes = s.orderNotes;
  if (orderNotes && !notes.includes(orderNotes)) notes.unshift(orderNotes);
  basket.forEach(item => {
    if (item.note && !notes.includes(item.note)) notes.push(item.note);
  });

  let notesSection = '';
  if (notes.length > 0) {
    notesSection = `
    <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
      <h2 style="margin-top:0;color:#374151;">&#128221; Customer Notes</h2>
      <ul>${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    </div>`;
  }

  const now = new Date();
  const formattedDate = now.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).replace(',', '');

  return `<html><head></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;margin:0;padding:0;">
  <div style="background:#7c3aed;color:white;padding:20px;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;">&#127881; New Quote Request</h1>
  </div>

  <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
    <h2 style="margin-top:0;color:#374151;">&#128100; Customer Details</h2>
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="font-weight:bold;color:#374151;width:150px;border-bottom:1px solid #e5e7eb;">Name:</td><td style="border-bottom:1px solid #e5e7eb;">${esc(name)}</td></tr>
      ${company ? `<tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Company:</td><td style="border-bottom:1px solid #e5e7eb;">${esc(company)}</td></tr>` : ''}
      <tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Email:</td><td style="border-bottom:1px solid #e5e7eb;">${esc(email)}</td></tr>
      <tr><td style="font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Phone:</td><td style="border-bottom:1px solid #e5e7eb;">${esc(phone)}</td></tr>
      ${address ? `<tr><td style="font-weight:bold;color:#374151;">Address:</td><td>${esc(address)}</td></tr>` : ''}
    </table>
  </div>

  <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
    <h2 style="margin-top:0;color:#374151;">&#128722; Basket Items (${totalItems} ${totalItems === 1 ? 'item' : 'items'})</h2>
    ${basketHTML}
  </div>

  <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
    <h2 style="margin-top:0;color:#374151;">&#127912; Customizations</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${custsHTML}</table>
  </div>

  ${logosSection}

  <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
    <h2 style="margin-top:0;color:#374151;">&#128176; Quote Summary</h2>
    <div style="background:#ede9fe;padding:15px;border-radius:8px;margin-top:10px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Total Items:</span><span><strong>${totalItems} ${totalItems === 1 ? 'product' : 'products'}</strong></span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Total Quantity:</span><span><strong>${totalQty} units</strong></span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Garment Cost:</span><span>&pound;${garmentCost} ex VAT</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Customization Cost:</span><span>&pound;${customizationCost} ex VAT</span></div>
      ${parseFloat(digitizingFee) > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Digitizing Fee (one-time):</span><span>&pound;${digitizingFee} ex VAT</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>Subtotal (ex VAT):</span><span>&pound;${subtotal}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd4fe;"><span>VAT (20%):</span><span>&pound;${vatAmount}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:bold;font-size:1.1em;"><span>Total (${vatMode === 'inc' ? 'inc' : 'ex'} VAT):</span><span>&pound;${displayTotal}</span></div>
    </div>
  </div>

  ${notesSection}

  <div style="background:#f9fafb;padding:20px;margin:15px 0;border-radius:8px;border-left:4px solid #7c3aed;">
    <h2 style="margin-top:0;color:#374151;">&#128197; Request Date</h2>
    <p>${formattedDate}</p>
  </div>

  <p style="color:#6b7280;font-size:12px;margin-top:20px;">This quote was automatically generated from the BrandedUK website.</p>
</body></html>`;
}

/* ---- Build attachments from base64 logos ---- */
function extractLogoAttachments(customizations) {
  const attachments = [];
  for (const cu of customizations) {
    if (!cu.logo || !cu.logo.startsWith('data:')) continue;

    const match = cu.logo.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) continue;

    const mimeType = match[1];
    const base64Data = match[2];
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const posSlug = (cu.position || 'unknown').replace(/\s+/g, '-');

    attachments.push({
      filename: `logo-${posSlug}.${ext}`,
      content: base64Data,          // Resend accepts raw base64 string
      type: mimeType,               // explicit MIME type
    });

    console.log(`[EMAIL] Prepared attachment: logo-${posSlug}.${ext} (${base64Data.length} base64 chars, type: ${mimeType})`);
  }
  return attachments;
}

async function sendQuoteEmail(data) {
  try {
    const html = generateQuoteEmailHTML(data);
    const customizations = data.customizations || [];
    const attachments = extractLogoAttachments(customizations);

    console.log(`[EMAIL] Sending quote email to: ${process.env.EMAIL_TO}`);
    console.log(`[EMAIL] From: ${process.env.EMAIL_FROM}`);
    console.log(`[EMAIL] Attachments: ${attachments.length}`);

    const emailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: data.customer?.email,
      subject: `New Quote Request - ${data.customer?.fullName || 'Customer'}`,
      html,
    };

    if (attachments.length > 0) {
      emailOptions.attachments = attachments;
      console.log(`[EMAIL] Attachment details:`, attachments.map(a => ({ filename: a.filename, type: a.type, contentLength: a.content.length })));
    }

    const result = await resend.emails.send(emailOptions);
    const emailId = result?.data?.id || result?.id;

    if (emailId) {
      console.log("✅ Quote email sent. ID:", emailId);
      return { success: true, id: emailId };
    } else {
      console.warn("⚠️ Email sent but no ID:", JSON.stringify(result));
      return { success: true, id: null, warning: "No ID returned" };
    }
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    console.error("[EMAIL] Details:", { status: error.status, response: error.response?.data || error.response });
    throw error;
  }
}

/* ==========================================================
   CONTACT FORM EMAIL
========================================================== */

function generateContactEmailHTML(data) {
  const name = esc(data.name || 'Anonymous');
  const email = esc(data.email || 'Not provided');
  const interest = esc(data.interest || 'Not specified');
  const phone = data.phone ? esc(data.phone) : null;
  const address = data.address ? esc(data.address) : null;
  const postCode = data.postCode ? esc(data.postCode) : null;
  const message = esc(data.message || '');
  const submittedAt = data.submittedAt || new Date().toISOString();

  const date = new Date(submittedAt);
  const formattedDate = date.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).replace(',', '');

  const interestColors = {
    embroidery: '#7c3aed', printing: '#2563eb', workwear: '#059669',
    uniforms: '#dc2626', promotional: '#d97706', other: '#6b7280'
  };
  const badgeColor = interestColors[data.interest?.toLowerCase()] || interestColors.other;

  return `<html><head></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);color:white;padding:30px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:24px;">&#128236; New Contact Form Submission</h1>
      <p style="margin:10px 0 0;opacity:0.9;">Someone has reached out through the website</p>
    </div>
    <div style="background:#ffffff;padding:30px;border:1px solid #e5e7eb;">
      <div style="margin-bottom:25px;">
        <div style="font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">&#128100; Contact Information</div>
        <div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-weight:600;color:#374151;display:inline-block;width:120px;">Name:</span><strong>${name}</strong></div>
        <div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-weight:600;color:#374151;display:inline-block;width:120px;">Email:</span><a href="mailto:${email}" style="color:#7c3aed;">${email}</a></div>
        ${phone ? `<div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-weight:600;color:#374151;display:inline-block;width:120px;">Phone:</span><a href="tel:${phone}" style="color:#7c3aed;">${phone}</a></div>` : ''}
        <div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-weight:600;color:#374151;display:inline-block;width:120px;">Interest:</span><span style="display:inline-block;background:${badgeColor};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">${interest}</span></div>
        ${address || postCode ? `<div style="padding:10px 0;"><span style="font-weight:600;color:#374151;display:inline-block;width:120px;">Location:</span>${[address, postCode].filter(Boolean).join(', ')}</div>` : ''}
      </div>
      <div style="margin-bottom:25px;">
        <div style="font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">&#128172; Message</div>
        <div style="background:#f9fafb;border-left:4px solid #7c3aed;padding:20px;border-radius:0 8px 8px 0;">
          <p style="white-space:pre-wrap;color:#374151;margin:0;">${message}</p>
        </div>
      </div>
      <div style="text-align:center;">
        <a href="mailto:${email}?subject=Re: Your inquiry about ${interest}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Reply to ${name.split(' ')[0]}</a>
      </div>
    </div>
    <div style="background:#f3f4f6;padding:20px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
      <p style="margin:0;color:#6b7280;font-size:12px;">Submitted on ${formattedDate}</p>
      <p style="margin:5px 0 0;color:#6b7280;font-size:12px;">This message was sent from the BrandedUK contact form</p>
    </div>
  </div>
</body></html>`;
}

async function sendContactEmail(data) {
  try {
    const html = generateContactEmailHTML(data);

    console.log(`[EMAIL] Sending contact email to: ${process.env.EMAIL_TO}`);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: data.email,
      subject: `New Contact Form: ${data.interest?.charAt(0).toUpperCase() + data.interest?.slice(1)} - ${data.name}`,
      html,
    });

    const emailId = result?.data?.id || result?.id;

    if (emailId) {
      console.log("✅ Contact email sent. ID:", emailId);
      return { success: true, id: emailId };
    } else {
      console.warn("⚠️ Contact email sent but no ID:", JSON.stringify(result));
      return { success: true, id: null, warning: "No ID returned" };
    }
  } catch (error) {
    console.error("❌ Contact email failed:", error.message);
    console.error("[EMAIL] Details:", { status: error.status, response: error.response?.data || error.response });
    throw error;
  }
}

/* ==========================================================
   QUOTE EMAIL WITH FILE ATTACHMENTS (multer uploads)
========================================================== */

async function sendQuoteEmailWithAttachments(data, fileAttachments = [], logoUrls = {}) {
  try {
    const html = generateQuoteEmailHTML(data);

    console.log(`[EMAIL] Sending quote email with ${fileAttachments.length} file attachment(s)`);

    const emailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: data.customer?.email,
      subject: `New Quote Request - ${data.customer?.fullName || 'Customer'}`,
      html,
    };

    // Combine file attachments + base64 logo attachments
    const base64Attachments = extractLogoAttachments(data.customizations || []);
    const allAttachments = [
      ...fileAttachments.map(att => ({ filename: att.filename, content: att.content })),
      ...base64Attachments,
    ];

    if (allAttachments.length > 0) {
      emailOptions.attachments = allAttachments;
    }

    const result = await resend.emails.send(emailOptions);
    const emailId = result?.data?.id || result?.id;

    if (emailId) {
      console.log("✅ Quote email with attachments sent. ID:", emailId);
      return { success: true, id: emailId };
    } else {
      console.warn("⚠️ Email sent but no ID:", JSON.stringify(result));
      return { success: true, id: null, warning: "No ID returned" };
    }
  } catch (error) {
    console.error("❌ Quote email with attachments failed:", error.message);
    throw error;
  }
}

module.exports = { sendQuoteEmail, sendContactEmail, sendQuoteEmailWithAttachments };

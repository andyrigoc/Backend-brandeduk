# Fix Logo in Quote Email

## PROBLEMA
Il frontend manda il logo come `data:image/png;base64,...` perché l'upload a DO Spaces fallisce (credenziali scadute su Vercel).  
L'attuale `emailService.js` genera `<img src="data:...">` che **NON funziona** in Gmail/Outlook.

---

## COSA FARE

### 1) Fixare credenziali DO Spaces su Vercel
Vai su https://vercel.com → progetto brandeduk → Settings → Environment Variables.  
Verifica che queste variabili siano presenti e corrette:
```
DO_SPACES_KEY=...
DO_SPACES_SECRET=...
DO_SPACES_BUCKET=brandeduk
DO_SPACES_REGION=lon1
```

**Test:** `POST https://brandeduk.com/api/upload-logo` con body:
```json
{"logo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","position":"test"}
```
Se risponde con `{"url":"https://brandeduk.lon1.cdn..."}` → funziona.

---

### 2) Aggiornare `utils/emailService.js` per gestire ENTRAMBI i casi (URL e base64)

#### A) Nella funzione `generateQuoteEmailHTML` — sezione Customizations HTML

SOSTITUIRE il blocco `logoHTML`:

```js
      // Build logo preview HTML
      let logoHTML = '';
      if (c.logo) {
        if (c.logo.startsWith('data:')) {
          // Base64 — can't show inline in email, reference the attachment
          const posSlug = (c.position || 'unknown').replace(/\s+/g, '-');
          const ext = c.logo.startsWith('data:image/png') ? 'png' : 'jpg';
          logoHTML = `<br><span style="color:#7c3aed;font-size:13px;">📎 Logo attached: <strong>logo-${escapeHtml(posSlug)}.${ext}</strong></span>`;
        } else {
          // CDN URL — show inline
          logoHTML = `<br><img src="${escapeHtml(c.logo)}" alt="Logo" style="max-width: 150px; max-height: 100px; margin-top: 8px; border: 1px solid #e5e7eb; border-radius: 4px;"><br><a href="${escapeHtml(c.logo)}" target="_blank" style="color: #7c3aed; font-size: 12px;">Download Logo</a>`;
        }
      }
```

#### B) Nella funzione `generateQuoteEmailHTML` — sezione "Uploaded Logos"

SOSTITUIRE il blocco `imgTag`:

```js
  // -------- Uploaded Logos Section --------
  const logosWithData = customizations.filter(c => c.logo);
  if (logosWithData.length > 0) {
    html += `<div class="section"><h2>🖼 Uploaded Logos</h2><table>`;
    logosWithData.forEach(c => {
      let imgTag;
      if (c.logo.startsWith('data:')) {
        // Base64 — reference the email attachment
        const posSlug = (c.position || 'unknown').replace(/\s+/g, '-');
        const ext = c.logo.startsWith('data:image/png') ? 'png' : 'jpg';
        imgTag = `<span style="color:#7c3aed;">📎 See attached file: <strong>logo-${escapeHtml(posSlug)}.${ext}</strong></span>`;
      } else {
        // CDN URL — show inline with preview
        imgTag = `<a href="${escapeHtml(c.logo)}" target="_blank">View Logo</a><br><img src="${escapeHtml(c.logo)}" style="max-width:200px;max-height:150px;border:2px dashed #ea580c;padding:4px;border-radius:6px;">`;
      }
      html += `<tr><td class="label"><strong>${escapeHtml(c.position || 'Unknown')}:</strong></td><td class="value">${imgTag}</td></tr>`;
    });
    html += `</table></div>`;
  }
```

#### C) Nella funzione `sendQuoteEmail` — blocco attachment

SOSTITUIRE il blocco `logoAttachments` con:

```js
    // Extract base64 logos as email attachments
    const customizations = data.customizations || [];
    const logoAttachments = [];
    for (const c of customizations) {
      if (!c.logo) continue;

      if (c.logo.startsWith('data:')) {
        // BASE64 LOGO — convert to attachment
        const matches = c.logo.match(/data:([^;]+);base64,(.+)/);
        if (matches) {
          const mimeType = matches[1];
          const ext = mimeType === 'image/png' ? 'png' : 'jpg';
          const posSlug = (c.position || 'unknown').replace(/\s+/g, '-');
          logoAttachments.push({
            filename: `logo-${posSlug}.${ext}`,
            content: Buffer.from(matches[2], 'base64'),
          });
        }
      }
      // URL logos don't need attachment — they render inline via <img src="URL">
    }
```

---

## RISULTATO

| Scenario | Email mostra |
|---|---|
| DO Spaces funziona → logo è URL | ✅ Immagine inline visibile + link download |
| DO Spaces non funziona → logo è base64 | ✅ File allegato scaricabile + testo "📎 Logo attached" |

## PAYLOAD DAL FRONTEND

```json
{
  "customizations": [{
    "position": "Left Chest",
    "method": "Print",
    "type": "Logo",
    "hasLogo": true,
    "logo": "https://cdn.../logo.png  OPPURE  data:image/png;base64,...",
    "text": null,
    "unitPrice": 3.50,
    "lineTotal": 3.50,
    "quantity": 1
  }]
}
```

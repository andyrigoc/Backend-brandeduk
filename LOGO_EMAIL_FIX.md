# Fix Logo + Notes in Quote Email

## PROBLEMA 1 — Logo non visibile nell'email
Il frontend manda il logo come `data:image/png;base64,...` perché l'upload a DO Spaces fallisce (credenziali scadute su Vercel).  
L'attuale `emailService.js` genera `<img src="data:...">` che **NON funziona** in Gmail/Outlook.

## PROBLEMA 2 — Notes non arrivano nell'email
Il frontend manda le notes in 3 posti:
- `basket[0].note` = testo note
- `summary.orderNotes` = testo note
- `notes[]` = array con il testo

Ma il file `routes/quotes.js` **NON passa** `item.note` nella mappatura del basket → il campo si perde.

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

---

## FIX 3 — Notes non arrivano nell'email

### A) In `routes/quotes.js` — aggiungere `note` alla mappatura basket

Trovare il blocco:
```js
      basket: basket.map(item => ({
        name: item.name,
        code: item.code,
        color: item.color,
        quantity: item.quantity,
        sizes: item.sizes || {},
        sizesSummary: item.sizesSummary || '',
        unitPrice: item.unitPrice,
        itemTotal: item.itemTotal,
        image: item.image || null,
      })),
```

SOSTITUIRE con:
```js
      basket: basket.map(item => ({
        name: item.name,
        code: item.code,
        color: item.color,
        quantity: item.quantity,
        sizes: item.sizes || {},
        sizesSummary: item.sizesSummary || '',
        unitPrice: item.unitPrice,
        itemTotal: item.itemTotal,
        image: item.image || null,
        note: item.note || '',
      })),
```

### B) In `utils/emailService.js` — mostrare le note di ogni item nel basket

Nella funzione `generateQuoteEmailHTML`, nella sezione basket items, DOPO la riga `Item Total`:

```js
      // Inside basketHTML loop, after itemTotal row, add:
      if (item.note) {
        basketHTML += `<tr><td class="label">Notes:</td><td class="value" style="color:#7c3aed;font-style:italic;">${escapeHtml(item.note)}</td></tr>`;
      }
```

### C) Verificare la sezione "Customer Notes" già esistente

La sezione Customer Notes in `emailService.js` usa `data.notes` e `summary.orderNotes`.
Il frontend manda:
```json
{
  "summary": { "orderNotes": "testo note" },
  "notes": ["testo note"],
  "basket": [{ "note": "testo note", ... }]
}
```

Il codice attuale nel template:
```js
  const notes = Array.isArray(data.notes) ? [...data.notes] : [];
  const orderNotes = summary.orderNotes;
  if (orderNotes && !notes.includes(orderNotes)) notes.unshift(orderNotes);
```

Questo dovrebbe funzionare — ma assicurati che `data.notes` e `data.summary.orderNotes` arrivino correttamente (non vengano filtrati nel route).

---

## PAYLOAD COMPLETO DAL FRONTEND

```json
{
  "customer": {
    "fullName": "Mario Rossi",
    "phone": "1234567890",
    "email": "mario@test.com"
  },
  "summary": {
    "totalQuantity": 1,
    "totalItems": 1,
    "garmentCost": 3.35,
    "customizationCost": 3.50,
    "digitizingFee": 0,
    "subtotal": 6.85,
    "vatRate": 0.20,
    "vatAmount": 1.37,
    "totalExVat": 6.85,
    "totalIncVat": 8.22,
    "displayTotal": 8.22,
    "vatMode": "inc",
    "orderNotes": "Please deliver by Friday"
  },
  "basket": [{
    "name": "Ultra Cotton T-Shirt",
    "code": "GD002",
    "color": "Black",
    "size": "M",
    "quantity": 1,
    "unitPrice": 3.35,
    "itemTotal": 3.35,
    "image": "",
    "note": "Please deliver by Friday"
  }],
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
  }],
  "notes": ["Please deliver by Friday"],
  "timestamp": "2026-04-12T15:00:00.000Z"
}
```

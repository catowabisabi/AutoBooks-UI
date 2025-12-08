/**
 * Invoice PDF Generation with Signature and Stamp Support
 * Generates professional PDF invoices with branding, signatures, and company stamps
 */

export interface InvoiceDetails {
  invoice_number: string;
  date: string;
  due_date: string;
  customer: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    tax_id?: string;
  };
  company: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    tax_id?: string;
    logo_url?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    discount?: number;
    amount: number;
  }>;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total: number;
  amount_paid?: number;
  balance_due?: number;
  currency: string;
  notes?: string;
  terms?: string;
  payment_instructions?: string;
}

export interface SignatureData {
  image_data: string; // Base64 encoded image
  signer_name: string;
  signed_at: string;
  title?: string; // e.g., "Sales Manager", "CEO"
}

export interface CompanyStamp {
  image_data: string; // Base64 encoded image
  position?: 'bottom-left' | 'bottom-right' | 'center';
}

export interface InvoicePdfOptions {
  signature?: SignatureData;
  stamp?: CompanyStamp;
  watermark?: string;
  show_bank_details?: boolean;
  include_qr_code?: boolean;
  template?: 'modern' | 'classic' | 'minimal';
  locale?: string;
  date_format?: string;
}

/**
 * Generate Invoice PDF with optional signature and stamp
 */
export async function generateInvoicePdf(
  invoice: InvoiceDetails,
  options: InvoicePdfOptions = {}
): Promise<Blob> {
  // This would typically use a library like jsPDF or call a backend API
  // For now, we'll structure the data for backend PDF generation
  
  const pdfPayload = {
    invoice,
    options: {
      template: options.template || 'modern',
      locale: options.locale || 'en',
      date_format: options.date_format || 'YYYY-MM-DD',
      ...options,
    },
  };

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBaseUrl}/api/v1/invoices/generate-pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(pdfPayload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
}

/**
 * Generate a stamped PDF from an existing PDF
 */
export async function addStampToPdf(
  pdfBlob: Blob,
  stamp: CompanyStamp
): Promise<Blob> {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfBlob);
    formData.append('stamp_image', stamp.image_data);
    formData.append('position', stamp.position || 'bottom-right');

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBaseUrl}/api/v1/documents/add-stamp/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add stamp to PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error adding stamp to PDF:', error);
    throw error;
  }
}

/**
 * Generate a signed PDF from an existing PDF
 */
export async function addSignatureToPdf(
  pdfBlob: Blob,
  signature: SignatureData
): Promise<Blob> {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfBlob);
    formData.append('signature_image', signature.image_data);
    formData.append('signer_name', signature.signer_name);
    formData.append('signed_at', signature.signed_at);
    if (signature.title) {
      formData.append('title', signature.title);
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBaseUrl}/api/v1/documents/add-signature/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add signature to PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error adding signature to PDF:', error);
    throw error;
  }
}

/**
 * Download a PDF blob as a file
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open a PDF blob in a new tab for preview
 */
export function previewPdf(blob: Blob): Window | null {
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  // Clean up URL after a delay to allow the window to load
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return newWindow;
}

/**
 * Format currency for PDF display
 */
export function formatPdfCurrency(amount: number, currency: string = 'TWD'): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for PDF display
 */
export function formatPdfDate(date: string, locale: string = 'zh-TW'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Create a simple HTML invoice template that can be printed or converted to PDF
 */
export function createInvoiceHtml(
  invoice: InvoiceDetails,
  options: InvoicePdfOptions = {}
): string {
  const { signature, stamp, watermark, template = 'modern' } = options;

  const templateStyles = {
    modern: `
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      .invoice-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
      .invoice-title { font-size: 2.5rem; font-weight: 700; }
    `,
    classic: `
      body { font-family: 'Times New Roman', Times, serif; }
      .invoice-header { border-bottom: 3px double #333; padding-bottom: 1rem; }
      .invoice-title { font-size: 2rem; font-weight: bold; letter-spacing: 0.1em; }
    `,
    minimal: `
      body { font-family: 'Helvetica Neue', Arial, sans-serif; }
      .invoice-header { padding: 1rem 0; }
      .invoice-title { font-size: 1.5rem; font-weight: 300; text-transform: uppercase; }
    `,
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${templateStyles[template]}
    .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; position: relative; }
    ${watermark ? `
    .watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 6rem; opacity: 0.05; pointer-events: none;
      font-weight: bold; color: #333;
    }` : ''}
    .invoice-meta { display: flex; justify-content: space-between; margin: 2rem 0; }
    .customer-info, .company-info { width: 45%; }
    .info-label { font-size: 0.75rem; text-transform: uppercase; color: #666; margin-bottom: 0.25rem; }
    .info-value { font-size: 1rem; margin-bottom: 0.5rem; }
    .items-table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
    .items-table th { background: #f8f9fa; padding: 0.75rem; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
    .items-table td { padding: 0.75rem; border-bottom: 1px solid #dee2e6; }
    .items-table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
    .totals-row.total { font-size: 1.25rem; font-weight: 700; border-top: 2px solid #333; padding-top: 1rem; }
    .signature-section { margin-top: 3rem; display: flex; justify-content: space-between; }
    .signature-block { width: 200px; text-align: center; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 0.5rem; }
    .signature-image { max-height: 60px; }
    .stamp-container { position: absolute; bottom: 100px; right: 50px; opacity: 0.8; }
    .stamp-image { max-width: 120px; max-height: 120px; }
    .notes { margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .notes-title { font-weight: 600; margin-bottom: 0.5rem; }
    @media print {
      .invoice-container { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
    
    <div class="invoice-header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          ${invoice.company.logo_url ? `<img src="${invoice.company.logo_url}" alt="Company Logo" style="max-height: 60px;">` : ''}
          <h1 class="invoice-title">${invoice.company.name}</h1>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; font-weight: 600;">INVOICE</div>
          <div style="font-size: 1.25rem;">#${invoice.invoice_number}</div>
        </div>
      </div>
    </div>

    <div class="invoice-meta">
      <div class="customer-info">
        <div class="info-label">Bill To</div>
        <div class="info-value" style="font-weight: 600; font-size: 1.125rem;">${invoice.customer.name}</div>
        ${invoice.customer.address ? `<div class="info-value">${invoice.customer.address}</div>` : ''}
        ${invoice.customer.email ? `<div class="info-value">${invoice.customer.email}</div>` : ''}
        ${invoice.customer.phone ? `<div class="info-value">${invoice.customer.phone}</div>` : ''}
        ${invoice.customer.tax_id ? `<div class="info-value">Tax ID: ${invoice.customer.tax_id}</div>` : ''}
      </div>
      <div class="company-info" style="text-align: right;">
        <div class="info-label">Invoice Details</div>
        <div class="info-value"><strong>Date:</strong> ${formatPdfDate(invoice.date)}</div>
        <div class="info-value"><strong>Due Date:</strong> ${formatPdfDate(invoice.due_date)}</div>
        ${invoice.company.tax_id ? `<div class="info-value"><strong>Tax ID:</strong> ${invoice.company.tax_id}</div>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%;">Description</th>
          <th style="width: 15%; text-align: center;">Qty</th>
          <th style="width: 20%; text-align: right;">Unit Price</th>
          <th style="width: 20%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td class="amount">${formatPdfCurrency(item.unit_price, invoice.currency)}</td>
          <td class="amount">${formatPdfCurrency(item.amount, invoice.currency)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${formatPdfCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${invoice.discount_amount ? `
      <div class="totals-row">
        <span>Discount:</span>
        <span>-${formatPdfCurrency(invoice.discount_amount, invoice.currency)}</span>
      </div>
      ` : ''}
      <div class="totals-row">
        <span>Tax:</span>
        <span>${formatPdfCurrency(invoice.tax_amount, invoice.currency)}</span>
      </div>
      <div class="totals-row total">
        <span>Total:</span>
        <span>${formatPdfCurrency(invoice.total, invoice.currency)}</span>
      </div>
      ${invoice.amount_paid ? `
      <div class="totals-row">
        <span>Amount Paid:</span>
        <span>${formatPdfCurrency(invoice.amount_paid, invoice.currency)}</span>
      </div>
      <div class="totals-row" style="font-weight: 600; color: ${(invoice.balance_due || 0) > 0 ? '#dc2626' : '#16a34a'};">
        <span>Balance Due:</span>
        <span>${formatPdfCurrency(invoice.balance_due || 0, invoice.currency)}</span>
      </div>
      ` : ''}
    </div>

    ${invoice.notes ? `
    <div class="notes">
      <div class="notes-title">Notes</div>
      <div>${invoice.notes}</div>
    </div>
    ` : ''}

    ${invoice.payment_instructions ? `
    <div class="notes">
      <div class="notes-title">Payment Instructions</div>
      <div>${invoice.payment_instructions}</div>
    </div>
    ` : ''}

    <div class="signature-section">
      <div class="signature-block">
        ${signature ? `
        <img src="${signature.image_data}" alt="Signature" class="signature-image">
        <div class="signature-line">
          ${signature.signer_name}
          ${signature.title ? `<br><small>${signature.title}</small>` : ''}
          <br><small>${formatPdfDate(signature.signed_at)}</small>
        </div>
        ` : `
        <div class="signature-line">Authorized Signature</div>
        `}
      </div>
    </div>

    ${stamp ? `
    <div class="stamp-container">
      <img src="${stamp.image_data}" alt="Company Stamp" class="stamp-image">
    </div>
    ` : ''}

  </div>
</body>
</html>
  `.trim();
}

/**
 * Print the invoice HTML
 */
export function printInvoiceHtml(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

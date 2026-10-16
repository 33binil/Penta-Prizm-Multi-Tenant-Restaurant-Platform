import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(tokenOpaque: string, domain: string = 'velvet-roast.pentaprizm.app'): Promise<string> {
  const scanUrl = `https://${domain}/scan/${tokenOpaque}`;
  try {
    return await QRCode.toDataURL(scanUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

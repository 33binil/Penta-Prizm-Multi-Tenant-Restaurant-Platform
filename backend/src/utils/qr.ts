import crypto from 'crypto';

export function generateOpaqueQRToken(restaurantSlug: string, tableNumber: string): { tokenOpaque: string; tokenHash: string } {
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const slugClean = restaurantSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const tableClean = tableNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const tokenOpaque = `PZ-${slugClean}-T${tableClean}-${randomSuffix}`;
  
  const tokenHash = crypto.createHash('sha256').update(tokenOpaque).digest('hex');
  return { tokenOpaque, tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

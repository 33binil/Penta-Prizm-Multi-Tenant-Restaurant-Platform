export function validateQRTokenInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body.token !== 'string' || body.token.trim().length === 0) {
    return { valid: false, error: 'A valid table QR token string is required' };
  }
  return { valid: true };
}

export function validateOrderInput(body: any): { valid: boolean; error?: string } {
  if (!body) return { valid: false, error: 'Request body is required' };
  if (!body.restaurantId || typeof body.restaurantId !== 'string') {
    return { valid: false, error: 'restaurantId is required' };
  }
  if (!body.branchId || typeof body.branchId !== 'string') {
    return { valid: false, error: 'branchId is required' };
  }
  if (!body.tableId || typeof body.tableId !== 'string') {
    return { valid: false, error: 'tableId is required' };
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { valid: false, error: 'Order must contain at least one item' };
  }
  return { valid: true };
}

export function validateLoginInput(body: any): { valid: boolean; error?: string } {
  if (!body || !body.email || !body.password) {
    return { valid: false, error: 'Email and password are required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return { valid: false, error: 'Invalid email address format' };
  }
  return { valid: true };
}

export function validateRegisterAdminInput(body: any): { valid: boolean; error?: string } {
  if (!body) return { valid: false, error: 'Request body is required' };
  if (!body.email || !body.password || !body.name || !body.restaurantName) {
    return { valid: false, error: 'Name, email, password, and restaurant name are required' };
  }
  if (body.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
}

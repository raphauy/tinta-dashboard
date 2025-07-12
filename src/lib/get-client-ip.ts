import { headers } from 'next/headers'

/**
 * Obtiene la IP del cliente desde los headers de la request
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers()
  
  // Intenta obtener la IP real desde diferentes headers
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const connectingIP = headersList.get('x-connecting-ip')
  
  if (forwardedFor) {
    // x-forwarded-for puede contener múltiples IPs separadas por comas
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (connectingIP) {
    return connectingIP.trim()
  }
  
  // Fallback para desarrollo local
  return '127.0.0.1'
}
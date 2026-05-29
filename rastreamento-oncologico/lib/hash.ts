/**
 * lib/hash.ts
 * Utilitário para anonimizar números de WhatsApp via SHA-256.
 * LGPD: Nunca armazenamos o número real — somente o hash irreversível.
 */

import crypto from 'crypto'

/**
 * Normaliza e faz hash SHA-256 de um número de WhatsApp.
 * Remove espaços, traços e parênteses antes de hashear.
 *
 * @param numero - Número no formato +5511999990001 ou 5511999990001
 * @returns Hash SHA-256 em hexadecimal (64 chars)
 */
export function hashWhatsApp(numero: string): string {
  // Normaliza: remove tudo que não seja dígito ou '+'
  const normalizado = numero.replace(/[^\d+]/g, '').trim()

  if (!normalizado || normalizado.length < 10) {
    throw new Error(`Número de WhatsApp inválido: "${numero}"`)
  }

  return crypto.createHash('sha256').update(normalizado).digest('hex')
}

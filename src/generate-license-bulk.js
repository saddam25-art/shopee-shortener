#!/usr/bin/env node
/**
 * Bulk License Key Generator for SADDAM Shortlink
 * 
 * Usage: node src/generate-license-bulk.js <count> [expiry-days]
 * 
 * Example:
 *   node src/generate-license-bulk.js 10 365
 *   
 * This generates generic keys that work on ANY machine (not machine-bound)
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const LICENSE_SECRET = 'SADDAM-SHORTLINK-2024-SECRET-KEY'

function generateBulkKey(expiryDays = 365) {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  const expiryTimestamp = expiryDate.getTime()
  
  // Generate random unique ID
  const uniqueId = crypto.randomBytes(4).toString('hex').toUpperCase()
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(`BULK|${uniqueId}|${expiryTimestamp}`)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase()
  
  // Format: BULK-XXXX-XXXX-XXXX
  const licenseKey = `BULK-${uniqueId.substring(0, 4)}-${uniqueId.substring(4, 8)}-${signature.substring(0, 4)}`
  
  return {
    licenseKey,
    expiryDate: expiryDate.toISOString().split('T')[0],
    expiryDays
  }
}

const count = parseInt(process.argv[2]) || 10
const expiryDays = parseInt(process.argv[3]) || 365

console.log('╔════════════════════════════════════════════════════════╗')
console.log('║   SADDAM Shortlink - Bulk License Key Generator        ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log('')
console.log(`Generating ${count} license keys (valid for ${expiryDays} days)...`)
console.log('')

const keys = []
for (let i = 0; i < count; i++) {
  const license = generateBulkKey(expiryDays)
  keys.push(license)
  console.log(`${i + 1}. ${license.licenseKey}  (expires: ${license.expiryDate})`)
}

// Save to file
const outputFile = `license-keys-${Date.now()}.txt`
const outputContent = keys.map((k, i) => `${i + 1}. ${k.licenseKey} (expires: ${k.expiryDate})`).join('\n')

fs.writeFileSync(outputFile, `SADDAM Shortlink License Keys\nGenerated: ${new Date().toISOString()}\nExpiry: ${expiryDays} days\n\n${outputContent}`)

console.log('')
console.log(`✅ Keys saved to: ${outputFile}`)
console.log('')
console.log('These are BULK keys - they work on ANY computer!')

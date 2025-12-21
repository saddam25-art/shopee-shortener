#!/usr/bin/env node
/**
 * License Key Generator for SADDAM Shortlink
 * 
 * Usage: node src/generate-license.js <machine-id> [expiry-days]
 * 
 * Example:
 *   node src/generate-license.js abc123def456 365
 */

import { generateLicenseKey } from './license.js'

const machineId = process.argv[2]
const expiryDays = parseInt(process.argv[3]) || 365

if (!machineId) {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║     SADDAM Shortlink - License Key Generator           ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Usage: node src/generate-license.js <machine-id> [expiry-days]')
  console.log('')
  console.log('The machine-id is shown when the user runs the app without a license.')
  console.log('')
  process.exit(1)
}

console.log('╔════════════════════════════════════════════════════════╗')
console.log('║     SADDAM Shortlink - License Key Generator           ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log('')

const license = generateLicenseKey(machineId, expiryDays)

console.log('Machine ID:', license.machineId)
console.log('Expiry Date:', license.expiryDate)
console.log('Expiry Days:', expiryDays)
console.log('')
console.log('╔════════════════════════════════════════════════════════╗')
console.log('║  LICENSE KEY:  ' + license.licenseKey + '                       ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log('')
console.log('Give this key to the user. They will enter it in the app.')

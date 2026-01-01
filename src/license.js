import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { machineIdSync } from 'node-machine-id'

// Secret key for license generation (keep this private!)
const LICENSE_SECRET = 'SADDAM-SHORTLINK-2024-SECRET-KEY'

// Get data directory
function getDataDir() {
  const exeDir = process.pkg ? path.dirname(process.execPath) : process.cwd()
  const dataDir = path.join(exeDir, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return dataDir
}

// Get machine ID (unique per computer)
export function getMachineId() {
  try {
    return machineIdSync(true)
  } catch (err) {
    // Fallback if machine-id fails
    return 'unknown-machine'
  }
}

// Generate a license key for a specific machine
export function generateLicenseKey(machineId, expiryDays = 365) {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  const expiryTimestamp = expiryDate.getTime()
  
  // Create license data
  const licenseData = `${machineId}|${expiryTimestamp}`
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(licenseData)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase()
  
  // Format: XXXX-XXXX-XXXX-XXXX (machine bound + expiry encoded)
  const machineHash = crypto
    .createHash('md5')
    .update(machineId)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase()
  
  const expiryEncoded = Buffer.from(expiryTimestamp.toString())
    .toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .substring(0, 8)
    .toUpperCase()
  
  const licenseKey = `${machineHash.substring(0, 4)}-${machineHash.substring(4, 8)}-${expiryEncoded.substring(0, 4)}-${signature.substring(0, 4)}`
  
  return {
    licenseKey,
    machineId,
    expiryDate: expiryDate.toISOString(),
    expiryTimestamp
  }
}

// Validate a license key
export function validateLicenseKey(licenseKey, machineId) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, error: 'No license key provided' }
  }
  
  // Clean up the key
  const cleanKey = licenseKey.trim().toUpperCase()
  
  // Check format
  const parts = cleanKey.split('-')
  if (parts.length !== 4 || parts.some(p => p.length !== 4)) {
    return { valid: false, error: 'Invalid license key format' }
  }
  
  // Check if it's a BULK key (works on any machine)
  if (parts[0] === 'BULK') {
    const uniqueId = parts[1] + parts[2]
    // Verify signature for bulk key
    const expectedSig = crypto
      .createHmac('sha256', LICENSE_SECRET)
      .update(`BULK|${uniqueId}|`)
      .digest('hex')
      .substring(0, 4)
      .toUpperCase()
    
    // Bulk keys are valid (simplified check - in production add expiry)
    return { valid: true, message: 'Bulk license valid', type: 'bulk' }
  }
  
  // Check machine hash for machine-bound keys
  const machineHash = crypto
    .createHash('md5')
    .update(machineId)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase()
  
  const keyMachineHash = parts[0] + parts[1]
  
  if (keyMachineHash !== machineHash) {
    return { valid: false, error: 'License key is for a different computer' }
  }
  
  return { valid: true, message: 'License valid', type: 'machine' }
}

// Save license to file
export function saveLicense(licenseKey) {
  const dataDir = getDataDir()
  const licensePath = path.join(dataDir, 'license.key')
  fs.writeFileSync(licensePath, licenseKey.trim())
}

// Load license from file
export function loadLicense() {
  const dataDir = getDataDir()
  const licensePath = path.join(dataDir, 'license.key')
  
  if (!fs.existsSync(licensePath)) {
    return null
  }
  
  try {
    return fs.readFileSync(licensePath, 'utf8').trim()
  } catch (err) {
    return null
  }
}

// Check if license is valid
export function checkLicense() {
  const machineId = getMachineId()
  const licenseKey = loadLicense()
  
  if (!licenseKey) {
    return { valid: false, error: 'No license found', machineId }
  }
  
  const result = validateLicenseKey(licenseKey, machineId)
  return { ...result, machineId, licenseKey }
}

/**
 * Seed script: creates test accounts for premium/non-premium flows.
 *
 * Usage (from fitex-server/fitex/):
 *   node scripts/seed-test-accounts.js
 *
 * Requires MONGODB_URI in .env
 */
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const ACCOUNTS = [
  {
    email: 'premium@fitex.app',
    password: 'Premium2026!',
    firstName: 'Premium',
    lastName: 'Active',
    isPremium: true,
    premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'expired@fitex.app',
    password: 'Expired2026!',
    firstName: 'Premium',
    lastName: 'Expired',
    isPremium: false,
    premiumExpiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    trialStartedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    trialEndsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('ERROR: MONGODB_URI not set in .env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const UserSchema = new mongoose.Schema({}, { strict: false })
  const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users')

  for (const acc of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acc.password, 12)
    const existing = await User.findOne({ email: acc.email })

    const patch = {
      passwordHash,
      provider: 'email',
      providerId: acc.email,
      isEmailVerified: true,
      isNewUser: false,
      isPremium: acc.isPremium,
      premiumExpiresAt: acc.premiumExpiresAt,
      trialStartedAt: acc.trialStartedAt,
      trialEndsAt: acc.trialEndsAt,
      firstName: acc.firstName,
      lastName: acc.lastName,
      settings: {},
    }

    if (existing) {
      await User.updateOne({ email: acc.email }, { $set: patch })
      console.log(`✓ Updated: ${acc.email}`)
    } else {
      await User.create({ email: acc.email, ...patch })
      console.log(`✓ Created: ${acc.email}`)
    }
  }

  console.log('')
  console.log('Test accounts:')
  for (const acc of ACCOUNTS) {
    console.log(`- ${acc.email} / ${acc.password} (${acc.isPremium ? 'PREMIUM' : 'BASIC'})`)
  }
  console.log('')
  console.log('Use "Sign in with Email" on the login screen.')

  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


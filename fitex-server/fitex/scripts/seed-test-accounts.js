/**
 * Seed script: creates test accounts for premium/non-premium flows.
 *
 * Usage (from fitex-server/fitex/):
 *   node scripts/seed-test-accounts.js
 *
 * Requires MONGODB_URI (в .env локально или в env контейнера / CI).
 */
try {
  require('dotenv').config()
} catch {
  /* Docker: пакета dotenv может не быть, переменные уже в process.env */
}
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

/** App Review / QA: email+password, разные сроки premiumExpiresAt (следующее «списание» в приложении). */
const REVIEWER_PASSWORD = 'FitexReview2026!'

const ACCOUNTS = [
  {
    email: 'reviewer-2h@fitex.app',
    password: REVIEWER_PASSWORD,
    firstName: 'Review',
    lastName: 'Soon2h',
    isPremium: true,
    premiumExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    trialStartedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    trialEndsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'reviewer-3d@fitex.app',
    password: REVIEWER_PASSWORD,
    firstName: 'Review',
    lastName: 'Plus3d',
    isPremium: true,
    premiumExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'reviewer-14d@fitex.app',
    password: REVIEWER_PASSWORD,
    firstName: 'Review',
    lastName: 'Plus14d',
    isPremium: true,
    premiumExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'reviewer-90d@fitex.app',
    password: REVIEWER_PASSWORD,
    firstName: 'Review',
    lastName: 'Plus90d',
    isPremium: true,
    premiumExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'reviewer-expired@fitex.app',
    password: REVIEWER_PASSWORD,
    firstName: 'Review',
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
    console.error('ERROR: MONGODB_URI is not set (env or .env)')
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
  console.log('Reviewer test accounts (same password for all):')
  console.log(`Password: ${REVIEWER_PASSWORD}`)
  for (const acc of ACCOUNTS) {
    console.log(
      `- ${acc.email} (${acc.isPremium ? 'PREMIUM' : 'BASIC'}, expires: ${acc.premiumExpiresAt.toISOString()})`,
    )
  }
  console.log('')
  console.log('Use "Sign in with Email" on the login screen.')

  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


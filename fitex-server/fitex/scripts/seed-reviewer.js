/**
 * Seed script: creates the App Store reviewer account.
 *
 * Usage (from fitex-server/fitex/):
 *   node scripts/seed-reviewer.js
 *
 * Requires MONGODB_URI in .env
 */
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const REVIEWER_EMAIL = 'reviewer@fitex.app'
const REVIEWER_PASSWORD = 'Reviewer2024!'

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

  const existing = await User.findOne({ email: REVIEWER_EMAIL })
  const passwordHash = await bcrypt.hash(REVIEWER_PASSWORD, 12)

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  if (existing) {
    await User.updateOne({ email: REVIEWER_EMAIL }, {
      $set: {
        passwordHash,
        provider: 'email',
        providerId: REVIEWER_EMAIL,
        isEmailVerified: true,
        isPremium: true,
        isNewUser: false,
        trialStartedAt: new Date(),
        trialEndsAt: thirtyDaysFromNow,
        firstName: 'App',
        lastName: 'Reviewer',
      },
    })
    console.log('✓ Reviewer account updated')
  } else {
    await User.create({
      email: REVIEWER_EMAIL,
      provider: 'email',
      providerId: REVIEWER_EMAIL,
      firstName: 'App',
      lastName: 'Reviewer',
      passwordHash,
      isEmailVerified: true,
      isPremium: true,
      isNewUser: false,
      trialStartedAt: new Date(),
      trialEndsAt: thirtyDaysFromNow,
      settings: {},
    })
    console.log('✓ Reviewer account created')
  }

  console.log('')
  console.log('  Email:    ' + REVIEWER_EMAIL)
  console.log('  Password: ' + REVIEWER_PASSWORD)
  console.log('')
  console.log('Use "Sign in with Email" on the login screen.')

  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

import { ensureUserInPrisma } from '../src/lib/ensure-user'

async function main() {
  const userId = 'cmp2xusut00jbv108ui6aeku5'
  console.log('Ensuring user in Prisma:', userId)
  const result = await ensureUserInPrisma(userId)
  console.log('Result:', result)
}

main().catch(console.error)

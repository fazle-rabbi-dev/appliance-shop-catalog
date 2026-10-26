/**
 * Seeds MongoDB with the mock catalog: categories + products.
 * Run with: bun run seed
 */
import mongoose from 'mongoose'
import { connectToDatabase } from '../lib/data/mongoose'
import { seedDatabase } from '../lib/data/seed'

async function main() {
  await connectToDatabase()
  const result = await seedDatabase()
  console.log(`Seeded ${result.categories} categories and ${result.products} products.`)
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})

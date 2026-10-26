import dns from 'node:dns'
import mongoose from 'mongoose'

/**
 * Mongoose connection, cached on globalThis so dev HMR does not reconnect.
 * Set MONGODB_URI to any local/remote URI; MONGODB_DB is optional and only
 * needed when the URI has no database name.
 */
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

/**
 * `mongodb+srv://` URIs require SRV/TXT lookups. Node's bundled c-ares often
 * fails those on Windows/newer Node versions, so resolve through explicit DNS
 * servers. Override with DNS_SERVERS="1.1.1.1,9.9.9.9".
 */
const dnsServers = (process.env.DNS_SERVERS ?? '1.1.1.1,8.8.8.8')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean)

function configureDns() {
  if (dnsServers.length === 0) return
  try {
    dns.setServers(dnsServers)
  } catch {
    // Invalid DNS server list — leave the default resolver untouched.
  }
}

const globalMongoose = globalThis as typeof globalThis & {
  __mongoosePromise?: Promise<typeof mongoose>
}

export function connectToDatabase(): Promise<typeof mongoose> {
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to .env.local.')

  if (!globalMongoose.__mongoosePromise) {
    configureDns()
    globalMongoose.__mongoosePromise = mongoose.connect(uri, {
      dbName: dbName || undefined,
      maxPoolSize: 10,
    })
  }

  return globalMongoose.__mongoosePromise
}

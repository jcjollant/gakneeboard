import 'dotenv/config'
import { StripeClient } from '../backend/business/Stripe'

async function main() {
    const sessionId = process.argv[2]
    if (!sessionId) {
        console.error('Please provide a session ID')
        process.exit(1)
    }

    try {
        console.log('Fetching session', sessionId)
        const session = await StripeClient.instanceProd.getSession(sessionId)
        console.log(JSON.stringify(session, null, 2))
    } catch (e) {
        console.error('Error fetching session', e)
    }
}

main()

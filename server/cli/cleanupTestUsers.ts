#!/usr/bin/env tsx

/**
 * Clean up test users from the database
 * Usage: npm run cleanup-test-users
 */

import { sql } from '@vercel/postgres'
import * as readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve))
}

async function cleanupTestUsers() {
    console.log('🧹 Test User Cleanup Tool\n')

    const email = await question('Enter test user email to delete (or "list" to see all Supabase users): ')

    if (email.toLowerCase() === 'list') {
        // List all Supabase users
        const result = await sql`
      SELECT id, data->>'email' as email, data->>'name' as name, source, create_date
      FROM users
      WHERE source = 'supabase'
      ORDER BY create_date DESC
    `

        console.log('\n📋 Supabase Users:')
        console.log('─'.repeat(80))
        result.rows.forEach(row => {
            console.log(`ID: ${row.id} | Email: ${row.email} | Name: ${row.name} | Created: ${row.create_date}`)
        })
        console.log('─'.repeat(80))
        console.log(`Total: ${result.rows.length} users\n`)

        rl.close()
        return
    }

    if (!email || !email.includes('@')) {
        console.error('❌ Invalid email address')
        rl.close()
        return
    }

    // Find the user
    const findResult = await sql`
    SELECT id, data->>'email' as email, data->>'name' as name, sha256
    FROM users
    WHERE source = 'supabase' 
      AND data->>'email' = ${email}
  `

    if (findResult.rows.length === 0) {
        console.log(`ℹ️  No user found with email: ${email}`)
        rl.close()
        return
    }

    const user = findResult.rows[0]
    console.log('\n📌 Found user:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   SHA256: ${user.sha256}\n`)

    const confirm = await question('⚠️  Delete this user? (yes/no): ')

    if (confirm.toLowerCase() === 'yes') {
        await sql`DELETE FROM users WHERE id = ${user.id}`
        console.log('✅ User deleted from database')
        console.log('⚠️  Remember to also delete from Supabase Dashboard if needed!')
    } else {
        console.log('❌ Deletion cancelled')
    }

    rl.close()
}

cleanupTestUsers()
    .then(() => {
        console.log('\n✨ Done!')
        process.exit(0)
    })
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })

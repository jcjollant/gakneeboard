import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { email, type = 'signup' } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  const supabaseUrl = config.public.SUPABASE_URL
  const supabaseServiceRoleKey = config.supabaseServiceRoleKey

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase environment variables are not configured on the server',
    })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type,
    email
  })

  if (error) {
    console.error('Error generating link:', error.message)
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return {
    link: data.properties.action_link
  }
})

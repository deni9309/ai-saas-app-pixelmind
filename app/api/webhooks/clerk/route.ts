import { clerkClient } from '@clerk/nextjs'
import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'

import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add the WEBHOOK_SECRET env. variable from Clerk dashboard to your .env file.',
    )
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let event: WebhookEvent

  // Verify the payload with the headers
  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook:', error)
    return new Response('Error occured', { status: 400 })
  }

  // Get the ID and type
  const { id } = event.data
  const eventType = event.type

  // Create
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = event.data

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    }

    const newUser = await createUser(user)

    // Set public metadata
    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { userId: newUser._id },
      })

      return NextResponse.json({ message: 'OK', user: newUser })
    } else {
      return NextResponse.json({ message: 'Error occured', user: null })
    }
  }

  // Update
  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = event.data

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      photo: image_url,
    }

    const updatedUser = await updateUser(id, user)

    if (updatedUser) {
      return NextResponse.json({ message: 'OK', user: updatedUser })
    } else {
      return NextResponse.json({ message: 'Error occured', user: null })
    }
  }

  // Delete
  if (eventType === 'user.deleted') {
    const { id } = event.data

    const deletedUser = await deleteUser(id!)

    if (deletedUser) {
      return NextResponse.json({ message: 'OK', user: deletedUser })
    } else {
      return NextResponse.json({ message: 'Error occured', user: null })
    }
  }

  console.info(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.info('Webhook body:', body)

  return new Response('', { status: 200 })
}

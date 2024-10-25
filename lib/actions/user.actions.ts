'use server'

import { revalidatePath } from 'next/cache'

import User, { IUser } from '../database/models/user.model'
import { connectToDatabase } from '../database/mongoose'
import { handleError } from '../utils'

/**
 * Deletes a user by their Clerk ID.
 *
 * @param {string} clerkId The Clerk ID of the user to delete.
 *
 * @returns {Promise<IUser | null>} A promise that resolves to the deleted user, or null if the user was not found.
 */
export async function deleteUser(clerkId: string): Promise<IUser | null> {
  try {
    await connectToDatabase()

    const userToDelete: IUser | null = await User.findOne({ clerkId })

    if (!userToDelete) throw new Error('User not found')

    const deletedUser: IUser | null = await User.findByIdAndDelete(userToDelete._id)
    revalidatePath('/')

    if (deletedUser) return JSON.parse(JSON.stringify(deletedUser))
  } catch (error) {
    handleError(error)
  }

  return null
}

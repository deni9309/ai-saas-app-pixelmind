'use server'

import { revalidatePath } from 'next/cache'

import User, { IUser } from '@/lib/database/models/user.model'
import { connectToDatabase } from '@/lib/database/mongoose'
import { handleError } from '@/lib/utils'

/**
 * Creates a new user in the database.
 *
 * @param {CreateUserParams} user The user to create.
 *
 * @returns {Promise<IUser | null>} A promise that resolves to the created user, or null if an error occurred.
 */
export async function createUser(user: CreateUserParams): Promise<IUser | null> {
  try {
    await connectToDatabase()
    const newUser = await User.create(user)

    if (newUser) {
      revalidatePath('/')

      return new Promise<IUser>(JSON.parse(JSON.stringify(newUser)))
    }
  } catch (error) {
    handleError(error)
  }
  return null
}

/**
 * Finds a user by their Clerk ID.
 *
 * @param {string} userClerkId The Clerk ID of the user to find.
 *
 * @returns {Promise<IUser | null>} A promise that resolves to the found user, or null if the user was not found.
 */
export async function getUserByClerkId(userClerkId: string): Promise<IUser | null> {
  try {
    await connectToDatabase()

    const user: IUser | null = await User.findOne({ clerkId: userClerkId })

    if (!user) throw new Error('User not found')

    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    handleError(error)
  }

  return null
}

/**
 * Updates a user by their Clerk ID.
 *
 * @param {string} clerkId The Clerk ID of the user to update.
 * @param {UpdateUserParams} user The updated user info.
 *
 * @returns {Promise<IUser | null>} A promise that resolves to the updated user, or null if an error occurred.
 */
export async function updateUser(clerkId: string, user: UpdateUserParams): Promise<IUser | null> {
  try {
    await connectToDatabase()

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true })

    if (!updatedUser) throw new Error('User update failed')

    revalidatePath('/')
    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    handleError(error)
  }
  return null
}

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

    if (deletedUser) {
      revalidatePath('/')

      return JSON.parse(JSON.stringify(deletedUser))
    }
  } catch (error) {
    handleError(error)
  }
  return null
}

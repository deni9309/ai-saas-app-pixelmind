'use server'

import { revalidatePath } from 'next/cache'

import User, { IUser } from '@/lib/database/models/user.model'
import { connectToDatabase } from '@/lib/database/mongoose'
import { handleError } from '@/lib/utils'

/**
 * Creates a new user in the database.
 *
 * @param user - The user to create with their respective properties.
 *
 * @returns The newly created user, or undefined if there was an error.
 */
export async function createUser(user: CreateUserParams): Promise<IUser | undefined> {
  try {
    await connectToDatabase()

    const newUser = await User.create(user)
    if (!newUser) throw new Error('User creation failed')

    revalidatePath('/')

    return new Promise<IUser>(JSON.parse(JSON.stringify(newUser)))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Finds a user by their Clerk ID.
 *
 * @param {string} userClerkId The Clerk ID of the user to find.
 *
 * @returns {Promise<IUser | undefined>} A promise that resolves to the found user, or undefined if the user was not found.
 */
export async function getUserByClerkId(userClerkId: string): Promise<IUser | undefined> {
  try {
    await connectToDatabase()

    const user = await User.findOne<IUser>({ clerkId: userClerkId })

    if (!user) throw new Error('User not found')

    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Updates a user by their Clerk ID.
 *
 * @param {string} clerkId The Clerk ID of the user to update.
 *
 * @param {UpdateUserParams} user The user data to update.
 *
 * @returns {Promise<IUser | undefined>} A promise that resolves to the updated user, or undefined if the user was not found.
 */
export async function updateUser(
  clerkId: string,
  user: UpdateUserParams,
): Promise<IUser | undefined> {
  try {
    await connectToDatabase()

    const updatedUser = await User.findOneAndUpdate<IUser>({ clerkId }, user, { new: true })

    if (!updatedUser) throw new Error('User update failed')

    revalidatePath('/')
    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Deletes a user by their Clerk ID.
 *
 * @param {string} clerkId The Clerk ID of the user to delete.
 *
 * @returns {Promise<IUser | undefined>} A promise that resolves to the deleted user, or undefined if the user was not found.
 */
export async function deleteUser(clerkId: string): Promise<IUser | undefined> {
  try {
    await connectToDatabase()

    const userToDelete = await User.findOne<IUser>({ clerkId })
    if (!userToDelete) throw new Error('User not found')

    const deletedUser = await User.findByIdAndDelete<IUser>(userToDelete._id)
    if (!deletedUser) throw new Error('User delete failed')

    revalidatePath('/')

    return JSON.parse(JSON.stringify(deletedUser))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Updates a user's credits balance.
 *
 * @param {string} userId The ID of the user to update.
 * @param {number} creditFee The amount of credits to add or subtract from the user's balance.
 *
 * @returns {Promise<IUser | undefined>} A promise that resolves to the updated user, or undefined if the user was not found.
 */
export async function updateCredits(userId: string, creditFee: number): Promise<IUser | undefined> {
  try {
    await connectToDatabase()

    const updatedUserCredits = await User.findOneAndUpdate<IUser>(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true },
    )

    if (!updatedUserCredits) throw new Error('User update failed')

    return JSON.parse(JSON.stringify(updatedUserCredits))
  } catch (error) {
    handleError(error)
  }
}

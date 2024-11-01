'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'

import User, { IUser } from '@/lib/database/models/user.model'
import Image, { IImage, IImageLean } from '../database/models/image.model'
import { connectToDatabase } from '@/lib/database/mongoose'
import { handleError } from '@/lib/utils'

/**
 * Creates a new image in the database.
 *
 * @param {AddImageParams} params The image details and the ID of the author.
 *
 * @returns {Promise<IImageLean | undefined>} A promise that resolves to the newly created image, or undefined if there was an error.
 */
export async function addImage({
  image,
  userId,
  path,
}: AddImageParams): Promise<IImageLean | undefined> {
  try {
    await connectToDatabase()

    const author = await User.findById<IUser>(userId)
    if (!author) throw new Error('User not found')

    const newImage: IImageLean | null = await Image.create({
      ...image,
      author: author._id,
    })
    if (!newImage) throw new Error('Image creation failed')

    revalidatePath(path)

    return JSON.parse(JSON.stringify(newImage))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Updates an image by its ID.
 *
 * @param {UpdateImageParams} params The parameters containing the image details, the ID of the user making the request, and the path to revalidate.
 *
 * @returns {Promise<IImageLean | undefined>} A promise that resolves to the updated image, or undefined if the image was not found or the update failed.
 *
 * @throws Will throw an error if the image is not found, the user is unauthorized, or if the update fails.
 */
export async function updateImage({
  image,
  userId,
  path,
}: UpdateImageParams): Promise<IImageLean | undefined> {
  try {
    await connectToDatabase()

    const imageToUpdate = await Image.findById<IImageLean>(image._id)
    if (!imageToUpdate) throw new Error('Image not found')

    if (imageToUpdate.author.toString() !== userId) throw new Error('Unauthorized request')

    const updatedImage = await Image.findByIdAndUpdate<IImageLean>(imageToUpdate._id, image, {
      new: true,
    })
    if (!updatedImage) throw new Error('Image update failed')

    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedImage))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Deletes an image by its ID.
 *
 * @param {string} imageId The ID of the image to delete.
 *
 * @throws Will throw an error if the image is not found or the deletion fails.
 * @redirects After deletion, redirects to the homepage.
 */
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase()
    await Image.findByIdAndDelete(imageId)
  } catch (error) {
    handleError(error)
  } finally {
    redirect('/')
  }
}

/**
 * Finds an image by its ID and populates the author field with the user's
 * data (id, firstName, lastName, clerkId).
 *
 * @param {string} imageId The ID of the image to find.
 *
 * @returns {Promise<IImage | undefined>} A promise that resolves to the
 * found image, or undefined if the image was not found.
 *
 * @throws Will throw an error if the image is not found.
 */
export async function getImageById(imageId: string): Promise<IImage | undefined> {
  try {
    await connectToDatabase()

    const image: IImage | null = await Image.findById(imageId).populate({
      path: 'author',
      model: User,
      select: '_id firstName lastName clerkId',
    })

    if (!image) throw new Error('Image not found')

    return JSON.parse(JSON.stringify(image))
  } catch (error) {
    handleError(error)
  }
}

/**
 * Finds all images in the database, and paginates them. If a search query is
 * provided, it filters the images by that query. It also returns the total
 * number of pages and the total number of saved images.
 *
 * @param {{ limit?: number; page: number; searchQuery?: string }} options -
 *   An object containing options for the query.
 * @param {number} [options.limit=9] - The number of images to return per page.
 * @param {number} options.page - The page number to return.
 * @param {string} [options.searchQuery=''] - The search query to filter the
 *   images by.
 *
 * @returns {Promise<{
 *   data: IImage[]
 *   totalPages: number
 *   savedImages: number
 * }>} A promise that resolves to an object containing the paginated images,
 * the total number of pages, and the total number of saved images.
 *
 * @throws Will throw an error if the images are not found or if there is a
 * database error.
 */
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = '',
}: {
  limit?: number
  page: number
  searchQuery?: string
}): Promise<
  | {
      data: IImage[]
      totalPages: number
      savedImages: number
    }
  | undefined
> {
  try {
    await connectToDatabase()

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=pixel_mind'

    if (searchQuery) {
      expression += ` AND ${searchQuery}`
    }

    const { resources } = await cloudinary.search.expression(expression).execute()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resourceIds = resources.map((resource: any) => resource.public_id)

    let query = {}
    if (searchQuery) {
      query = { publicId: { $in: resourceIds } }
    }

    const skipAmount = (Number(page) - 1) * limit

    const images: IImage[] | null = await Image.find(query)
      .populate({
        path: 'author',
        model: User,
        select: '_id firstName lastName clerkId',
      })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit)

    const queryTotalCount = await Image.find(query).countDocuments()
    const allTotalCount = await Image.find().countDocuments()

    const data: IImage[] = images && images.length > 0 ? JSON.parse(JSON.stringify(images)) : []

    return {
      data,
      totalPages: Math.ceil(queryTotalCount / limit),
      savedImages: allTotalCount,
    }
  } catch (error) {
    handleError(error)
  }
}

/**
 * Retrieves a paginated list of images created by a specific user.
 *
 * @param {object} params - The parameters for querying user images.
 * @param {number} [params.limit=9] - The number of images to return per page.
 * @param {number} params.page - The page number to retrieve.
 * @param {string} params.userId - The ID of the user whose images are to be retrieved.
 *
 * @returns {Promise<{ data: IImage[], totalPages: number } | undefined>} A promise that resolves to an object containing the user's images and the total number of pages, or undefined if an error occurs.
 *
 * @throws Will throw an error if there is a database connection issue or if the query fails.
 */
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number
  page: number
  userId: string
}): Promise<{ data: IImage[]; totalPages: number } | undefined> {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit

    const images: IImage[] | null = await Image.find({ author: userId })
      .populate({
        path: 'author',
        model: User,
        select: '_id firstName lastName clerkId',
      })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit)

    const totalImages = await Image.find({ author: userId }).countDocuments()

    const data: IImage[] = images && images.length > 0 ? JSON.parse(JSON.stringify(images)) : []

    return { data, totalPages: Math.ceil(totalImages / limit) }
  } catch (error) {
    handleError(error)
  }
}

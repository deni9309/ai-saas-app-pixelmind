/* eslint-disable prefer-const */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import qs from 'qs'

import { aspectRatioOptions } from '@/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Logs the given error and then throws it.
 *
 * If the error is a native JS error (e.g., TypeError, RangeError), the error message is logged
 * and then the error is thrown with a prefix of 'Error: '.
 *
 * If the error is a string, it is logged and then thrown with a prefix of 'Error: '.
 *
 * If the error is anything else, it is logged and then thrown with a prefix of 'Unknown error: '.
 *
 * @param error - The error to log and throw.
 * @throws The given error.
 */
export const handleError = (error: Error | string | unknown): never => {
  if (error instanceof Error) {
    console.error(error.message)
    throw new Error('Error: ' + error.message)
  } else if (typeof error === 'string') {
    console.error(error)
    throw new Error('Error: ' + error)
  } else {
    console.error(error)
    throw new Error('Unknown error: ' + JSON.stringify(error))
  }
}

/**
 * Generates a shimmering SVG string that can be used as a placeholder for an image
 * of the given width and height.
 *
 * The shimmering effect is a subtle gradient that moves from left to right.
 *
 * @param w - The width of the image.
 * @param h - The height of the image.
 * @returns A string of SVG that can be used as a placeholder.
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

/**
 * Encodes a given string to a base64 string.
 *
 * If the function is invoked in a Node.js environment, it will use the
 * `Buffer.from(str).toString('base64')` method to encode the string.
 *
 * If the function is invoked in a browser environment, it will use the
 * `window.btoa(str)` method to encode the string.
 *
 * @param str - The string to be encoded.
 * @returns The base64 encoded string.
 */
const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

export const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`

/**
 * Given a URLSearchParams object, a key, and a value, returns a new URL by
 * adding the key/value pair to the search parameters.
 *
 * @param searchParams - The URLSearchParams object.
 * @param key - The key to be added to the search parameters.
 * @param value - The value associated with the key.
 * @returns A new URL with the updated search parameters.
 */
export const formUrlQuery = ({ searchParams, key, value }: FormUrlQueryParams) => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value }

  return `${window.location.pathname}?${qs.stringify(params, { skipNulls: true })}`
}

/**
 * Given a URLSearchParams object and an array of keys, returns a new URL by
 * removing the key/value pairs from the search parameters.
 *
 * @param searchParams - The URLSearchParams object.
 * @param keysToRemove - The array of keys to be removed from the search parameters.
 * @returns A new URL with the updated search parameters.
 */
export function removeKeysFromQuery({ searchParams, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(searchParams)

  keysToRemove.forEach((key) => {
    delete currentUrl[key]
  })

  Object.keys(currentUrl).forEach((key) => currentUrl[key] == null && delete currentUrl[key])

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`
}

/**
 * Creates a debounced version of a function that delays invoking `func` until after
 * `delay` milliseconds have elapsed since the last time the debounced function was
 * invoked.
 *
 * @param func - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @returns A debounced version of `func`.
 */
export const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null

  return (...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export type AspectRatioKey = keyof typeof aspectRatioOptions

export type AspectRatioType = typeof aspectRatioOptions

/**
 * Given a type, an image object, and a dimension, returns the size of the image in that dimension.
 *
 * If the type is 'fill', the function uses the aspectRatioOptions object to determine the size of the image.
 * If the image object has an aspectRatio that matches a key in the aspectRatioOptions object,
 * the function returns the value of that key. Otherwise, the function returns 1000.
 *
 * If the type is not 'fill', the function returns the value of the dimension property of the image object.
 * If the image object does not have the dimension property, the function returns 1000.
 *
 * @param type - The type of image.
 * @param image - The image object.
 * @param dimension - The dimension of the image to get the size of.
 * @returns The size of the image in the given dimension.
 */
export const getImageSize = (
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any,
  dimesnsion: 'width' | 'height',
): number => {
  if (type === 'fill') {
    return aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimesnsion] || 1000
  }

  return image?.[dimesnsion] || 1000
}

/**
 * Downloads a resource from the provided URL and saves it to the user's machine.
 * If a filename is provided, it will be used as the name of the downloaded file.
 * If no filename is provided, the downloaded file will be named `image.png`.
 *
 * @param url - The URL of the resource to download.
 * @param filename - The filename to use for the downloaded file.
 */
export const download = (url: string, filename: string) => {
  if (!url) throw new Error('Resource URL not provided! Please, provide a valid URL.')

  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl

      if (filename && filename.length) {
        a.download = `${filename.replace(' ', '_')}.png`
      }

      document.body.appendChild(a)
      a.click()
    })
    .catch((error) => console.error({ error }))
}

/**
 * Recursively merges two objects into a new object. If the two objects have any
 * properties with the same name, the property from the second object will be
 * used in the resulting object.
 *
 * @param obj1 - The first object to be merged.
 * @param obj2 - The second object to be merged.
 *
 * @returns A new object that contains all of the properties from both obj1 and
 * obj2, with the properties from obj2 taking precedence in case of a conflict.
 */
export const deepMergeObjects = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj1: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj2: any,
) => {
  if (obj2 === null || obj2 === undefined) {
    return obj1
  }

  let output = { ...obj2 }

  for (let key in obj1) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj1.hasOwnProperty(key)) {
      if (
        obj1[key] &&
        typeof obj1[key] === 'object' &&
        obj2[key] &&
        typeof obj2[key] === 'object'
      ) {
        output[key] = deepMergeObjects(obj1[key], obj2[key])
      } else {
        output[key] = obj1[key]
      }
    }
  }

  return output
}

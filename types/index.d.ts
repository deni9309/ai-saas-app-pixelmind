/* eslint-disable no-unused-vars */

// ====== USER PARAMS
declare type CreateUserParams = {
  clerkId: string
  email: string
  username: string
  firstName: string
  lastName: string
  photo: string
}

declare type UpdateUserParams = {
  firstName: string
  lastName: string
  username: string
  photo: string
}

// ====== IMAGE PARAMS
declare type AddImageParams = {
  image: {
    title: string
    publicId: string
    transformationType: string
    width: number
    height: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any
    secureURL: string
    transformationURL: string
    aspectRatio: string | undefined
    prompt: string | undefined
    color: string | undefined
  }
  userId: string
  path: string
}

declare type UpdateImageParams = {
  image: {
    _id: string
    title: string
    publicId: string
    transformationType: string
    width: number
    height: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any
    secureURL: string
    transformationURL: string
    aspectRatio: string | undefined
    prompt: string | undefined
    color: string | undefined
  }
  userId: string
  path: string
}

declare type Transformations = {
  restore?: boolean
  fillBackground?: boolean
  remove?: {
    prompt: string
    removeShadow?: boolean
    multiple?: boolean
  }
  recolor?: {
    prompt?: string
    to: string
    multiple?: boolean
  }
  removeBackground?: boolean
}

declare type CldUploadWidgetResults = {
  event?: string
  info?: string | CldUploadWidgetInfo
}

declare type CldUploadWidgetInfo = {
  access_mode: 'public' | 'authenticated'
  api_key: string
  asset_id: string
  batchId: string
  bytes: number
  context: Record<string, Record<string, string>>
  created_at: string
  etag: string
  folder: string
  format: string
  height: number
  hook_execution: Record<string, unknown>
  id: string
  info: Record<string, unknown>
  original_filename: string
  pages: number
  path: string
  placeholder: boolean
  public_id: string
  resource_type: 'image' | 'raw' | 'video' | 'auto'
  secure_url: string
  signature: string
  tags: string[]
  thumbnail_url: string
  type: 'upload' | 'private' | 'authenticated'
  url: string
  version: number
  width: number
  [key: string]: unknown
}

// ====== TRANSACTION PARAMS
declare type CheckoutTransactionParams = {
  plan: string
  credits: number
  amount: number
  buyerId: string
}

declare type CreateTransactionParams = {
  stripeId: string
  amount: number
  credits: number
  plan: string
  buyerId: string
  createdAt: Date
}

declare type TransformationTypeKey = 'restore' | 'fill' | 'remove' | 'recolor' | 'removeBackground'

// ====== URL QUERY PARAMS
declare type FormUrlQueryParams = {
  searchParams: string
  key: string
  value: string | number | null
}

declare type UrlQueryParams = {
  params: string
  key: string
  value: string | null
}

declare type RemoveUrlQueryParams = {
  searchParams: string
  keysToRemove: string[]
}

declare type SearchParamProps = {
  params: { id: string; type: TransformationTypeKey }
  searchParams: { [key: string]: string | string[] | undefined }
}

declare type TransformationFormProps = {
  action: 'Add' | 'Update'
  userId: string
  type: TransformationTypeKey
  creditBalance: number
  data?: IImage | null
  config?: Transformations | null
}

declare type TransformedImageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any
  type: string
  title: string
  transformationConfig: Transformations | null
  isTransforming: boolean
  hasDownload?: boolean
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>
}

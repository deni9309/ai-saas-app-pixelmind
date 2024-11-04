'use client'

import { useEffect, useState, useTransition } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next-nprogress-bar'
import { getCldImageUrl } from 'next-cloudinary'

import { Button } from '@/components/ui/button'
import { Form, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CustomInputField from '@/components/shared/custom-input-field'
import InsufficientCreditsModal from '@/components/shared/insufficient-credits-modal'
import MediaUploader from '@/components/shared/media-uploader'
import TransformedImage from '@/components/shared/transformed-image'
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from '@/constants'
import { updateCredits } from '@/lib/actions/user.actions'
import { addImage, updateImage } from '@/lib/actions/image.actions'
import { AspectRatioKey, debounce, deepMergeObjects } from '@/lib/utils'
import { TransformationSchema } from '@/schemas/transformation.schema'

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type]

  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const initialValues =
    data && action === 'Update'
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues

  const form = useForm<z.infer<typeof TransformationSchema>>({
    resolver: zodResolver(TransformationSchema),
    defaultValues: initialValues,
  })

  async function onSubmit(values: z.infer<typeof TransformationSchema>) {
    setIsSubmitting(true)

    if (data || image) {
      const getPublicId: string = image?.publicId ? image.publicId : (data?.publicId as string)

      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: getPublicId,
        ...transformationConfig,
      })

      const imageData = {
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secureUrl: image?.secureUrl,
        transformationUrl: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      }

      if (action === 'Add') {
        try {
          const newImage = await addImage({ image: imageData, userId, path: '/' })

          if (newImage) {
            form.reset()
            setImage(data)

            router.push(`/transformations/${newImage._id}`)
          }
        } catch (error) {
          console.error(error)
        }
      }

      if (action === 'Update') {
        try {
          const updatedImage = await updateImage({
            image: { ...imageData, _id: data._id },
            userId,
            path: `/transformations/${data._id}`,
          })

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`)
          }
        } catch (error) {
          console.error(error)
        }
      }
    }

    setIsSubmitting(false)
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setImage((prev: any) => ({
      ...prev,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }))

    setNewTransformation(transformationType.config)

    return onChangeField(value)
  }

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void,
  ) => {
    debounce(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to']: value,
        },
      }))
    }, 1000)()

    return onChangeField(value)
  }

  const onTransformHandler = async () => {
    setIsTransforming(true)

    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig))

    setNewTransformation(null)

    startTransition(async () => {
      await updateCredits(userId, creditFee)
    })
  }

  useEffect(() => {
    if (image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config)
    }
  }, [image, transformationType.config, type])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomInputField
          control={form.control}
          render={({ field }) => <Input id={field.name} {...field} className="input-field" />}
          name="title"
          formLabel="Image Title"
          className="w-full"
        />

        {type === 'fill' && (
          <CustomInputField
            control={form.control}
            name="aspectRatio"
            className="w-full"
            formLabel="Aspect Ratio"
            render={({ field }) => (
              <Select onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}>
                <FormControl id={field.name}>
                  <SelectTrigger className="select-field">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomInputField
              control={form.control}
              name="prompt"
              formLabel={type === 'remove' ? 'Object to Remove' : 'Object to Recolor'}
              className="w-full"
              render={({ field }) => (
                <Input
                  id={field.name}
                  value={field.value}
                  className="input-field"
                  onChange={(e) =>
                    onInputChangeHandler('prompt', e.target.value, type, field.onChange)
                  }
                />
              )}
            />

            {type === 'recolor' && (
              <CustomInputField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    id={field.name}
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler('color', e.target.value, type, field.onChange)
                    }
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomInputField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value!}
                image={image}
                type={type}
              />
            )}
          />

          <TransformedImage
            image={image}
            title={form.getValues().title}
            type={type}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            onClick={onTransformHandler}
            disabled={isTransforming || newTransformation === null}
            className="submit-button capitalize"
          >
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="submit-button capitalize">
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm

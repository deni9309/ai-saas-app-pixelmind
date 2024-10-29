'use client'

import { useEffect, useState, useTransition } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { getCldImageUrl } from 'next-cloudinary'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { aspectRatioOptions, defaultValues, transformationTypes } from '@/constants'
import { TransformationSchema } from '@/schemas/transformation.schema'
import { title } from 'process'
import TransformationInputField from './transformation-input-field'
import { AspectRatioKey, AspectRatioType, debounce, deepMergeObjects } from '@/lib/utils'

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
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
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
        //  try {
        //const newImage  =await addImage()
        //  } catch (error) {}
      }
    }
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    setImage((prev: AspectRatioType) => ({
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

  // Implement updateCredits function
  const onTransformHandler = async () => {
    setIsTransforming(true)

    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig))

    setNewTransformation(null)

    startTransition(async () => {
      // await updateCredits(userId, creditFee)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <TransformationInputField
          control={form.control}
          render={({ field }) => <Input id={field.name} {...field} className="input-field" />}
          name="title"
          formLabel="Image Title"
          className="w-full"
        />

        {type === 'fill' && (
          <TransformationInputField
            control={form.control}
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
            name="aspectRatio"
            className="w-full"
            formLabel="Aspect Ratio"
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <TransformationInputField
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
              <TransformationInputField
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

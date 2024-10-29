import React from 'react'
import * as z from 'zod'
import { Control, ControllerRenderProps } from 'react-hook-form'

import { TransformationSchema } from '@/schemas/transformation.schema'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type TransformationInputFieldProps = {
  control: Control<z.infer<typeof TransformationSchema>> | undefined
  render: (props: {
    field: ControllerRenderProps<z.infer<typeof TransformationSchema>>
  }) => React.ReactNode
  name: keyof z.infer<typeof TransformationSchema>
  formLabel?: string
  className?: string
}

const TransformationInputField = ({
  control,
  render,
  name,
  formLabel,
  className,
}: TransformationInputFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel &&
            <FormLabel htmlFor={field.name}>{formLabel}</FormLabel>
          }
          
          <FormControl id={field.name}>
            {render({ field })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TransformationInputField

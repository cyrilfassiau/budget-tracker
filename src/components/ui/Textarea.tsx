import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses } from './controlClasses'

export function Textarea({
  className,
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlClasses, 'resize-y', className)} {...props} />
}

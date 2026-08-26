import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Class-name helper used by every UI primitive.
 *
 * `twMerge` is what makes overrides work: a primitive can ship a default like
 * `inline-flex`, and a caller passing `hidden sm:inline-flex` wins instead of
 * both landing in the class list and CSS order deciding at random.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

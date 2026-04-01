import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = parseISO(value)
  if (!isValid(date)) return '-'

  return format(date, 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-'

  const date = parseISO(value)
  if (!isValid(date)) return '-'

  return format(date, 'dd/MM/yyyy · HH:mm', { locale: es })
}
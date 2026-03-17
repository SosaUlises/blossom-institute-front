'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value?: string
  onChange: (value: string) => void
}

interface DataTableToolbarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterConfig[]
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export function DataTableToolbar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  onClearFilters,
  hasActiveFilters = false,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filter.value || 'all'}
            onValueChange={filter.onChange}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2"
          >
            <X className="mr-1 size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

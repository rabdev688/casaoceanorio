import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GUEST_OPTIONS = [2, 4, 6, 8, 10, 12, 14]

interface GuestSelectProps {
  id: string
  value: number
  onChange: (value: number) => void
}

export function GuestSelect({ id, value, onChange }: GuestSelectProps) {
  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger id={id} type="button" aria-label="Number of guests">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GUEST_OPTIONS.map((count) => (
          <SelectItem key={count} value={String(count)}>
            {count} Guests
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

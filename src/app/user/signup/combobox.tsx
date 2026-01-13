import { Combobox } from "@/components/ui/combobox"

const years = [
  {
    value: "freshman",
    label: "Freshman",
  },
  {
    value: "sophomore",
    label: "Sophomore",
  },
  {
    value: "junior",
    label: "Junior",
  },
  {
    value: "senior",
    label: "Senior",
  },
]

export function ComboboxDemo() {
  return <Combobox options={years} placeholder="Select year..." searchPlaceholder="Search year..." />
}

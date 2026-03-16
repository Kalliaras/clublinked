import { Combobox } from "@/components/ui/combobox"

const clubTypes = [
  {
    value: "Business Association",
    label: "Business Association",
  },
  {
    value: "Investment Group",
    label: "Investment Group",
  },
  {
    value: "Volunteer Network",
    label: "Volunteer Network",
  },
  {
    value: "Robotics Society",
    label: "Robotics Society",
  },
  {
    value: "Data Science Club",
    label: "Data Science Club",
  },
]

type ClubTypeComboboxProps = {
  selected: string;
  onChange: (value: string) => void;
};

export function ComboboxDemo({ selected, onChange }: ClubTypeComboboxProps) {
  return (
    <Combobox
      options={clubTypes}
      placeholder="Select club type..."
      searchPlaceholder="Search club type..."
      value={selected}
      onValueChange={onChange}
      buttonClassName="text-[#0E4AE6]"
    />
  );
}

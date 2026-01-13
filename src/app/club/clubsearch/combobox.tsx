import { Combobox } from "@/components/ui/combobox";

const clubTypes = [
  {
    value: "all",
    label: "All Categories",
  },
  {
    value: "Consulting",
    label: "Consulting",
  },
  {
    value: "Sports",
    label: "Sports",
  },
  {
    value: "Finance",
    label: "Finance",
  },
  {
    value: "Engineering",
    label: "Engineering",
  },
  {
    value: "Volunteering",
    label: "Volunteering",
  },
];

function CategoryCombobox({ selectedCategory, setSelectedCategory }: { 
  selectedCategory: string; 
  setSelectedCategory: (value: string) => void; 
}) {
  return (
    <Combobox
      value={selectedCategory}
      onValueChange={(value) => setSelectedCategory(value || "all")}
      options={clubTypes}
      placeholder="Select category..."
      searchPlaceholder="Search categories..."
      width="w-full"
    />
  );
}

export { CategoryCombobox };
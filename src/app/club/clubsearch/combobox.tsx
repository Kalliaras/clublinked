"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/90 text-slate-900 border-gray-200 hover:bg-white"
        >
          {selectedCategory
            ? clubTypes.find((type) => type.value === selectedCategory)?.label
            : "Select category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {clubTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(currentValue) => {
                    setSelectedCategory(currentValue === selectedCategory ? "all" : currentValue);
                    setOpen(false);
                  }}
                >
                  {type.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedCategory === type.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { CategoryCombobox };
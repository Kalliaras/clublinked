import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxDemo } from "./combobox"

export function Infobox() {
  return (
    <Card className="w-full max-w-sm bg-white text-black border-gray-200">
      <CardHeader>
        <CardTitle className="mb-2 text-[#0E4AE6]">Make your Club an official member of Clublinked!</CardTitle>
        <CardDescription className="text-[#0E4AE6]">
          Fill out your club details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="clubname" className="text-[#0E4AE6]">Club Name</Label>
              <Input
                id="clubname"
                type="text"
                placeholder="Club Name"
                required
                className="bg-white text-black"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="members" className="text-[#0E4AE6]">Total amount of registered members</Label>
              <Input
                id="members"
                type="text"
                placeholder="e.g. 10"
                required
                className="bg-white text-black"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[#0E4AE6]">Club Type</Label>
              <ComboboxDemo />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full bg-[#0E4AE6] text-white hover:bg-[#0E4AE6]/80">
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}

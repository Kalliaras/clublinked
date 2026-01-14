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
import { ComboboxDemo } from "../signup/combobox"

export function Infobox() {
  return (
    <Card className="w-full max-w-sm bg-white text-[#0E4AE6] border-gray-200">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Fill out the following information to access your account.
        </CardDescription>
        <CardAction>
          <Button variant="link" className="text-white hover:text-white/80">
            Sign up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@university.edu"
                required
                className="bg-white text-black"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" 
              type="password" 
              required 
              className="bg-white text-black" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full bg-white text-[#0E4AE6] hover:bg-[#0E4AE6] hover:text-white border border-gray-200">
          Login
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useUniversity } from "@/lib/context/university-context";

type InfoboxProps = {
  onSubmitProp: (formData: FormData) => void;
  isPending?: boolean;
};

export function Infobox({ onSubmitProp, isPending }: InfoboxProps) {
  const university = useUniversity();

  return (
    <Card className="w-full max-w-sm bg-white text-primary border-gray-200">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Fill out the following information to access your account.
        </CardDescription>
        <CardAction>
          <Link href={`/${university.slug}/signup`}>
            <Button variant="link" className="text-primary hover:text-primary/80">
              Sign up
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitProp(new FormData(e.currentTarget));
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@university.edu"
                required
                className="bg-white text-black"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white text-black"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-primary hover:bg-primary hover:text-white border border-gray-200"
            >
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

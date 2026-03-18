"use client";

import * as React from "react";
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
import { ComboboxDemo } from "@/app/[slug]/signup/_components/combobox";
import Link from "next/link";
import { useUniversity } from "@/lib/context/university-context";

type InfoboxProps = {
  onSubmitProp: (formData: FormData) => void;
  isPending?: boolean;
};

export function Infobox({ onSubmitProp, isPending }: InfoboxProps) {
  const university = useUniversity();
  // Track combobox selection so we can include it in FormData
  const [year, setYear] = React.useState("");
  const _comboboxProps: { value: string; onValueChange: (value: string) => void } = { value: year, onValueChange: setYear };

  return (
    <Card className="w-full max-w-sm bg-white text-primary border-gray-200">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Fill out the following information to access your account.
        </CardDescription>
        <CardAction>
          <Link href={`/${university.slug}/login`}>
          <Button variant="link" className="text-primary hover:text-primary/80" type="button">
            Login
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
            {/* First + Last */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jane"
                  required
                  className="bg-white text-black"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>

            {/* Major */}
            <div className="grid gap-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                name="major"
                type="text"
                placeholder="Computer Science"
                required
                className="bg-white text-black"
              />
            </div>

            {/* Year combobox */}
            <div className="grid gap-2">
              <Label>Year you&apos;re in</Label>

              <ComboboxDemo {..._comboboxProps} />

              <input type="hidden" name="academic_year" value={year} />
            </div>

            {/* Email */}
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

            {/* Password */}
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
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

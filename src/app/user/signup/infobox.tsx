"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboboxDemo } from "@/app/user/signup/combobox";
import Link  from "next/link";

type InfoboxProps = {
  onSubmitProp: (formData: FormData) => void;
  isPending?: boolean;
};

export function Infobox({ onSubmitProp, isPending }: InfoboxProps) {
  // Track combobox selection so we can include it in FormData
  const [year, setYear] = React.useState("");
  const _comboboxProps = { value: year, onValueChange: setYear } as any;

  return (
    <Card className="w-full max-w-sm bg-white text-[#0E4AE6] border-gray-200">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Fill out the following information to access your account.
        </CardDescription>
        <CardAction>
          <Link href="/user/login">
          <Button variant="link" className="text-[#0E4AE6] hover:text-[#0E4AE6]/80" type="button">
            Login
           </Button>
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* ✅ Add onSubmit handler and keep submit button inside this form */}
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
                  name="firstName"             // ✅ add name
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
                  name="lastName"              // ✅ add name
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
                name="major"                   // ✅ add name
                type="text"
                placeholder="Computer Science"
                required
                className="bg-white text-black"
              />
            </div>

            {/* Year combobox */}
            <div className="grid gap-2">
              <Label>Year you're in</Label>

              {/* ✅ Combobox must tell us the selected value */}
              <ComboboxDemo {..._comboboxProps} />

              {/* ✅ Hidden input puts the value into FormData */}
              <input type="hidden" name="year" value={year} />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"                   // ✅ add name
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
                name="password"                // ✅ add name
                type="password"
                required
                className="bg-white text-black"
              />
            </div>

            {/* ✅ submit button INSIDE the form */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-[#0E4AE6] hover:bg-[#0E4AE6] hover:text-white border border-gray-200"
            >
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Footer can stay, but no submit button should be here now */}
      <CardFooter className="flex-col gap-2" />
    </Card>
  );
}

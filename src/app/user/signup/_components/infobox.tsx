"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { ComboboxDemo } from "./combobox";
import { UniversitySelectorModal } from "./university-selector-modal";

type InfoboxProps = {
  onSubmitProp: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    major: string;
    academicYear: string;
    universityId: string | null;
  }) => void;
  isPending?: boolean;
};

export function Infobox({ onSubmitProp, isPending }: InfoboxProps) {
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string | null>(null);
  const [universityLoading, setUniversityLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    firstName: string;
    lastName: string;
    password: string;
  } | null>(null);

  // Detect university from email domain
  useEffect(() => {
    const atIdx = email.indexOf("@");
    if (atIdx === -1 || email.length <= atIdx + 1) {
      setUniversityId(null);
      setUniversityName(null);
      return;
    }
    const domain = email.substring(atIdx); // e.g. "@siu.edu"

    const timer = setTimeout(async () => {
      setUniversityLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("id, name")
        .eq("email_domain", domain)
        .maybeSingle();
      setUniversityId(data?.id ?? null);
      setUniversityName(data?.name ?? null);
      setUniversityLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value;
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    // If email has a domain but no university matched, show modal first
    const atIdx = email.indexOf("@");
    const hasDomain = atIdx !== -1 && email.length > atIdx + 1;
    if (hasDomain && !universityId && !universityLoading) {
      setShowModal(true);
      setPendingSubmit({ firstName, lastName, password });
      return;
    }

    onSubmitProp({
      firstName,
      lastName,
      email,
      password,
      major,
      academicYear: year,
      universityId,
    });
  };

  const handleUniversitySelect = (uni: { id: string; name: string }) => {
    setUniversityId(uni.id);
    setUniversityName(uni.name);
    setShowModal(false);
    if (pendingSubmit) {
      onSubmitProp({
        ...pendingSubmit,
        email,
        major,
        academicYear: year,
        universityId: uni.id,
      });
      setPendingSubmit(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (pendingSubmit) {
      onSubmitProp({
        ...pendingSubmit,
        email,
        major,
        academicYear: year,
        universityId: null,
      });
      setPendingSubmit(null);
    }
  };

  const atIdx = email.indexOf("@");
  const hasDomain = atIdx !== -1 && email.length > atIdx + 1;

  return (
    <>
      <Card className="w-full max-w-sm border-gray-200 bg-white text-primary">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Fill out the following information to access your account.
          </CardDescription>
          <CardAction>
            <Link href="/user/login">
              <Button
                variant="link"
                className="text-primary hover:text-primary/80"
                type="button"
              >
                Login
              </Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
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

              {/* Email with university detection */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-black"
                />
                {/* University detection feedback */}
                {universityLoading && (
                  <p className="text-xs text-gray-400">Checking...</p>
                )}
                {!universityLoading && universityName && (
                  <p className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <span>&#10003;</span>
                    {universityName}
                  </p>
                )}
                {!universityLoading && !universityName && hasDomain && (
                  <p className="text-xs text-gray-400">
                    Can&apos;t find your university?
                  </p>
                )}
              </div>

              {/* Major */}
              <div className="grid gap-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  name="major"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="bg-white text-black"
                />
              </div>

              {/* Year */}
              <div className="grid gap-2">
                <Label>Year</Label>
                <ComboboxDemo value={year} onValueChange={setYear} />
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
                className="w-full border border-gray-200 bg-white text-primary hover:bg-primary hover:text-white"
              >
                {isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showModal && (
        <UniversitySelectorModal
          open={showModal}
          onSelect={handleUniversitySelect}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}

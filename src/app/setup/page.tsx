"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetupInstitutionAction } from "@/lib/actions/setup";
import { toast } from "sonner";
import logo from "../../../public/logo.png";

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [emailDomain, setEmailDomain] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!slugManuallyEdited) {
      const generated = universityName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSlug(generated);
    }
  }, [universityName, slugManuallyEdited]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !universityName.trim() ||
      !slug.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await SetupInstitutionAction(
        universityName.trim(),
        slug.trim(),
        emailDomain.trim(),
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        password
      );

      if (result?.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      if (result?.slug) {
        toast.success("Institution created! Redirecting...");
        router.push(`/${result.slug}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <Image
              src={logo}
              alt="ClubLinked logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-primary">ClubLinked</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Set up your institution
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get your university on ClubLinked in minutes. You&apos;ll be the
            first admin.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Institution Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Institution Details</CardTitle>
              <CardDescription>
                Tell us about your university or college.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universityName">
                  University Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="universityName"
                  placeholder="e.g. University of Michigan"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  URL Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="e.g. university-of-michigan"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                />
                {slug && (
                  <p className="text-sm text-muted-foreground">
                    Your URL:{" "}
                    <span className="font-medium text-primary">
                      clublinked.com/{slug}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailDomain">Email Domain (optional)</Label>
                <Input
                  id="emailDomain"
                  placeholder="e.g. umich.edu"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  If set, only users with this email domain can sign up.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Account */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Admin Account</CardTitle>
              <CardDescription>
                Create your account to manage the institution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full text-base font-semibold"
            size="lg"
          >
            {isSubmitting ? "Setting up..." : "Create Institution"}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Find your university
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ComboboxDemo } from "./combobox";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

export function Infobox() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [clubType, setClubType] = React.useState("");
  const [interestTags, setInterestTags] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [isInterestDialogOpen, setIsInterestDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTags = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("interest_tags").select("name");
      setInterestTags((data || []).map((tag: any) => tag?.name).filter(Boolean));
    };
    loadTags();
  }, []);

  const addInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const normalized = interest.trim();
      if (!normalized || prev.includes(normalized)) return prev;
      return [...prev, normalized];
    });
    setSearch("");
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.filter((i) => i !== interest));
  };

  const handleCreateClub = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Club name is required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in to create a club.");
        return;
      }

      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .insert({
          name: name.trim(),
          about: description.trim() || null,
          club_type: clubType || null,
          members: 1,
          access_code: accessCode,
        })
        .select("id")
        .single();

      if (clubError || !club?.id) {
        setError("Could not create club. Please try again.");
        return;
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        club_id: club.id,
        title: "President",
        is_owner: true,
      });

      if (roleError) {
        setError("Club created but failed to join. Please try again.");
        return;
      }

      for (const interestName of selectedInterests) {
        const trimmed = interestName.trim();
        if (!trimmed) continue;
        const { data: existingTag } = await supabase
          .from("interest_tags")
          .select("id")
          .eq("name", trimmed)
          .single();

        const tagId =
          existingTag?.id ||
          (
            await supabase
              .from("interest_tags")
              .insert({ name: trimmed })
              .select("id")
              .single()
          )?.data?.id;

        if (tagId) {
          await supabase.from("club_interests").insert({
            club_id: club.id,
            interest_id: tagId,
          });
        }
      }

      setSuccess("Club created! Redirecting…");
      setTimeout(() => {
        router.push(`/club/dashboard/${club.id}`);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white text-black border-gray-200">
      <CardHeader>
        <CardTitle className="mb-2 text-[#0E4AE6]">
          Make your Club an official member of Clublinked!
        </CardTitle>
        <CardDescription className="text-[#0E4AE6]">
          Fill out your club details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateClub}>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="clubname" className="text-[#0E4AE6]">
                Club Name
              </Label>
              <Input
                id="clubname"
                type="text"
                placeholder="Club Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="bg-white text-black"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="clubdesc" className="text-[#0E4AE6]">
                  Description
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Optional - helps people learn what your club does.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="clubdesc"
                type="text"
                placeholder="A short description (optional)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="bg-white text-black"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-[#0E4AE6]">Interests</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Optional - select interests for your club.
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {interest}
                    <button
                      type="button"
                      className="ml-2 rounded-full hover:bg-slate-200"
                      onClick={() => removeInterest(interest)}
                      aria-label={`Remove ${interest}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  onClick={() => setIsInterestDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              <CommandDialog
                open={isInterestDialogOpen}
                onOpenChange={setIsInterestDialogOpen}
                title="Choose interests"
                description="Select interests to associate with your club."
              >
                <CommandInput
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search interests..."
                />
                <CommandList>
                  <CommandEmpty>No interests found.</CommandEmpty>
                  {interestTags
                    .filter((tag) =>
                      tag.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => {
                          addInterest(tag);
                          setIsInterestDialogOpen(false);
                        }}
                      >
                        {tag}
                      </CommandItem>
                    ))}
                  {search.trim() &&
                    !interestTags
                      .map((t) => t.toLowerCase())
                      .includes(search.trim().toLowerCase()) && (
                      <CommandItem
                        value={search.trim()}
                        onSelect={() => {
                          addInterest(search.trim());
                          setIsInterestDialogOpen(false);
                        }}
                      >
                        Create "{search.trim()}"
                      </CommandItem>
                    )}
                </CommandList>
              </CommandDialog>
            </div>

            <div className="grid gap-2">
              <Label className="text-[#0E4AE6]">Club Type</Label>
              <ComboboxDemo
                selected={clubType}
                onChange={(value) => setClubType(value)}
              />
            </div>
          </div>

          <CardFooter className="mt-8 flex-col gap-2">
            <Button
              type="submit"
              className="w-full bg-[#0E4AE6] text-white hover:bg-[#0E4AE6]/80"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

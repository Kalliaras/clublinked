"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/tailwind";
import { createProjectAction, deleteProjectAction, updateProjectAction } from "../actions";
import type { ClubProject, ProjectInput, ProjectVisibility } from "../types";

const EMPTY_PROJECT: ProjectInput = {
  title: "",
  description: "",
  visibility: "public",
};

function projectToForm(project: ClubProject): ProjectInput {
  return {
    title: project.title ?? "",
    description: project.description ?? "",
    visibility: project.visibility,
  };
}

function ProjectEditor({
  open,
  onOpenChange,
  clubId,
  project,
  duplicate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  project: ClubProject | null;
  duplicate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<ProjectInput>(EMPTY_PROJECT);

  React.useEffect(() => {
    if (!open) return;
    setForm(project ? projectToForm(project) : EMPTY_PROJECT);
  }, [open, project]);

  const isEditing = Boolean(project && !duplicate);
  const heading = isEditing ? "Edit project" : duplicate ? "Duplicate project" : "Create project";

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = isEditing && project
        ? await updateProjectAction(clubId, project.id, form)
        : await createProjectAction(clubId, form);

      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
        return;
      }

      toast.success(isEditing ? "Project updated." : "Project created.");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>
              Share an initiative on the club overview and projects pages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="project-title">Title</Label>
              <Input
                id="project-title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Community consulting initiative"
                maxLength={160}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What is the project working toward?"
                maxLength={4000}
                rows={5}
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-slate-900">Who can see this project?</legend>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["public", "Public", "Visible to everyone"],
                  ["members_only", "Members only", "Visible to club members"],
                ] as const).map(([value, label, description]) => (
                  <label
                    key={value}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      form.visibility === value
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={value}
                      checked={form.visibility === value}
                      onChange={() => update("visibility", value as ProjectVisibility)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="block text-xs text-slate-500">{description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsAdminClient({
  clubId,
  clubName,
  projects,
}: {
  clubId: string;
  clubName: string;
  projects: ClubProject[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<ClubProject | null>(null);
  const [duplicate, setDuplicate] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<ClubProject | null>(null);

  function openCreate() {
    setSelectedProject(null);
    setDuplicate(false);
    setEditorOpen(true);
  }

  function openEdit(project: ClubProject) {
    setSelectedProject(project);
    setDuplicate(false);
    setEditorOpen(true);
  }

  function openDuplicate(project: ClubProject) {
    setSelectedProject(project);
    setDuplicate(true);
    setEditorOpen(true);
  }

  function confirmDelete() {
    if (!projectToDelete) return;
    startTransition(async () => {
      const result = await deleteProjectAction(clubId, projectToDelete.id);
      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
        return;
      }
      toast.success("Project deleted.");
      setProjectToDelete(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Admin</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Projects.</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage projects for {clubName}.</p>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" />Create project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Wrench className="size-5" />
          </div>
          <h2 className="mt-4 font-bold text-slate-900">No projects yet</h2>
          <p className="mt-1 text-sm text-slate-500">Create the first project for your club.</p>
          <Button className="mt-5" onClick={openCreate}><Plus className="size-4" />Create project</Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map((project) => (
            <article key={project.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Wrench className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {project.visibility === "members_only" ? "Members only" : "Public"}
                  </Badge>
                </div>
                <h2 className="text-[15px] font-bold text-slate-950">{project.title || "Untitled project"}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
                <Button variant="outline" size="sm" onClick={() => openEdit(project)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openDuplicate(project)}>
                  <Copy className="size-3.5" /> Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setProjectToDelete(project)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ProjectEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        clubId={clubId}
        project={selectedProject}
        duplicate={duplicate}
      />

      <AlertDialog open={Boolean(projectToDelete)} onOpenChange={(open) => !open && !isPending && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              “{projectToDelete?.title || "Untitled project"}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep project</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting…" : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import * as React from "react";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export type ClubProject = {
  id: string;
  club_id: string;
  title: string | null;
  description: string | null;
  created_at: string;
};

const projectDateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
});

export function ProjectList({ projects }: { projects: ClubProject[] }) {
  const [expandedProjects, setExpandedProjects] = React.useState<string[]>([]);

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><FolderKanban /></EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Track club projects and initiatives right here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Button variant="outline">Create Project</Button></EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const description = project.description ?? "";
        const isLong = description.length > 100;
        const isExpanded = expandedProjects.includes(project.id);
        const preview = isExpanded || !isLong ? description : `${description.slice(0, 100).trimEnd()}...`;

        return (
          <Card key={project.id} className="border-slate-200 p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-3.5 w-3.5 rounded-full bg-sky-600 shadow-sm" />
                <span className="mt-2 h-full w-px bg-slate-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg font-semibold leading-tight text-slate-900">{project.title || "Untitled project"}</h3>
                  <time className="text-sm text-slate-500">{projectDateFormatter.format(new Date(project.created_at))}</time>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{preview}</p>
                {isLong && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="mt-3 px-0 text-sky-600"
                    onClick={() => setExpandedProjects((current) => current.includes(project.id)
                      ? current.filter((id) => id !== project.id)
                      : [...current, project.id])}
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

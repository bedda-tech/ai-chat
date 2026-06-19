"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{project.name}</h3>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-muted-foreground text-sm">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button asChild size="sm" variant="default">
            <Link href={`/?projectId=${project.id}`}>New Chat</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/knowledge-base?projectId=${project.id}`}>
              Knowledge Base
            </Link>
          </Button>
          <Button onClick={() => onEdit(project)} size="sm" variant="outline">
            Edit
          </Button>
          <Button
            onClick={() => onDelete(project.id)}
            size="sm"
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </div>
      {project.instructions && (
        <div className="rounded-md bg-muted px-3 py-2">
          <p className="mb-1 font-medium text-muted-foreground text-xs">
            Project instructions
          </p>
          <p className="line-clamp-3 whitespace-pre-wrap text-sm">
            {project.instructions}
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Project | null;
  onSave: (data: {
    name: string;
    description: string;
    instructions: string;
  }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">
        {initial ? "Edit project" : "New project"}
      </h3>
      <div className="space-y-2">
        <Label htmlFor="project-name">Name *</Label>
        <Input
          id="project-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="My project"
          value={name}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-desc">Description</Label>
        <Input
          id="project-desc"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          value={description}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-instructions">Project instructions</Label>
        <p className="text-muted-foreground text-xs">
          These instructions are prepended to the AI system prompt for all chats
          in this project.
        </p>
        <Textarea
          id="project-instructions"
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. You are helping me with a Python codebase. Always use type hints. Prefer functional patterns."
          rows={5}
          value={instructions}
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={!name.trim() || saving}
          onClick={() => onSave({ name, description, instructions })}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects ?? []);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = useCallback(
    async (data: {
      name: string;
      description: string;
      instructions: string;
    }) => {
      setSaving(true);
      try {
        if (editing) {
          const res = await fetch(`/api/projects?id=${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Failed to update project");
          toast.success("Project updated");
        } else {
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Failed to create project");
          toast.success("Project created");
        }
        setShowForm(false);
        setEditing(null);
        await fetchProjects();
      } catch {
        toast.error(
          editing ? "Failed to update project" : "Failed to create project"
        );
      } finally {
        setSaving(false);
      }
    },
    [editing, fetchProjects]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this project? Chats in it won't be deleted."))
        return;
      try {
        const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete project");
        toast.success("Project deleted");
        await fetchProjects();
      } catch {
        toast.error("Failed to delete project");
      }
    },
    [fetchProjects]
  );

  const handleEdit = useCallback((p: Project) => {
    setEditing(p);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditing(null);
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Group chats with shared context and instructions
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New project</Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ProjectForm
            initial={editing}
            onCancel={handleCancel}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No projects yet. Create one to group chats with shared context.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              project={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}

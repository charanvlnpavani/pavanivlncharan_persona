import { useMutation, useQueryClient } from "@tanstack/react-query";
import { skillSchema, type SkillInput } from "@portfolio/shared";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SelectField, TextField } from "@/components/forms/fields";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, Card, CardBody, CardHeader, Input, Select } from "@/components/ui/primitives";
import { useResource } from "@/hooks/use-resource";
import { api, errorMessage } from "@/services/api";
import type { ItemFlags } from "@/types";

type Skill = ItemFlags & SkillInput & { categoryName: string };
type Category = ItemFlags & { name: string; isVisible: boolean; skillCount: number };

const defaults: SkillInput = { name: "", categoryId: "", icon: "", isVisible: true, includeInResume: true, resumeSummary: "" };

/** Inline manager for skill groups (Frontend, Backend, …). */
function CategoryManager() {
  const qc = useQueryClient();
  const { list, remove, reorder } = useResource<Category>("skill-categories");
  const [name, setName] = useState("");
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["skill-categories"] });
    void qc.invalidateQueries({ queryKey: ["skills"] });
    void qc.invalidateQueries({ queryKey: ["publish-status"] });
  };
  const create = useMutation({
    mutationFn: () => api("/skill-categories", { method: "POST", body: { name, isVisible: true } }),
    onSuccess: () => {
      setName("");
      refresh();
      toast.success("Category added");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const toggle = useMutation({
    mutationFn: (c: Category) => api(`/skill-categories/${c.id}`, { method: "PUT", body: { name: c.name, isVisible: !c.isVisible } }),
    onSuccess: refresh,
    onError: (err) => toast.error(errorMessage(err)),
  });
  const cats = list.data ?? [];
  const move = (i: number, dir: -1 | 1) => {
    const ids = cats.map((c) => c.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    reorder.mutate(ids);
  };

  return (
    <Card className="mb-6">
      <CardHeader title="Skill categories" description="Groups shown on the website and resume, in this order." />
      <CardBody className="space-y-3">
        <ul className="divide-y rounded-lg border">
          {cats.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 px-3 py-2">
              <div className="flex flex-col">
                <button type="button" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => move(i, -1)} className="text-muted-foreground disabled:opacity-25">
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" aria-label={`Move ${c.name} down`} disabled={i === cats.length - 1} onClick={() => move(i, 1)} className="text-muted-foreground disabled:opacity-25">
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.skillCount} skills</span>
              {!c.isVisible && <Badge>Hidden</Badge>}
              <Button variant="ghost" size="icon-sm" aria-label={c.isVisible ? `Hide ${c.name}` : `Show ${c.name}`} onClick={() => toggle.mutate(c)}>
                {c.isVisible ? <Eye /> : <EyeOff />}
              </Button>
              <ConfirmDialog
                title={`Delete “${c.name}”?`}
                description={`This also deletes its ${c.skillCount} skill(s).`}
                onConfirm={() => remove.mutateAsync(c.id)}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${c.name}`} className="hover:text-destructive">
                    <Trash2 />
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category, e.g. Cloud" aria-label="New category name" maxLength={60} />
          <Button type="submit" variant="outline" disabled={!name.trim() || create.isPending}>
            <Plus /> Add
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function SkillsPage() {
  const { list: cats } = useResource<Category>("skill-categories");
  const [category, setCategory] = useState("");
  return (
    <ResourceList<Skill>
      resource="skills"
      title="Skills"
      singular="skill"
      basePath="/skills"
      description="Each skill belongs to a category. Order matters within a category."
      primary={(s) => s.name}
      secondary={(s) => s.categoryName}
      filter={category ? (s) => s.categoryId === category : undefined}
      headerExtra={
        <>
          <CategoryManager />
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="skill-filter" className="text-muted-foreground text-sm">
              Show
            </label>
            <Select id="skill-filter" value={category} onChange={(e) => setCategory(e.target.value)} className="w-56">
              <option value="">All categories</option>
              {(cats.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </>
      }
    />
  );
}

export function SkillEditPage() {
  const { list: cats } = useResource<Category>("skill-categories");
  const options = (cats.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  return (
    <ResourceEditor<Skill, SkillInput>
      resource="skills"
      schema={skillSchema}
      defaults={{ ...defaults, categoryId: options[0]?.value ?? "" }}
      singular="skill"
      basePath="/skills"
      title={(s) => s?.name ?? "Skill"}
      previewPath={() => "/skills"}
    >
      {() => (
        <>
          <Card>
            <CardHeader title="Skill" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="name" label="Name" placeholder="TypeScript" />
              <SelectField name="categoryId" label="Category" options={options} placeholder={options.length ? undefined : "Add a category first"} />
              <TextField name="icon" label="Icon name (optional)" hint="A lucide icon name, e.g. database." />
            </CardBody>
          </Card>
          <ItemOptions showResume={true} resumeHint="Rarely needed for skills. Leave empty to use the name." />
        </>
      )}
    </ResourceEditor>
  );
}

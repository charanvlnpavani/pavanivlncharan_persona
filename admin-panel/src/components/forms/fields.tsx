import { ImagePlus, Loader2, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Controller, get, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Switch, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { api, errorMessage } from "@/services/api";
import type { AdminMedia } from "@/types";

/* Every field reads the surrounding <FormProvider>, shows its label, hint and
   server/client validation error, and wires aria attributes for screen readers. */

type Base = { name: string; label: string; hint?: string; className?: string };

function useFieldError(name: string): string | undefined {
  const { formState } = useFormContext();
  return (get(formState.errors, name) as { message?: string } | undefined)?.message;
}

export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ name, label, hint, className, ...rest }: Base & Omit<React.ComponentProps<"input">, "name">) {
  const { register } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, error, hint)} {...register(name)} {...rest} />
    </Field>
  );
}

export function NumberField({ name, label, hint, className, nullable }: Base & { nullable?: boolean }) {
  const { control } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            aria-invalid={Boolean(error)}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value === "" ? (nullable ? null : undefined) : Number(e.target.value))}
            onBlur={field.onBlur}
          />
        )}
      />
    </Field>
  );
}

export function TextAreaField({ name, label, hint, className, rows = 4 }: Base & { rows?: number }) {
  const { register } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Textarea id={id} rows={rows} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, error, hint)} {...register(name)} />
    </Field>
  );
}

/** string[] edited as a textarea, one item per line. */
export function LinesField({ name, label, hint = "One per line.", className, rows = 4 }: Base & { rows?: number }) {
  const { control } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <LinesTextarea id={id} rows={rows} invalid={Boolean(error)} value={field.value ?? []} onChange={field.onChange} onBlur={field.onBlur} />
        )}
      />
    </Field>
  );
}

/** Keeps the raw text while typing so blank lines don't vanish mid-edit. */
function LinesTextarea({
  id,
  rows,
  invalid,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  rows: number;
  invalid: boolean;
  value: string[];
  onChange: (v: string[]) => void;
  onBlur: () => void;
}) {
  const [text, setText] = useState(() => value.join("\n"));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue && value.join("\n") !== text.split("\n").map((l) => l.trim()).filter(Boolean).join("\n")) {
    setLastValue(value);
    setText(value.join("\n"));
  }
  return (
    <Textarea
      id={id}
      rows={rows}
      aria-invalid={invalid}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const next = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean);
        setLastValue(next);
        onChange(next);
      }}
      onBlur={onBlur}
    />
  );
}

/** string[] edited as comma-separated text. */
export function TagsField({ name, label, hint = "Separate with commas.", className }: Base) {
  const { control } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TagsInput id={id} invalid={Boolean(error)} value={field.value ?? []} onChange={field.onChange} onBlur={field.onBlur} />
        )}
      />
    </Field>
  );
}

function TagsInput({
  id,
  invalid,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  invalid: boolean;
  value: string[];
  onChange: (v: string[]) => void;
  onBlur: () => void;
}) {
  const [text, setText] = useState(() => value.join(", "));
  return (
    <>
      <Input
        id={id}
        aria-invalid={invalid}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
        }}
        onBlur={() => {
          setText(value.join(", "));
          onBlur();
        }}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1" aria-hidden="true">
          {value.map((t) => (
            <span key={t} className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function SwitchField({ name, label, hint }: Base) {
  const { control } = useFormContext();
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <Switch id={id} checked={Boolean(field.value)} onChange={field.onChange} label={label} description={hint} />}
    />
  );
}

export function SelectField({
  name,
  label,
  hint,
  className,
  options,
  placeholder,
}: Base & { options: { value: string; label: string }[]; placeholder?: string }) {
  const { register } = useFormContext();
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <Select id={id} aria-invalid={Boolean(error)} {...register(name)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/* ───────────── Media ───────────── */

async function uploadFile(file: File, alt: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);
  return api<AdminMedia>("/media", { method: "POST", body: form });
}

function useUploader(onUploaded: (m: AdminMedia) => void, alt: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = () => inputRef.current?.click();
  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      className="sr-only"
      tabIndex={-1}
      onChange={async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Images must be 5 MB or smaller.");
          return;
        }
        setBusy(true);
        try {
          onUploaded(await uploadFile(file, alt));
          toast.success("Image uploaded");
        } catch (err) {
          toast.error(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    />
  );
  return { pick, busy, input };
}

/** A single image, stored as a media id. */
export function ImageField({ name, label, hint, initial, alt = "" }: Base & { initial?: AdminMedia | null; alt?: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <SingleImagePicker label={label} hint={hint} alt={alt} initial={initial ?? null} value={field.value ?? null} onChange={field.onChange} />
      )}
    />
  );
}

function SingleImagePicker({
  label,
  hint,
  alt,
  initial,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  alt: string;
  initial: AdminMedia | null;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [uploaded, setUploaded] = useState<AdminMedia | null>(null);
  const { pick, busy, input } = useUploader((m) => {
    setUploaded(m);
    onChange(m.id);
  }, alt);
  const current = !value ? null : uploaded?.id === value ? uploaded : initial?.id === value ? initial : null;
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <div className="bg-muted grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border">
          {current ? (
            <img src={current.url} alt={current.alt} className="size-full object-cover" />
          ) : (
            <ImagePlus className="text-muted-foreground size-6" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={pick} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {current ? "Replace" : "Upload"}
          </Button>
          {current && (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        {input}
      </div>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

/** Several images (project screenshots), stored as ordered media ids. */
export function ImagesField({ name, label, hint, initial = [], alt = "" }: Base & { initial?: AdminMedia[]; alt?: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MultiImagePicker label={label} hint={hint} alt={alt} initial={initial} value={field.value ?? []} onChange={field.onChange} />
      )}
    />
  );
}

function MultiImagePicker({
  label,
  hint,
  alt,
  initial,
  value: ids,
  onChange,
}: {
  label: string;
  hint?: string;
  alt: string;
  initial: AdminMedia[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [known, setKnown] = useState<Record<string, AdminMedia>>(() => Object.fromEntries(initial.map((m) => [m.id, m])));
  const { pick, busy, input } = useUploader((m) => {
    setKnown((k) => ({ ...k, [m.id]: m }));
    onChange([...ids, m.id]);
  }, alt);
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ids.map((id, i) => (
          <li key={id} className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
            {known[id] && <img src={known[id].url} alt={known[id].alt} className="size-full object-cover" />}
            <button
              type="button"
              aria-label={`Remove screenshot ${i + 1}`}
              onClick={() => onChange(ids.filter((x) => x !== id))}
              className="bg-background/90 absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full border shadow-sm"
            >
              <X className="size-3.5" />
            </button>
            {i === 0 && <span className="bg-background/90 absolute bottom-1.5 left-1.5 rounded px-1.5 text-[10px] font-medium">Cover</span>}
          </li>
        ))}
        {ids.length < 10 && (
          <li>
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 grid aspect-video w-full place-items-center rounded-lg border border-dashed text-xs outline-none focus-visible:ring-[3px]"
            >
              <span className="flex flex-col items-center gap-1">
                {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                Add screenshot
              </span>
            </button>
          </li>
        )}
      </ul>
      {input}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

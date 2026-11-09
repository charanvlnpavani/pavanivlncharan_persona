import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, errorMessage } from "@/services/api";
import type { AdminMedia } from "@/types";

/**
 * Rich-text editor for blog posts (Tiptap). Produces HTML; the backend
 * sanitizes it again on save, so pasted scripts or styles never get through.
 */
export function RichTextField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium" id={`${name}-label`}>
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} labelledBy={`${name}-label`} />}
      />
    </div>
  );
}

function RichTextEditor({ value, onChange, labelledBy }: { value: string; onChange: (html: string) => void; labelledBy: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-labelledby": labelledBy,
        class:
          "prose-admin min-h-72 px-4 py-3 outline-none [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_code]:font-mono [&_code]:text-sm [&_a]:text-brand [&_a]:underline [&_img]:rounded-lg [&_img]:my-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: true,
  });

  if (!editor) return null;
  return (
    <div className="bg-card focus-within:ring-ring/30 focus-within:border-ring overflow-hidden rounded-md border focus-within:ring-[3px]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const btn = (label: string, icon: React.ReactNode, active: boolean, run: () => void) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={run}
      className={cn("hover:bg-accent grid size-8 place-items-center rounded-md [&_svg]:size-4", active && "bg-accent text-brand")}
    >
      {icon}
    </button>
  );
  return (
    <div role="toolbar" aria-label="Formatting" className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b p-1">
      {btn("Heading", <Heading2 />, editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
      {btn("Subheading", <Heading3 />, editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
      {btn("Bold", <Bold />, editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
      {btn("Italic", <Italic />, editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
      {btn("Bulleted list", <List />, editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
      {btn("Numbered list", <ListOrdered />, editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
      {btn("Quote", <Quote />, editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run())}
      {btn("Code block", <Code />, editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run())}
      {btn("Link", <LinkIcon />, editor.isActive("link"), () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Link URL (https://…)", prev ?? "https://");
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else if (/^(https?:|mailto:)/.test(url)) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        else toast.error("Links must start with https://, http:// or mailto:");
      })}
      <button
        type="button"
        aria-label="Insert image"
        title="Insert image"
        onClick={() => fileRef.current?.click()}
        className="hover:bg-accent grid size-8 place-items-center rounded-md [&_svg]:size-4"
      >
        <ImagePlus />
      </button>
      <span className="bg-border mx-1 h-5 w-px" aria-hidden="true" />
      {btn("Undo", <Undo />, false, () => editor.chain().focus().undo().run())}
      {btn("Redo", <Redo />, false, () => editor.chain().focus().redo().run())}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          try {
            const form = new FormData();
            form.append("file", file);
            const media = await api<AdminMedia>("/media", { method: "POST", body: form });
            editor.chain().focus().setImage({ src: media.url, alt: file.name }).run();
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />
    </div>
  );
}

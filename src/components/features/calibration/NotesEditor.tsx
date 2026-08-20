"use client";

import { useEffect, type ReactNode } from "react";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor = ({ value, onChange }: NotesEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class: "calibration-notes-editor min-h-[140px] px-3.5 py-3 text-xs sm:text-sm text-slate-800 outline-none bg-white",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "");
  }, [editor, value]);

  if (!editor) return null;

  const action = (label: string, icon: ReactNode, run: () => void, active = false) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={cn("h-7 w-7 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70", active && "bg-slate-200 text-slate-900 font-bold")}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        run();
      }}
    >
      {icon}
    </Button>
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-slate-800">Catatan dan Tindakan Pemeliharaan</Label>
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/70 bg-slate-50/80 p-2">
          {action("Tebal", <Bold className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
          {action("Miring", <Italic className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
          {action("Garis Bawah", <UnderlineIcon className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
          {action("Coret", <Strikethrough className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
          <div className="h-4 w-px bg-slate-200 mx-1" />
          {action("Daftar Berpoin", <List className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
          {action("Daftar Bernomor", <ListOrdered className="h-3.5 w-3.5" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
          <div className="h-4 w-px bg-slate-200 mx-1" />
          {action("Urungkan", <Undo2 className="h-3.5 w-3.5" />, () => editor.chain().focus().undo().run())}
          {action("Ulangi", <Redo2 className="h-3.5 w-3.5" />, () => editor.chain().focus().redo().run())}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

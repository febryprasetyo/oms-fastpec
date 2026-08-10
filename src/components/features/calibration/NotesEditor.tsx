"use client";

import { useEffect, type ReactNode } from "react";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface NotesEditorProps { value: string; onChange: (value: string) => void; }

export const NotesEditor = ({ value, onChange }: NotesEditorProps) => {
  const editor = useEditor({ extensions: [StarterKit, Underline], content: value, onUpdate: ({ editor: current }) => onChange(current.getHTML()), editorProps: { attributes: { class: "min-h-[140px] px-3 py-2 text-sm outline-none" } } });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || ""); }, [editor, value]);
  if (!editor) return null;
  const action = (label: string, icon: ReactNode, run: () => void, active = false) => <Button type="button" variant={active ? "secondary" : "outline"} size="icon" className="h-8 w-8" aria-label={label} onMouseDown={(event) => { event.preventDefault(); run(); }}>{icon}</Button>;
  return <div className="space-y-2"><Label className="text-sm font-semibold">Notes & Maintenance Actions</Label><div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950"><div className="flex flex-wrap gap-1 border-b bg-slate-100 p-2 dark:bg-slate-900">{action("Bold", <Bold className="h-4 w-4" />, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}{action("Italic", <Italic className="h-4 w-4" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}{action("Underline", <UnderlineIcon className="h-4 w-4" />, () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}{action("Strike", <Strikethrough className="h-4 w-4" />, () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}{action("Bullet list", <List className="h-4 w-4" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}{action("Numbered list", <ListOrdered className="h-4 w-4" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}{action("Undo", <Undo2 className="h-4 w-4" />, () => editor.chain().focus().undo().run())}{action("Redo", <Redo2 className="h-4 w-4" />, () => editor.chain().focus().redo().run())}</div><EditorContent editor={editor} /></div></div>;
};

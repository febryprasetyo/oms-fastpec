import React from "react";
import { Label } from "@/components/ui/label";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ value, onChange }) => {
  // Simplistic clean textarea replacing TipTap dependency to keep bundle clean and fast, while matching standard field values.
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-800">Notes & Maintenance Actions</Label>
      <textarea
        className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder="Input notes, periodic maintenance actions, or issues found..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

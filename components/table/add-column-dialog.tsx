"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Column, useCollectionStore } from "@/lib/local-table";
import { Calendar, CaretDown, Hash, PlusIcon, TextAa, ToggleLeft } from "@phosphor-icons/react";
import { useState } from "react";

interface AddColumnDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly tableId: string;
}

export function AddColumnDialog({
  isOpen,
  onClose,
  tableId,
}: AddColumnDialogProps) {
  const [selectedType, setSelectedType] = useState<Column["type"]>("text");
  const [columnName, setColumnName] = useState<string>("");
  const store = useCollectionStore();

  const availableTypes = [
    {
      type: "text" as const,
      label: "Text",
      icon: TextAa,
    },
    {
      type: "number" as const,
      label: "Number",
      icon: Hash,
    },
    {
      type: "boolean" as const,
      label: "Boolean",
      icon: ToggleLeft,
    },
    {
      type: "date" as const,
      label: "Date",
      icon: Calendar,
    },
    {
      type: "select" as const,
      label: "Select",
      icon: CaretDown,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && columnName.trim()) {
      store.createColumn(tableId, columnName.trim(), selectedType);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType("text");
    setColumnName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background/95 backdrop-blur-md border-border/50 shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-foreground">Add Column</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          <div className="space-y-2">
            <Input
              placeholder="Column name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              autoFocus
              className="h-10 border border-border/50 bg-muted/30 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/80 my-8">Column Type</label>
            <div className="flex gap-1.5">
              {availableTypes.map((typeDef) => (
                <button
                  key={typeDef.type}
                  type="button"
                  onClick={() => setSelectedType(typeDef.type)}
                  className={`
                    flex-1 p-3 rounded-lg text-left transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium
                    ${selectedType === typeDef.type
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                      : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                    }
                  `}
                >
                  <typeDef.icon
                    size={16}
                    className={selectedType === typeDef.type ? "text-primary" : "text-current"}
                  />
                  <span>{typeDef.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              size="default"
              className="flex-1 h-10 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedType || !columnName.trim()}
              size="default"
              className="flex-1 h-10 text-sm gap-2 bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
            >
              <PlusIcon size={14} />
              Add Column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

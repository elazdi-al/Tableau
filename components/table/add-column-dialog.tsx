"use client";

import { useState } from "react";
import { TableConfiguration, ColumnTypeDefinition } from "@/lib/types";
import { X, Plus } from "@phosphor-icons/react";

interface AddColumnDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAddColumn: (type: string, name: string, config?: Record<string, unknown>) => void;
  readonly config: TableConfiguration;
}

export function AddColumnDialog({
  isOpen,
  onClose,
  onAddColumn,
  config,
}: AddColumnDialogProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [columnName, setColumnName] = useState<string>("");
  const [columnConfig, setColumnConfig] = useState<Record<string, unknown>>({});

  const availableTypes = config.getAvailableTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && columnName.trim()) {
      onAddColumn(selectedType, columnName.trim(), columnConfig);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedType("");
    setColumnName("");
    setColumnConfig({});
    onClose();
  };

  const selectedTypeDef = availableTypes.find(t => t.type === selectedType);

  const renderConfigFields = (typeDef: ColumnTypeDefinition) => {
    const schema = typeDef.configSchema;
    if (!schema) return null;

    // Simple config field rendering based on type
    switch (typeDef.type) {
      case "text":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Placeholder
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter placeholder text..."
                value={(columnConfig.placeholder as string) || ""}
                onChange={(e) => setColumnConfig({...columnConfig, placeholder: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Max Length
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Optional max length..."
                value={(columnConfig.maxLength as number) || ""}
                onChange={(e) => setColumnConfig({...columnConfig, maxLength: e.target.value ? parseInt(e.target.value) : undefined})}
              />
            </div>
          </div>
        );
      case "number":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Min..."
                  value={(columnConfig.min as number) || ""}
                  onChange={(e) => setColumnConfig({...columnConfig, min: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Max..."
                  value={(columnConfig.max as number) || ""}
                  onChange={(e) => setColumnConfig({...columnConfig, max: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Step
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="1"
                value={(columnConfig.step as number) || 1}
                onChange={(e) => setColumnConfig({...columnConfig, step: e.target.value ? parseFloat(e.target.value) : 1})}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add New Column</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Column Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter column name..."
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Column Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {availableTypes.map((typeDef) => (
                <button
                  key={typeDef.type}
                  type="button"
                  onClick={() => setSelectedType(typeDef.type)}
                  className={`
                    p-3 border rounded-md text-left transition-all flex items-center gap-3
                    ${selectedType === typeDef.type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                    }
                  `}
                >
                  {typeDef.icon && (
                    <typeDef.icon
                      size={18}
                      className={selectedType === typeDef.type ? "text-primary" : "text-muted-foreground"}
                    />
                  )}
                  <div>
                    <div className="font-medium text-sm">{typeDef.label}</div>
                    {typeDef.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {typeDef.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTypeDef && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Configuration
              </label>
              {renderConfigFields(selectedTypeDef)}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedType || !columnName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
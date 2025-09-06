import { CellRenderer } from "@/lib/types";
import { textRenderer } from "./text-renderer";
import { numberRenderer } from "./number-renderer";
import { booleanRenderer } from "./boolean-renderer";
import { dateRenderer } from "./date-renderer";
import { selectRenderer } from "./select-renderer";

// Renderer configuration mapping types to renderers
export interface RendererConfig {
  type: string;
  label: string;
  renderer: CellRenderer<any>;
  description?: string;
}

// Available renderers configuration
export const RENDERER_CONFIGS: RendererConfig[] = [
  {
    type: "text",
    label: "Text",
    renderer: textRenderer,
    description: "Basic text input with validation",
  },
  {
    type: "number",
    label: "Number",
    renderer: numberRenderer,
    description: "Numeric input with formatting",
  },
  {
    type: "boolean",
    label: "Boolean",
    renderer: booleanRenderer,
    description: "Checkbox for true/false values",
  },
  {
    type: "date",
    label: "Date",
    renderer: dateRenderer,
    description: "Date picker with validation",
  },
  {
    type: "select",
    label: "Select",
    renderer: selectRenderer,
    description: "Dropdown selection from predefined options",
  },
];

// Create renderer registry from configuration
export const createRendererRegistry = () => {
  const registry = new Map<string, CellRenderer<any>>();

  RENDERER_CONFIGS.forEach(config => {
    registry.set(config.type, config.renderer);
  });

  return registry;
};

// Get available renderer types
export const getAvailableRendererTypes = (): string[] => {
  return RENDERER_CONFIGS.map(config => config.type);
};

// Get renderer config by type
export const getRendererConfig = (type: string): RendererConfig | undefined => {
  return RENDERER_CONFIGS.find(config => config.type === type);
};

// Export individual renderers
export { textRenderer, numberRenderer, booleanRenderer, dateRenderer, selectRenderer };

// Export the default registry creation function
export { createRendererRegistry as createDefaultRendererRegistry };

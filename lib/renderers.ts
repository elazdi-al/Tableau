import { CellRenderer, CellRendererProps, RendererRegistry } from "./types";

// Create renderer registry
export const createRendererRegistry = (): RendererRegistry => {
  return new Map();
};

// Helper to add a renderer to registry
export const addRenderer = <T>(
  registry: RendererRegistry,
  type: string,
  renderer: CellRenderer<T>
): RendererRegistry => {
  registry.set(type, renderer);
  return registry;
};

// Helper to get renderer from registry
export const getRenderer = (
  registry: RendererRegistry,
  type: string
): CellRenderer<any> | undefined => {
  return registry.get(type);
};

// Helper to get default value for a column type
export const getDefaultValue = (
  registry: RendererRegistry,
  columnType: string
): unknown => {
  const renderer = registry.get(columnType);
  return renderer?.defaultValue ?? "";
};

// Helper to validate a value for a column type
export const validateValue = <T>(
  registry: RendererRegistry,
  columnType: string,
  value: unknown
): T => {
  const renderer = registry.get(columnType);
  if (!renderer) {
    return value as T;
  }
  return renderer.validate(value);
};

// Helper to format a value for display
export const formatValue = (
  registry: RendererRegistry,
  columnType: string,
  value: unknown
): string => {
  const renderer = registry.get(columnType);
  if (!renderer || !renderer.format) {
    return String(value ?? "");
  }
  return renderer.format(value);
};

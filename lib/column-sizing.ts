import { Column, ColumnSizingMode } from "./types";

interface ColumnSizingConfig {
  readonly mode: ColumnSizingMode;
  readonly containerWidth: number;
  readonly minColumnWidth: number;
  readonly maxColumnWidth: number;
  readonly showRowNumbers: boolean;
  readonly showActionColumn?: boolean;
}

interface ColumnData {
  readonly column: Column;
  readonly cellValues: unknown[];
}

export function calculateColumnWidths(
  columnsData: ColumnData[],
  config: ColumnSizingConfig,
): Record<string, number> {
  const {
    mode,
    containerWidth,
    minColumnWidth,
    maxColumnWidth,
    showRowNumbers,
    showActionColumn = true,
  } = config;

  // Account for row numbers column and action column
  const rowNumbersWidth = showRowNumbers ? 48 : 0;
  const actionColumnWidth = showActionColumn ? 64 : 0; // w-16 = 64px
  const availableWidth = containerWidth - rowNumbersWidth - actionColumnWidth;
  const totalColumns = columnsData.length;

  if (mode === "fixed") {
    // Use predefined column widths
    return columnsData.reduce(
      (acc, { column }) => {
        acc[column.id] = Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, column.width),
        );
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  if (mode === "auto") {
    // Calculate width based on content
    const widths = columnsData.map(({ column, cellValues }) => {
      const headerWidth = estimateTextWidth(column.name, {
        weight: "medium",
        size: 14,
      });
      const contentWidths = cellValues.map((value) =>
        estimateTextWidth(String(value || ""), { weight: "normal", size: 14 }),
      );

      const maxContentWidth = Math.max(headerWidth, ...contentWidths);
      const padding = 24; // 12px on each side

      return {
        id: column.id,
        naturalWidth: Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, maxContentWidth + padding),
        ),
      };
    });

    const totalNaturalWidth = widths.reduce(
      (sum, { naturalWidth }) => sum + naturalWidth,
      0,
    );

    if (totalNaturalWidth <= availableWidth) {
      // All columns fit naturally
      return widths.reduce(
        (acc, { id, naturalWidth }) => {
          acc[id] = naturalWidth;
          return acc;
        },
        {} as Record<string, number>,
      );
    } else {
      // Scale down proportionally
      const scale = availableWidth / totalNaturalWidth;
      return widths.reduce(
        (acc, { id, naturalWidth }) => {
          acc[id] = Math.max(minColumnWidth, naturalWidth * scale);
          return acc;
        },
        {} as Record<string, number>,
      );
    }
  }

  if (mode === "balanced") {
    // Hybrid approach: content-aware but balanced
    const baseWidth = Math.max(minColumnWidth, availableWidth / totalColumns);

    const widths = columnsData.map(({ column, cellValues }) => {
      const headerWidth = estimateTextWidth(column.name, {
        weight: "medium",
        size: 14,
      });
      const avgContentWidth =
        cellValues.length > 0
          ? cellValues.reduce(
              (sum: number, value: unknown) =>
                sum +
                estimateTextWidth(String(value || ""), {
                  weight: "normal",
                  size: 14,
                }),
              0,
            ) / cellValues.length
          : 50;

      const contentScore = (headerWidth + avgContentWidth) / 2;
      const padding = 24;

      // Balance between equal distribution and content needs
      const contentBasedWidth = contentScore + padding;
      const balancedWidth = (baseWidth + contentBasedWidth) / 2;

      return {
        id: column.id,
        width: Math.max(
          minColumnWidth,
          Math.min(maxColumnWidth, balancedWidth),
        ),
      };
    });

    // Ensure total doesn't exceed available width
    const totalWidth = widths.reduce((sum, { width }) => sum + width, 0);
    if (totalWidth > availableWidth) {
      const scale = availableWidth / totalWidth;
      return widths.reduce(
        (acc, { id, width }) => {
          acc[id] = Math.max(minColumnWidth, width * scale);
          return acc;
        },
        {} as Record<string, number>,
      );
    }

    return widths.reduce(
      (acc, { id, width }) => {
        acc[id] = width;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  // Fallback to equal distribution
  const equalWidth = Math.max(minColumnWidth, availableWidth / totalColumns);
  return columnsData.reduce(
    (acc, { column }) => {
      acc[column.id] = equalWidth;
      return acc;
    },
    {} as Record<string, number>,
  );
}

// Rough estimation of text width in pixels
function estimateTextWidth(
  text: string,
  options: { weight: "normal" | "medium"; size: number },
): number {
  const baseCharWidth = options.size * 0.6; // Rough approximation
  const weightMultiplier = options.weight === "medium" ? 1.1 : 1;
  return text.length * baseCharWidth * weightMultiplier;
}

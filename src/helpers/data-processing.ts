/**
 * Helper to process data pasted from Excel.
 * Rows are expected to be separated by newlines (\n).
 * Columns are expected to be separated by tabs (\t).
 */

/**
 * Parses a string pasted from Excel or a text editor into a 2D array.
 * @param text The raw string from the clipboard or textarea.
 * @returns A 2D array where each inner array represents a row of cells.
 */
export function parseExcelPaste(text: string): string[][] {
  if (!text) return [];

  return text
    .split(/\r?\n/) // Split by newline
    .filter((row) => row.length > 0) // Remove truly empty lines
    .map((row) => row.split("\t").map((cell) => cell.trim())); // Split by tab and trim cells
}

/**
 * Extracts a single column from parsed Excel data.
 * @param data The 2D array from parseExcelPaste.
 * @param columnIndex The index of the column to extract (default 0).
 * @returns A flat array of strings.
 */
export function getColumnData(
  data: string[][],
  columnIndex: number = 0,
): string[] {
  return data
    .map((row) => row[columnIndex])
    .filter((cell) => cell !== undefined && cell !== null);
}

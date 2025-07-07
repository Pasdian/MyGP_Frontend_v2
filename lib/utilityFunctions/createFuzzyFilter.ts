import { rankItem } from "@tanstack/match-sorter-utils";
import { FilterFn } from "@tanstack/react-table";

/**
 * Generic fuzzy filter generator for different data types.
 * @returns A FilterFn typed for the provided generic T.
 */
export function createFuzzyFilter<T>(): FilterFn<T> {
  return (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };
}

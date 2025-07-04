import { getRefsPendingCE } from "@/types/transbel/getRefsPendingCE";
import { rankItem } from "@tanstack/match-sorter-utils";
import { FilterFn } from "@tanstack/react-table";

export const interfaceDataTableFuzzyFilter: FilterFn<getRefsPendingCE> = (
  row,
  columnId,
  value,
  addMeta
) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

type TreeDataItem = {
  id: string;
  name: string;
  children?: TreeDataItem[];
  disabled?: boolean;
  draggable?: boolean;
};

export function toTreeData(obj: Record<string, string[]>): TreeDataItem[] {
  let id = 1;
  const nextId = () => String(id++);
  return Object.entries(obj).map(([section, files]) => ({
    id: nextId(),
    name: section,
    children: files.map((f) => ({
      id: nextId(),
      name: f,
    })),
  }));
}

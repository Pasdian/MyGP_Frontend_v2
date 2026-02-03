export const dropdownDeleteClassName = [
  // layout
  "w-full h-full rounded-md cursor-pointer select-none",
  // colors
  "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
  // transitions and focus
  "transition-colors duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2",
  // disabled state
  "disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ");

export const dropdownModifyClassName = [
  // layout
  "w-full h-full rounded-md cursor-pointer select-none",
  // colors
  "bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black",
  // transitions and focus
  "transition-colors duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
  // disabled state
  "disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ");

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RadioGroupContextValue = {
  disabled?: boolean;
  name: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  value: string;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = React.ComponentProps<"div"> & {
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  value?: string;
};

function RadioGroup({
  className,
  defaultValue,
  disabled,
  name,
  onValueChange,
  required,
  value,
  ...props
}: RadioGroupProps) {
  const generatedName = React.useId();
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");

  const currentValue = value ?? internalValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value]
  );

  return (
    <RadioGroupContext.Provider
      value={{
        disabled,
        name: name ?? generatedName,
        onValueChange: handleValueChange,
        required,
        value: currentValue,
      }}
    >
      <div
        role="radiogroup"
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = Omit<
  React.ComponentProps<"input">,
  "checked" | "defaultChecked" | "name" | "onChange" | "type" | "value"
> & {
  value: string;
};

function RadioGroupItem({
  className,
  disabled,
  id,
  required,
  value,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);

  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }

  const isChecked = context.value === value;

  return (
    <input
      type="radio"
      id={id}
      name={context.name}
      value={value}
      checked={isChecked}
      disabled={disabled ?? context.disabled}
      required={required ?? context.required}
      onChange={() => context.onValueChange(value)}
      aria-checked={isChecked}
      data-slot="radio-group-item"
      className={cn(
        "size-4 shrink-0 accent-blue-500 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };

"use client";

import type { ComponentProps, ReactNode } from "react";
import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Form controls wired to React Hook Form. Each one renders its label, its
// control, an optional hint and the validation message, and links them for
// screen readers (label → control, control → error via aria-describedby).

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

const ids = (name: string) => ({
  descriptionId: `${name}-description`,
  errorId: `${name}-error`,
});

const describedBy = (name: string, hasDescription: boolean, hasError: boolean) => {
  const { descriptionId, errorId } = ids(name);

  return [hasDescription ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;
};

type TextFieldProps<T extends FieldValues> = BaseProps<T> &
  Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "className">;

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  type = "text",
  ...inputProps
}: TextFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({ control, name });
  const isNumber = type === "number";

  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        {...inputProps}
        id={name}
        type={type}
        name={name}
        ref={ref}
        // A cleared number box is "no value", not NaN or an empty string.
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            isNumber
              ? event.target.value === ""
                ? undefined
                : event.target.valueAsNumber
              : event.target.value,
          )
        }
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy(name, Boolean(description), invalid)}
      />
      {description ? (
        <FieldDescription id={ids(name).descriptionId}>{description}</FieldDescription>
      ) : null}
      {invalid ? <FieldError id={ids(name).errorId} errors={[error]} /> : null}
    </Field>
  );
}

type TextareaFieldProps<T extends FieldValues> = BaseProps<T> &
  Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange" | "onBlur" | "className">;

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  maxLength,
  ...textareaProps
}: TextareaFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({ control, name });
  const length = typeof value === "string" ? value.length : 0;

  return (
    <Field data-invalid={invalid} className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {maxLength ? (
          <span className="text-muted-foreground nums text-xs" aria-hidden>
            {length}/{maxLength}
          </span>
        ) : null}
      </div>
      <Textarea
        {...textareaProps}
        id={name}
        name={name}
        ref={ref}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={describedBy(name, Boolean(description), invalid)}
      />
      {description ? (
        <FieldDescription id={ids(name).descriptionId}>{description}</FieldDescription>
      ) : null}
      {invalid ? <FieldError id={ids(name).errorId} errors={[error]} /> : null}
    </Field>
  );
}

export type SelectOption = { value: string; label: string; description?: string };

type SelectFieldProps<T extends FieldValues> = BaseProps<T> & {
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = "Select…",
  disabled,
}: SelectFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({ control, name });

  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select name={name} value={value ?? ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={name}
          ref={ref}
          onBlur={onBlur}
          className="w-full"
          aria-invalid={invalid}
          aria-describedby={describedBy(name, Boolean(description), invalid)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? (
        <FieldDescription id={ids(name).descriptionId}>{description}</FieldDescription>
      ) : null}
      {invalid ? <FieldError id={ids(name).errorId} errors={[error]} /> : null}
    </Field>
  );
}

type SwitchFieldProps<T extends FieldValues> = BaseProps<T> & { disabled?: boolean };

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: SwitchFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
  } = useController({ control, name });

  return (
    <Field orientation="horizontal" className={className}>
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
      <Switch
        id={name}
        ref={ref}
        checked={Boolean(value)}
        onCheckedChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
    </Field>
  );
}

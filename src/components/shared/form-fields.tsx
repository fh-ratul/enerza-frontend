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
  const { field, fieldState } = useController({ control, name });
  const isNumber = type === "number";

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        {...inputProps}
        id={name}
        type={type}
        name={field.name}
        ref={field.ref}
        // A cleared number box is "no value", not NaN or an empty string.
        value={field.value ?? ""}
        onChange={(event) =>
          field.onChange(
            isNumber
              ? event.target.value === ""
                ? undefined
                : event.target.valueAsNumber
              : event.target.value,
          )
        }
        onBlur={field.onBlur}
        aria-invalid={fieldState.invalid}
        aria-describedby={describedBy(name, Boolean(description), fieldState.invalid)}
      />
      {description ? (
        <FieldDescription id={ids(name).descriptionId}>{description}</FieldDescription>
      ) : null}
      {fieldState.invalid ? <FieldError id={ids(name).errorId} errors={[fieldState.error]} /> : null}
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
  const { field, fieldState } = useController({ control, name });
  const length = typeof field.value === "string" ? field.value.length : 0;

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
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
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        maxLength={maxLength}
        aria-invalid={fieldState.invalid}
        aria-describedby={describedBy(name, Boolean(description), fieldState.invalid)}
      />
      {description ? (
        <FieldDescription id={ids(name).descriptionId}>{description}</FieldDescription>
      ) : null}
      {fieldState.invalid ? <FieldError id={ids(name).errorId} errors={[fieldState.error]} /> : null}
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
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select
        name={field.name}
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          ref={field.ref}
          onBlur={field.onBlur}
          className="w-full"
          aria-invalid={fieldState.invalid}
          aria-describedby={describedBy(name, Boolean(description), fieldState.invalid)}
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
      {fieldState.invalid ? <FieldError id={ids(name).errorId} errors={[fieldState.error]} /> : null}
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
  const { field } = useController({ control, name });

  return (
    <Field orientation="horizontal" className={className}>
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
      <Switch
        id={name}
        ref={field.ref}
        checked={Boolean(field.value)}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled}
      />
    </Field>
  );
}

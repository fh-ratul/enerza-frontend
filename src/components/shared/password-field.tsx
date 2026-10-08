"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type PasswordFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
};

/** A password box with a show/hide button. */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  autoComplete,
  placeholder,
}: PasswordFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({ control, name });
  const [visible, setVisible] = useState(false);
  const errorId = `${name}-error`;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={name}
          type={visible ? "text" : "password"}
          name={name}
          ref={ref}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {invalid ? <FieldError id={errorId} errors={[error]} /> : null}
    </Field>
  );
}

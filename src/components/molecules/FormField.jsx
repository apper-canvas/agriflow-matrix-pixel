import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  required = false, 
  error,
  className,
  ...props 
}) => {
  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <Select name={name} value={value} onChange={onChange} {...props}>
            <option value="">{placeholder || "Select an option..."}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      case "textarea":
        return (
          <Textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
          />
        );
      default:
        return (
          <Input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;
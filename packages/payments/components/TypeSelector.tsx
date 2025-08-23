import { useEffect, useState } from "preact/hooks";

interface TypeOption {
  value: string;
  label: string;
  subTypes?: Array<{ value: string; label: string }>;
}

interface TypeSelectorProps {
  types: TypeOption[];
  selectedType: string;
  selectedSubType?: string;
  onTypeChange: (type: string) => void;
  onSubTypeChange: (subType: string) => void;
  typeLabel?: string;
  subTypeLabel?: string;
  className?: string;
}

export default function TypeSelector({
  types,
  selectedType,
  selectedSubType,
  onTypeChange,
  onSubTypeChange,
  typeLabel = "Type",
  subTypeLabel = "Sub-type",
  className = "",
}: TypeSelectorProps) {
  const [availableSubTypes, setAvailableSubTypes] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    const typeOption = types.find((t) => t.value === selectedType);
    setAvailableSubTypes(typeOption?.subTypes || []);

    // Clear sub-type if it's not available for the new type
    if (selectedSubType && !typeOption?.subTypes?.find((st) => st.value === selectedSubType)) {
      onSubTypeChange("");
    }
  }, [selectedType, types]);

  return (
    <div class={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div class="form-control">
        <label class="label">
          <span class="label-text">{typeLabel} *</span>
        </label>
        <select
          class="select select-bordered"
          value={selectedType}
          onChange={(e) => onTypeChange(e.currentTarget.value)}
        >
          <option value="">Select {typeLabel.toLowerCase()}</option>
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {availableSubTypes.length > 0 && (
        <div class="form-control">
          <label class="label">
            <span class="label-text">{subTypeLabel}</span>
          </label>
          <select
            class="select select-bordered"
            value={selectedSubType || ""}
            onChange={(e) => onSubTypeChange(e.currentTarget.value)}
          >
            <option value="">Select {subTypeLabel.toLowerCase()}</option>
            {availableSubTypes.map((subType) => (
              <option key={subType.value} value={subType.value}>
                {subType.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

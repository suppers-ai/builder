import { useEffect, useState } from "preact/hooks";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
} from "../lib/api-helpers.ts";

interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: CreateApplicationData | UpdateApplicationData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const templateOptions = [
  {
    value: "fresh-basic",
    label: "Fresh Basic",
    description: "Basic Fresh framework with Tailwind CSS",
  },
];

export function ApplicationForm({
  application,
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: application?.name || "",
    description: application?.description || "",
    templateId: application?.template_id || "fresh-basic",
    status: application?.status || "draft" as const,
    configuration: application?.configuration || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configurationJson, setConfigurationJson] = useState("{}");

  // Initialize configuration JSON
  useEffect(() => {
    if (application?.configuration) {
      setConfigurationJson(JSON.stringify(application.configuration, null, 2));
    }
  }, [application]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Application name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Application name must be at least 3 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Validate configuration JSON
    try {
      const parsedConfig = JSON.parse(configurationJson);
      if (typeof parsedConfig !== "object" || parsedConfig === null) {
        newErrors.configuration = "Configuration must be a valid JSON object";
      }
    } catch (error) {
      newErrors.configuration = "Invalid JSON format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const parsedConfiguration = JSON.parse(configurationJson);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        templateId: formData.templateId,
        status: formData.status,
        configuration: parsedConfiguration,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleConfigurationChange = (value: string) => {
    setConfigurationJson(value);

    // Clear error when user starts typing
    if (errors.configuration) {
      setErrors((prev) => ({ ...prev, configuration: "" }));
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          {application ? "Edit Application" : "Create New Application"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Application Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter application name"
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter application description"
              disabled={isLoading}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}
            </p>}
          </div>

          {/* Template Type */}
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
              Template Type *
            </label>
            <select
              id="templateId"
              value={formData.templateId}
              onChange={(e) => handleInputChange("templateId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {templateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {templateOptions.find((opt) => opt.value === formData.templateId)?.description}
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Configuration */}
          <div>
            <label htmlFor="configuration" className="block text-sm font-medium text-gray-700 mb-2">
              Configuration (JSON)
            </label>
            <textarea
              id="configuration"
              value={configurationJson}
              onChange={(e) => handleConfigurationChange(e.target.value)}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.configuration ? "border-red-500" : "border-gray-300"
              }`}
              placeholder='{"key": "value"}'
              disabled={isLoading}
            />
            {errors.configuration && (
              <p className="mt-1 text-sm text-red-600">{errors.configuration}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter valid JSON configuration for your application
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : application ? "Update Application" : "Create Application"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;

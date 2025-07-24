import { EntityForm, FormField } from "./EntityForm.tsx";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
} from "../../../shared/lib/api-helpers.ts";

interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: CreateApplicationData | UpdateApplicationData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const applicationFields: FormField[] = [
  {
    key: "name",
    label: "Application Name",
    type: "text",
    required: true,
    placeholder: "Enter application name",
    validation: {
      minLength: 3,
      maxLength: 100
    }
  },
  {
    key: "description", 
    label: "Description",
    type: "textarea",
    placeholder: "Enter application description",
    validation: {
      maxLength: 500
    }
  },
  {
    key: "templateId",
    label: "Template Type",
    type: "select",
    required: true,
    options: [
      {
        value: "fresh-basic",
        label: "Fresh Basic",
        description: "Basic Fresh framework with Tailwind CSS"
      }
    ]
  },
  {
    key: "status",
    label: "Status", 
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" }
    ]
  },
  {
    key: "configuration",
    label: "Configuration (JSON)",
    type: "json",
    placeholder: '{"key": "value"}'
  }
];

export function ApplicationForm({
  application,
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
}: ApplicationFormProps) {
  const initialData = application ? {
    name: application.name,
    description: application.description || "",
    templateId: application.template_id,
    status: application.status,
    configuration: application.configuration || {}
  } : {
    name: "",
    description: "",
    templateId: "fresh-basic", 
    status: "draft",
    configuration: {}
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const submitData = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      templateId: data.templateId,
      status: data.status,
      configuration: data.configuration,
    };

    await onSubmit(submitData);
  };

  return (
    <EntityForm
      title={application ? "Edit Application" : "Create New Application"}
      fields={applicationFields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      className={className}
      submitLabel={application ? "Update Application" : "Create Application"}
    />
  );
}

export default ApplicationForm;
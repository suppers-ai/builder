import { useEffect, useState } from "preact/hooks";
import { Modal, Input, Textarea, Select, LoadingButton, Button, Badge } from "@suppers/ui-lib";
import { Plus, X, MapPin, Image } from "lucide-preact";
import { getAuthClient } from "../../lib/auth.ts";
import toast from "../../lib/toast-manager.ts";
import { ImageUploadApiClient } from "../../lib/api-client/uploads/image-upload-api.ts";

interface EntityType {
  id: string;
  name: string;
  description?: string;
  metadataSchema?: Record<string, any>;
  locationRequired?: boolean;
}

interface EntityModalProps {
  entity?: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function EntityModal({ entity, onSave, onClose }: EntityModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [uploadClient, setUploadClient] = useState<ImageUploadApiClient | null>(null);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([
    {
      id: "1",
      name: "Restaurant",
      description: "Food and dining establishments",
      metadataSchema: {
        cuisine: {
          type: "select",
          label: "Cuisine Type",
          required: true,
          options: ["Italian", "Chinese", "Mexican", "American", "Japanese", "Indian", "Other"]
        },
        capacity: {
          type: "number",
          label: "Seating Capacity",
          required: true,
          min: 1,
          max: 500
        },
        priceRange: {
          type: "select",
          label: "Price Range",
          required: false,
          options: ["$", "$$", "$$$", "$$$$"]
        },
        openingHours: {
          type: "text",
          label: "Opening Hours",
          required: false,
          placeholder: "e.g., Mon-Fri 9am-10pm"
        }
      },
      locationRequired: true
    },
    {
      id: "2",
      name: "Event",
      description: "Conferences, workshops, and gatherings",
      metadataSchema: {
        eventDate: {
          type: "date",
          label: "Event Date",
          required: true
        },
        eventTime: {
          type: "time",
          label: "Start Time",
          required: true
        },
        duration: {
          type: "number",
          label: "Duration (hours)",
          required: true,
          min: 0.5,
          max: 72
        },
        expectedAttendees: {
          type: "number",
          label: "Expected Attendees",
          required: false,
          min: 1
        },
        venue: {
          type: "text",
          label: "Venue Name",
          required: true
        },
        ticketTypes: {
          type: "text",
          label: "Ticket Types",
          placeholder: "e.g., General, VIP, Student",
          required: false
        }
      },
      locationRequired: true
    },
    {
      id: "3",
      name: "Service",
      description: "Professional and business services",
      metadataSchema: {
        serviceCategory: {
          type: "select",
          label: "Service Category",
          required: true,
          options: ["Consulting", "Design", "Development", "Marketing", "Legal", "Financial", "Other"]
        },
        experienceYears: {
          type: "number",
          label: "Years of Experience",
          required: false,
          min: 0,
          max: 100
        },
        certifications: {
          type: "text",
          label: "Certifications",
          required: false,
          placeholder: "List any relevant certifications"
        },
        serviceArea: {
          type: "text",
          label: "Service Area",
          required: false,
          placeholder: "e.g., Local, National, International"
        }
      },
      locationRequired: false
    },
    {
      id: "4",
      name: "General",
      description: "General purpose entity",
      metadataSchema: {
        category: {
          type: "text",
          label: "Category",
          required: false
        }
      },
      locationRequired: false
    }
  ]);
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: entity?.name || "",
    description: entity?.description || "",
    type: entity?.type || "",
    subType: entity?.subType || "",
    status: entity?.status || "active",
    metadata: entity?.metadata || {},
    photos: entity?.photos || [],
    location: entity?.location || null
  });

  // Dynamic metadata fields based on selected type
  const [metadataFields, setMetadataFields] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize upload client
    const initUploadClient = async () => {
      const authClient = getAuthClient();
      setUploadClient(new ImageUploadApiClient(authClient));
    };
    initUploadClient();

    // If editing, set the selected type
    if (entity?.type && entityTypes.length > 0) {
      const type = entityTypes.find(t => t.name.toLowerCase() === entity.type.toLowerCase());
      if (type) {
        setSelectedType(type);
        setFormData(prev => ({ ...prev, type: type.name.toLowerCase() }));
      }
    }
  }, [entity, entityTypes]);

  useEffect(() => {
    if (selectedType?.metadataSchema) {
      // Initialize metadata fields based on schema
      const initialMetadata: Record<string, any> = {};
      Object.entries(selectedType.metadataSchema).forEach(([key, schema]: [string, any]) => {
        initialMetadata[key] = formData.metadata[key] || schema.defaultValue || "";
      });
      setMetadataFields(initialMetadata);
    }
  }, [selectedType]);

  const handleTypeChange = (typeName: string) => {
    const type = entityTypes.find(t => t.name.toLowerCase() === typeName);
    setSelectedType(type || null);
    setFormData(prev => ({ ...prev, type: typeName }));
  };

  const handleMetadataChange = (key: string, value: any) => {
    setMetadataFields(prev => ({ ...prev, [key]: value }));
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const handleAddPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      try {
        setLoading(true);

        for (const file of files) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
            continue;
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error(`File ${file.name} is not an image.`);
            continue;
          }

          try {
            // Use the ImageUploadApiClient
            if (!uploadClient) {
              throw new Error("Upload client not initialized");
            }
            
            const result = await uploadClient.uploadImage(file);
            const imageUrl = result.url;

            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, { url: imageUrl, caption: '' }]
            }));
            toast.success(`Image ${file.name} uploaded successfully`);
            
          } catch (fileError) {
            console.warn(`Failed to upload ${file.name}, using blob URL:`, fileError);
            // Fallback to blob URL
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, { url: imageUrl, caption: '' }]
            }));
            toast.success(`Image ${file.name} added (temporary URL)`);
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload images');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSetLocation = () => {
    // In a real implementation, this would open a map picker
    const lat = prompt("Enter latitude:");
    const lng = prompt("Enter longitude:");
    if (lat && lng) {
      setFormData(prev => ({
        ...prev,
        location: { latitude: parseFloat(lat), longitude: parseFloat(lng) }
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Entity name is required");
      return;
    }

    if (!formData.type) {
      toast.error("Please select an entity type");
      return;
    }

    // Validate metadata fields based on schema
    if (selectedType?.metadataSchema) {
      for (const [key, schema] of Object.entries(selectedType.metadataSchema)) {
        if (schema.required && !metadataFields[key]) {
          toast.error(`${schema.label} is required`);
          return;
        }
      }
    }

    // Check location requirement
    if (selectedType?.locationRequired && !formData.location) {
      toast.error("Location is required for this entity type");
      return;
    }

    try {
      setLoading(true);
      // Prepare data with correct field names for API
      const submitData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        sub_type: formData.subType,  // API expects sub_type not subType
        status: formData.status,
        metadata: metadataFields,
        photos: formData.photos,
        location: formData.location
      };
      await onSave(submitData);
    } catch (error) {
      console.error("Error saving entity:", error);
      toast.error("Failed to save entity");
    } finally {
      setLoading(false);
    }
  };

  const renderMetadataField = (key: string, schema: any) => {
    const value = metadataFields[key] || "";

    switch (schema.type) {
      case "select":
        return (
          <div key={key} class="form-control">
            <label class="label">
              <span class="label-text">
                {schema.label}
                {schema.required && <span class="text-error ml-1">*</span>}
              </span>
            </label>
            <select
              value={value}
              onChange={(e) => handleMetadataChange(key, (e.target as HTMLSelectElement).value)}
              required={schema.required}
              class="select select-bordered w-full"
            >
              <option value="">Select {schema.label}</option>
              {schema.options.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case "number":
        return (
          <div key={key} class="form-control">
            <label class="label">
              <span class="label-text">
                {schema.label}
                {schema.required && <span class="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="number"
              value={value}
              onInput={(e) => handleMetadataChange(key, (e.target as HTMLInputElement).value)}
              min={schema.min}
              max={schema.max}
              required={schema.required}
              placeholder={schema.placeholder}
            />
          </div>
        );

      case "date":
        return (
          <div key={key} class="form-control">
            <label class="label">
              <span class="label-text">
                {schema.label}
                {schema.required && <span class="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="date"
              value={value}
              onInput={(e) => handleMetadataChange(key, (e.target as HTMLInputElement).value)}
              required={schema.required}
            />
          </div>
        );

      case "time":
        return (
          <div key={key} class="form-control">
            <label class="label">
              <span class="label-text">
                {schema.label}
                {schema.required && <span class="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="time"
              value={value}
              onInput={(e) => handleMetadataChange(key, (e.target as HTMLInputElement).value)}
              required={schema.required}
            />
          </div>
        );

      default:
        return (
          <div key={key} class="form-control">
            <label class="label">
              <span class="label-text">
                {schema.label}
                {schema.required && <span class="text-error ml-1">*</span>}
              </span>
            </label>
            <Input
              type="text"
              value={value}
              onInput={(e) => handleMetadataChange(key, (e.target as HTMLInputElement).value)}
              required={schema.required}
              placeholder={schema.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div class="modal modal-open">
      <div class="modal-box max-w-2xl w-full mx-4">
        <div class="p-2">
        <h2 class="text-xl font-semibold mb-4">
          {entity ? "Edit Entity" : "Create New Entity"}
        </h2>

        <div class="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Basic Information */}
          <div class="space-y-4">
            <h3 class="font-medium text-base-content/80">Basic Information</h3>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Entity Name <span class="text-error">*</span></span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onInput={(e) => setFormData(prev => ({ ...prev, name: (e.target as HTMLInputElement).value }))}
                placeholder="Enter entity name"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <Textarea
                value={formData.description}
                onInput={(e) => setFormData(prev => ({ ...prev, description: (e.target as HTMLTextAreaElement).value }))}
                placeholder="Enter entity description"
                rows={3}
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Entity Type <span class="text-error">*</span></span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange((e.target as HTMLSelectElement).value)}
                  required
                  class="select select-bordered w-full"
                >
                  <option value="">Select Type</option>
                  {entityTypes.map(type => (
                    <option key={type.id} value={type.name.toLowerCase()}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Sub Type</span>
                </label>
                <Input
                  type="text"
                  value={formData.subType}
                  onInput={(e) => setFormData(prev => ({ ...prev, subType: (e.target as HTMLInputElement).value }))}
                  placeholder="Enter sub type (optional)"
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Status</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: (e.target as HTMLSelectElement).value }))}
                class="select select-bordered w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Dynamic Metadata Fields */}
          {selectedType?.metadataSchema && (
            <div class="space-y-4">
              <h3 class="font-medium text-base-content/80">
                {selectedType.name} Details
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedType.metadataSchema).map(([key, schema]) =>
                  renderMetadataField(key, schema)
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {selectedType && (
            <div class="space-y-4">
              <h3 class="font-medium text-base-content/80">
                Location
                {selectedType.locationRequired && <span class="text-error ml-1">*</span>}
              </h3>
              {formData.location ? (
                <div class="flex items-center gap-2">
                  <Badge variant="soft">
                    <MapPin class="w-3 h-3 mr-1" />
                    Lat: {formData.location.latitude}, Lng: {formData.location.longitude}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, location: null }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetLocation}
                >
                  <MapPin class="w-4 h-4 mr-2" />
                  Set Location
                </Button>
              )}
            </div>
          )}

          {/* Photos */}
          <div class="space-y-4">
            <h3 class="font-medium text-base-content/80">Photos</h3>
            <div class="space-y-2">
              {formData.photos.map((photo: any, index: number) => (
                <div key={index} class="flex items-center gap-2">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium">{photo.caption || "No caption"}</p>
                    <p class="text-xs text-base-content/60 truncate">{photo.url}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="error"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X class="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPhoto}
              >
                <Image class="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div class="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {entity ? "Update Entity" : "Create Entity"}
          </LoadingButton>
        </div>
        </div>
      </div>
      <div class="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
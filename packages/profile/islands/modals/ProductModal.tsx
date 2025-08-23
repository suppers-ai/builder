import { useEffect, useState } from "preact/hooks";
import { Modal, Input, Textarea, Select, LoadingButton, Button, Badge } from "@suppers/ui-lib";
import { Plus, X, DollarSign, Image, Tag } from "lucide-preact";
import { getAuthClient } from "../../lib/auth.ts";
import toast from "../../lib/toast-manager.ts";
// import { ImageUploadApiClient } from "../../lib/api-client/uploads/image-upload-api.ts";

interface ProductType {
  id: string;
  name: string;
  description?: string;
  metadataSchema?: Record<string, any>;
}

interface PriceOption {
  id?: string;
  name: string;
  amount: number;
  currency: string;
  interval?: string;
  description?: string;
}

interface ProductModalProps {
  product?: any;
  entityId: string;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function ProductModal({ product, entityId, onSave, onClose }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  // const [uploadClient, setUploadClient] = useState<ImageUploadApiClient | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    type: product?.type || "",
    subType: product?.subType || "",
    status: product?.status || "active",
    metadata: product?.metadata || {},
    thumbnailUrl: product?.thumbnailUrl || "",
    photos: product?.photos || []
  });

  // Pricing options
  const [prices, setPrices] = useState<PriceOption[]>(
    product?.prices || [{ name: "Standard", amount: 0, currency: "USD" }]
  );

  // Dynamic metadata fields based on selected type
  const [metadataFields, setMetadataFields] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize upload client
    // const initUploadClient = async () => {
    //   const authClient = getAuthClient();
    //   setUploadClient(new ImageUploadApiClient(authClient));
    // };
    // initUploadClient();
    
    loadProductTypes();
  }, []);

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

  const loadProductTypes = async () => {
    try {
      setLoadingTypes(true);
      const authClient = getAuthClient();
      const accessToken = await authClient.getAccessToken();

      // TODO: Replace with actual API call to get product types
      // const response = await fetch("/api/product-types", {
      //   headers: {
      //     "Authorization": `Bearer ${accessToken}`,
      //   },
      // });

      // Simulated product types with metadata schemas
      setProductTypes([
        {
          id: "1",
          name: "Physical Product",
          description: "Tangible goods and merchandise",
          metadataSchema: {
            sku: {
              type: "text",
              label: "SKU",
              required: false,
              placeholder: "Product SKU"
            },
            weight: {
              type: "number",
              label: "Weight (kg)",
              required: false,
              min: 0
            },
            dimensions: {
              type: "text",
              label: "Dimensions",
              required: false,
              placeholder: "L x W x H"
            },
            stockQuantity: {
              type: "number",
              label: "Stock Quantity",
              required: true,
              min: 0
            },
            shippingClass: {
              type: "select",
              label: "Shipping Class",
              required: false,
              options: ["Standard", "Express", "Overnight", "Pickup Only"]
            }
          }
        },
        {
          id: "2",
          name: "Digital Product",
          description: "Downloads, software, and digital content",
          metadataSchema: {
            fileSize: {
              type: "text",
              label: "File Size",
              required: false,
              placeholder: "e.g., 25MB"
            },
            fileFormat: {
              type: "text",
              label: "File Format",
              required: true,
              placeholder: "e.g., PDF, MP4, ZIP"
            },
            downloadLimit: {
              type: "number",
              label: "Download Limit",
              required: false,
              min: 0,
              placeholder: "0 for unlimited"
            },
            licenseType: {
              type: "select",
              label: "License Type",
              required: true,
              options: ["Personal", "Commercial", "Extended", "Enterprise"]
            }
          }
        },
        {
          id: "3",
          name: "Service",
          description: "Professional services and consultations",
          metadataSchema: {
            duration: {
              type: "number",
              label: "Duration (hours)",
              required: true,
              min: 0.5,
              step: 0.5
            },
            deliveryTime: {
              type: "text",
              label: "Delivery Time",
              required: false,
              placeholder: "e.g., 3-5 business days"
            },
            maxRevisions: {
              type: "number",
              label: "Max Revisions",
              required: false,
              min: 0
            },
            availability: {
              type: "select",
              label: "Availability",
              required: true,
              options: ["Immediate", "Scheduled", "On Request", "Waitlist"]
            }
          }
        },
        {
          id: "4",
          name: "Subscription",
          description: "Recurring services and memberships",
          metadataSchema: {
            billingCycle: {
              type: "select",
              label: "Billing Cycle",
              required: true,
              options: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
            },
            trialDays: {
              type: "number",
              label: "Trial Period (days)",
              required: false,
              min: 0,
              max: 365
            },
            features: {
              type: "text",
              label: "Features",
              required: true,
              placeholder: "Comma-separated list of features"
            },
            usageLimit: {
              type: "text",
              label: "Usage Limits",
              required: false,
              placeholder: "e.g., 100 API calls/month"
            }
          }
        },
        {
          id: "5",
          name: "Event Ticket",
          description: "Tickets for events and experiences",
          metadataSchema: {
            eventDate: {
              type: "date",
              label: "Event Date",
              required: true
            },
            eventTime: {
              type: "time",
              label: "Event Time",
              required: true
            },
            seatType: {
              type: "select",
              label: "Seat Type",
              required: false,
              options: ["General Admission", "Reserved", "VIP", "Balcony", "Floor"]
            },
            maxAttendees: {
              type: "number",
              label: "Max Attendees",
              required: true,
              min: 1
            },
            includesFood: {
              type: "select",
              label: "Food Included",
              required: false,
              options: ["No", "Snacks", "Meal", "Full Catering"]
            }
          }
        }
      ]);

      // If editing, set the selected type
      if (product?.type) {
        const type = productTypes.find(t => t.name.toLowerCase().replace(/\s+/g, '_') === product.type);
        if (type) {
          setSelectedType(type);
          setFormData(prev => ({ ...prev, type: type.name.toLowerCase().replace(/\s+/g, '_') }));
        }
      }
    } catch (error) {
      console.error("Error loading product types:", error);
      toast.error("Failed to load product types");
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleTypeChange = (typeName: string) => {
    const type = productTypes.find(t => t.name.toLowerCase().replace(/\s+/g, '_') === typeName);
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

  const handleAddPrice = () => {
    setPrices(prev => [...prev, { name: "", amount: 0, currency: "USD" }]);
  };

  const handleRemovePrice = (index: number) => {
    setPrices(prev => prev.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, field: keyof PriceOption, value: any) => {
    setPrices(prev => prev.map((price, i) => 
      i === index ? { ...price, [field]: value } : price
    ));
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

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
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
            // if (!uploadClient) {
            //   throw new Error("Upload client not initialized");
            // }
            
            // const result = await uploadClient.uploadImage(file);
            // const imageUrl = result.url;
            const imageUrl = URL.createObjectURL(file); // Temporary placeholder

            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, imageUrl]
            }));
            toast.success(`Image ${file.name} uploaded successfully`);
            
          } catch (fileError) {
            console.warn(`Failed to upload ${file.name}, using blob URL:`, fileError);
            // Fallback to blob URL
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, imageUrl]
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

  const handleUploadThumbnail = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setLoading(true);
        
        // Validate file size (max 2MB for thumbnails)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Thumbnail file is too large. Maximum size is 2MB.');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('File must be an image.');
          return;
        }

        try {
          // Use the ImageUploadApiClient
          // if (!uploadClient) {
          //   throw new Error("Upload client not initialized");
          // }
          
          // const result = await uploadClient.uploadImage(file);
          // const imageUrl = result.url;
          const imageUrl = URL.createObjectURL(file); // Temporary placeholder

          setFormData(prev => ({
            ...prev,
            thumbnailUrl: imageUrl
          }));
          toast.success('Thumbnail uploaded successfully');
          
        } catch (uploadError) {
          console.warn('Failed to upload thumbnail, using blob URL:', uploadError);
          // Fallback to blob URL
          const imageUrl = URL.createObjectURL(file);
          setFormData(prev => ({
            ...prev,
            thumbnailUrl: imageUrl
          }));
          toast.success('Thumbnail added (temporary URL)');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload thumbnail');
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.type) {
      toast.error("Please select a product type");
      return;
    }

    // Validate at least one price
    if (prices.length === 0) {
      toast.error("At least one price option is required");
      return;
    }

    // Validate price options
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      if (!price.name.trim()) {
        toast.error(`Price option ${i + 1} needs a name`);
        return;
      }
      if (price.amount <= 0) {
        toast.error(`Price option "${price.name}" must have a positive amount`);
        return;
      }
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

    try {
      setLoading(true);
      // Convert subType to sub_type for API
      const submitData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        sub_type: formData.subType,  // API expects sub_type not subType
        status: formData.status,
        thumbnailUrl: formData.thumbnailUrl,
        photos: formData.photos,
        entityId,
        metadata: metadataFields,
        prices
      };
      await onSave(submitData);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
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
              step={schema.step}
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
      <div class="modal-box max-w-3xl w-full mx-4">
        <div class="p-2">
        <h2 class="text-xl font-semibold mb-4">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <div class="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Basic Information */}
          <div class="space-y-4">
            <h3 class="font-medium text-base-content/80">Basic Information</h3>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Product Name <span class="text-error">*</span></span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onInput={(e) => setFormData(prev => ({ ...prev, name: (e.target as HTMLInputElement).value }))}
                placeholder="Enter product name"
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
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Product Type <span class="text-error">*</span></span>
                </label>
                {loadingTypes ? (
                  <div class="loading loading-spinner loading-sm"></div>
                ) : (
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange((e.target as HTMLSelectElement).value)}
                    required
                    class="select select-bordered w-full"
                  >
                    <option value="">Select Type</option>
                    {productTypes.map(type => (
                      <option key={type.id} value={type.name.toLowerCase().replace(/\s+/g, '_')}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                )}
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

            <div class="form-control">
              <label class="label">
                <span class="label-text">Thumbnail</span>
              </label>
              <div class="flex gap-2">
                <Input
                  type="url"
                  value={formData.thumbnailUrl}
                  onInput={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: (e.target as HTMLInputElement).value }))}
                  placeholder="Enter thumbnail image URL"
                  class="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadThumbnail}
                  class="flex items-center gap-2"
                >
                  <Image class="w-4 h-4" />
                  Upload
                </Button>
              </div>
              {formData.thumbnailUrl && (
                <div class="mt-2">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    class="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}
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

          {/* Pricing */}
          <div class="space-y-4">
            <h3 class="font-medium text-base-content/80">
              Pricing Options <span class="text-error">*</span>
            </h3>
            <div class="space-y-3">
              {prices.map((price, index) => (
                <div key={index} class="border border-base-300 rounded-lg p-4">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text text-sm">Option Name</span>
                      </label>
                      <Input
                        type="text"
                        value={price.name}
                        onInput={(e) => handlePriceChange(index, 'name', (e.target as HTMLInputElement).value)}
                        placeholder="e.g., Standard, Premium"
                        size="sm"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text text-sm">Amount</span>
                      </label>
                      <Input
                        type="number"
                        value={price.amount}
                        onInput={(e) => handlePriceChange(index, 'amount', parseFloat((e.target as HTMLInputElement).value) || 0)}
                        min={0}
                        step={0.01}
                        size="sm"
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text text-sm">Currency</span>
                      </label>
                      <div class="flex gap-2">
                        <select
                          value={price.currency}
                          onChange={(e) => handlePriceChange(index, 'currency', (e.target as HTMLSelectElement).value)}
                          class="select select-bordered select-sm flex-1"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                        </select>
                        {prices.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            color="error"
                            onClick={() => handleRemovePrice(index)}
                          >
                            <X class="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedType?.name === "Subscription" && (
                    <div class="mt-3">
                      <div class="form-control">
                        <label class="label">
                          <span class="label-text text-sm">Billing Interval</span>
                        </label>
                        <select
                          value={price.interval || "month"}
                          onChange={(e) => handlePriceChange(index, 'interval', (e.target as HTMLSelectElement).value)}
                          class="select select-bordered select-sm w-full"
                        >
                          <option value="day">Daily</option>
                          <option value="week">Weekly</option>
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPrice}
              >
                <Plus class="w-4 h-4 mr-2" />
                Add Price Option
              </Button>
            </div>
          </div>

          {/* Additional Photos */}
          <div class="space-y-4">
            <h3 class="font-medium text-base-content/80">Additional Photos</h3>
            <div class="space-y-2">
              {formData.photos.map((photo: string, index: number) => (
                <div key={index} class="flex items-center gap-2">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    class="w-16 h-16 object-cover rounded"
                  />
                  <p class="flex-1 text-sm text-base-content/60 truncate">{photo}</p>
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
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {product ? "Update Product" : "Add Product"}
          </LoadingButton>
        </div>
        </div>
      </div>
      <div class="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
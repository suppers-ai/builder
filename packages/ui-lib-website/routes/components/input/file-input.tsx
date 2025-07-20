import { useState } from "preact/hooks";
import { FileInput } from "@suppers/ui-lib";

export default function FileInputPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setUploadStatus(`Selected ${files.length} file(s)`);
  };

  const simulateUpload = () => {
    if (selectedFiles.length === 0) return;

    setUploadStatus("Uploading...");

    // Simulate upload process
    setTimeout(() => {
      setUploadStatus(`Successfully uploaded ${selectedFiles.length} file(s)!`);
      setTimeout(() => {
        setUploadStatus("");
        setSelectedFiles([]);
      }, 3000);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>File Input Component</h1>
        <p>File upload input component with various styling options</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic File Inputs</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Default</label>
              <FileInput />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">With Border</label>
              <FileInput bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Ghost Style</label>
              <FileInput ghost />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Extra Small</label>
              <FileInput size="xs" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Small</label>
              <FileInput size="sm" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Medium (Default)</label>
              <FileInput size="md" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Large</label>
              <FileInput size="lg" bordered />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Primary</label>
              <FileInput color="primary" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Secondary</label>
              <FileInput color="secondary" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Accent</label>
              <FileInput color="accent" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Success</label>
              <FileInput color="success" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Warning</label>
              <FileInput color="warning" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Error</label>
              <FileInput color="error" bordered />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">File Type Restrictions</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Images Only</label>
              <FileInput accept="image/*" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Documents Only</label>
              <FileInput accept=".pdf,.doc,.docx,.txt" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Audio Files</label>
              <FileInput accept="audio/*" bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Video Files</label>
              <FileInput accept="video/*" bordered />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Multiple Files</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Single File</label>
              <FileInput multiple={false} bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Multiple Files</label>
              <FileInput multiple bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Multiple Images</label>
              <FileInput multiple accept="image/*" bordered />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Normal</label>
              <FileInput bordered />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Disabled</label>
              <FileInput disabled bordered />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive File Upload</h2>
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Upload Files</h2>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Choose files to upload</span>
                  </label>
                  <FileInput
                    multiple
                    bordered
                    color="primary"
                    onSelect={handleFileSelect}
                    onChange={(files) => console.log("Files changed:", files)}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div class="mt-4">
                    <h3 class="font-semibold mb-2">Selected Files:</h3>
                    <div class="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          class="flex justify-between items-center p-2 bg-base-200 rounded"
                        >
                          <div>
                            <span class="font-medium">{file.name}</span>
                            <span class="text-sm text-base-content/70 ml-2">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <div class="badge badge-outline">{file.type || "Unknown"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadStatus && (
                  <div class="alert alert-info mt-4">
                    <span>{uploadStatus}</span>
                  </div>
                )}

                <div class="card-actions justify-end mt-4">
                  <button
                    class="btn btn-primary"
                    disabled={selectedFiles.length === 0 || uploadStatus === "Uploading..."}
                    onClick={simulateUpload}
                  >
                    {uploadStatus === "Uploading..." ? "Uploading..." : "Upload Files"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Form Examples</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Profile Picture Upload</h2>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Choose profile picture</span>
                  </label>
                  <FileInput
                    accept="image/*"
                    bordered
                    color="secondary"
                    class="w-full max-w-xs"
                  />
                  <label class="label">
                    <span class="label-text-alt">PNG, JPG up to 5MB</span>
                  </label>
                </div>
                <div class="card-actions justify-end">
                  <button class="btn btn-secondary">Update Photo</button>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Document Upload</h2>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Upload documents</span>
                  </label>
                  <FileInput
                    accept=".pdf,.doc,.docx"
                    multiple
                    bordered
                    color="accent"
                    class="w-full max-w-xs"
                  />
                  <label class="label">
                    <span class="label-text-alt">PDF, DOC, DOCX files only</span>
                  </label>
                </div>
                <div class="card-actions justify-end">
                  <button class="btn btn-accent">Submit Documents</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Drag & Drop Area Simulation</h2>
          <div class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center">
            <div class="space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mx-auto h-16 w-16 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <h3 class="text-lg font-semibold">Drop files here</h3>
                <p class="text-base-content/70">or click to browse</p>
              </div>
              <FileInput
                multiple
                accept="*/*"
                bordered
                class="mt-4"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic File Input Display</code></pre>
                <pre data-prefix=">"><code>{'<FileInput bordered color="primary" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive File Input</code></pre>
                <pre data-prefix=">"><code>{'<FileInput multiple accept="image/*" onSelect={(files) => setFiles(files)} />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

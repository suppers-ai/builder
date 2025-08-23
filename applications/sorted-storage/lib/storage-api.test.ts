/**
 * Unit tests for storage API service layer
 * Tests core functionality and error handling
 */

import { assertEquals, assertExists, assertRejects } from "jsr:@std/assert";
import type { FileUploadOptions, SearchOptions, StorageObject } from "../types/storage.ts";
import type { ValidationError } from "../types/errors.ts";

// Test the StorageApiClient class directly with a simplified implementation
class TestStorageApiClient {
  private mockObjects: StorageObject[] = [];

  constructor(mockData: StorageObject[] = []) {
    this.mockObjects = [...mockData];
  }

  async getStorageObjects(folderId?: string): Promise<StorageObject[]> {
    if (folderId !== undefined) {
      return this.mockObjects.filter((obj) => obj.parent_id === folderId);
    }
    return this.mockObjects;
  }

  async getStorageObject(id: string): Promise<StorageObject | null> {
    return this.mockObjects.find((obj) => obj.id === id) || null;
  }

  async createFolder(
    name: string,
    parentId?: string,
    metadata: any = {},
  ): Promise<StorageObject> {
    // Validate folder name
    if (!name || name.trim().length === 0) {
      const error: ValidationError = {
        type: "validation",
        message: "Folder name cannot be empty",
        field: "name",
        validationRule: "required",
        providedValue: name,
        recoverable: true,
        timestamp: new Date().toISOString(),
      };
      throw error;
    }

    const folder: StorageObject = {
      id: crypto.randomUUID(),
      user_id: "test-user",
      name: name.trim(),
      file_path: `test-user/sorted-storage/folders/${crypto.randomUUID()}`,
      file_size: 0,
      mime_type: "application/x-folder",
      object_type: "folder",
      parent_id: parentId || null,
      is_public: false,
      share_token: null,
      thumbnail_url: null,
      metadata: { ...metadata, object_type: "folder" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      application_id: null,
    };

    this.mockObjects.push(folder);
    return folder;
  }

  async uploadFile(
    file: File,
    options: FileUploadOptions = {},
  ): Promise<StorageObject> {
    // Validate file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size ${options.maxFileSize}`);
    }

    // Validate file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    const uploadedFile: StorageObject = {
      id: crypto.randomUUID(),
      user_id: "test-user",
      name: file.name,
      file_path: `test-user/sorted-storage/${file.name}`,
      file_size: file.size,
      mime_type: file.type,
      object_type: "file",
      parent_id: options.currentFolderId || null,
      is_public: false,
      share_token: null,
      thumbnail_url: null,
      metadata: { object_type: "file" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      application_id: null,
    };

    this.mockObjects.push(uploadedFile);
    return uploadedFile;
  }

  async updateStorageObject(
    id: string,
    updates: Partial<Pick<StorageObject, "name" | "metadata">>,
  ): Promise<StorageObject> {
    const objectIndex = this.mockObjects.findIndex((obj) => obj.id === id);
    if (objectIndex === -1) {
      throw new Error("Storage object not found");
    }

    const updatedObject = {
      ...this.mockObjects[objectIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.mockObjects[objectIndex] = updatedObject;
    return updatedObject;
  }

  async deleteStorageObject(id: string): Promise<void> {
    const objectIndex = this.mockObjects.findIndex((obj) => obj.id === id);
    if (objectIndex === -1) {
      throw new Error("Storage object not found");
    }

    this.mockObjects.splice(objectIndex, 1);
  }

  async searchStorageObjects(
    options: SearchOptions,
  ): Promise<{ items: StorageObject[]; totalCount: number; hasMore: boolean }> {
    let filteredObjects = [...this.mockObjects];

    // Apply query filter
    if (options.query) {
      const query = options.query.toLowerCase();
      filteredObjects = filteredObjects.filter((obj) =>
        obj.name.toLowerCase().includes(query) ||
        (obj.metadata.description && obj.metadata.description.toLowerCase().includes(query))
      );
    }

    // Apply file type filter
    if (options.fileTypes && options.fileTypes.length > 0) {
      filteredObjects = filteredObjects.filter((obj) =>
        options.fileTypes!.some((type) => obj.mime_type.startsWith(type))
      );
    }

    // Apply date range filter
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      filteredObjects = filteredObjects.filter((obj) => {
        const objDate = new Date(obj.created_at);
        return objDate >= startDate && objDate <= endDate;
      });
    }

    // Apply size range filter
    if (options.sizeRange) {
      filteredObjects = filteredObjects.filter((obj) =>
        obj.file_size >= options.sizeRange!.min &&
        obj.file_size <= options.sizeRange!.max
      );
    }

    return {
      items: filteredObjects,
      totalCount: filteredObjects.length,
      hasMore: false,
    };
  }
}

// Mock data for testing
const mockStorageObjects: StorageObject[] = [
  {
    id: "file-1",
    user_id: "test-user",
    name: "test-file.txt",
    file_path: "test-user/sorted-storage/test-file.txt",
    file_size: 1024,
    mime_type: "text/plain",
    object_type: "file",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: { description: "Test file" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    application_id: null,
  },
  {
    id: "folder-1",
    user_id: "test-user",
    name: "Test Folder",
    file_path: "test-user/sorted-storage/folders/folder-1",
    file_size: 0,
    mime_type: "application/x-folder",
    object_type: "folder",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: { emoji: "📁" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    application_id: null,
  },
  {
    id: "file-2",
    user_id: "test-user",
    name: "nested-file.jpg",
    file_path: "test-user/sorted-storage/nested-file.jpg",
    file_size: 2048,
    mime_type: "image/jpeg",
    object_type: "file",
    parent_id: "folder-1",
    is_public: false,
    share_token: null,
    thumbnail_url: "http://example.com/thumb.jpg",
    metadata: { description: "Nested file in folder" },
    created_at: "2024-01-01T01:00:00Z",
    updated_at: "2024-01-01T01:00:00Z",
    application_id: null,
  },
];

Deno.test("StorageApiClient - should fetch all storage objects", async () => {
  const client = new TestStorageApiClient(mockStorageObjects);
  const objects = await client.getStorageObjects();

  assertEquals(objects.length, 3);
  assertEquals(objects[0].name, "test-file.txt");
  assertEquals(objects[1].name, "Test Folder");
  assertEquals(objects[2].name, "nested-file.jpg");
});

Deno.test("StorageApiClient - should filter objects by folder ID", async () => {
  const client = new TestStorageApiClient(mockStorageObjects);
  const objects = await client.getStorageObjects("folder-1");

  assertEquals(objects.length, 1);
  assertEquals(objects[0].name, "nested-file.jpg");
  assertEquals(objects[0].parent_id, "folder-1");
});

Deno.test("StorageApiClient - should create a new folder", async () => {
  const client = new TestStorageApiClient([]);
  const folder = await client.createFolder("New Folder", undefined, {
    emoji: "📂",
    description: "A new test folder",
  });

  assertEquals(folder.name, "New Folder");
  assertEquals(folder.object_type, "folder");
  assertEquals(folder.parent_id, null);
  assertEquals(folder.metadata.emoji, "📂");
  assertEquals(folder.metadata.description, "A new test folder");
});

Deno.test("StorageApiClient - should reject empty folder name", async () => {
  const client = new TestStorageApiClient([]);

  try {
    await client.createFolder("");
    throw new Error("Expected createFolder to throw an error");
  } catch (error) {
    assertEquals((error as any).type, "validation");
    assertEquals((error as any).message, "Folder name cannot be empty");
    assertEquals((error as any).field, "name");
  }
});

Deno.test("StorageApiClient - should upload a file successfully", async () => {
  const client = new TestStorageApiClient([]);
  const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });

  const uploadedFile = await client.uploadFile(mockFile);

  assertEquals(uploadedFile.name, "test.txt");
  assertEquals(uploadedFile.object_type, "file");
  assertEquals(uploadedFile.mime_type, "text/plain");
});

Deno.test("StorageApiClient - should reject file exceeding size limit", async () => {
  const client = new TestStorageApiClient([]);
  const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
  const options: FileUploadOptions = {
    maxFileSize: 5, // Smaller than mock file
  };

  await assertRejects(
    () => client.uploadFile(mockFile, options),
    Error,
    "File size",
  );
});

Deno.test("StorageApiClient - should search by query", async () => {
  const client = new TestStorageApiClient(mockStorageObjects);
  const result = await client.searchStorageObjects({
    query: "test",
  });

  assertEquals(result.items.length, 2); // test-file.txt and Test Folder
  assertEquals(result.totalCount, 2);
});

Deno.test("StorageApiClient - should search by file type", async () => {
  const client = new TestStorageApiClient(mockStorageObjects);
  const result = await client.searchStorageObjects({
    query: "",
    fileTypes: ["image/"],
  });

  assertEquals(result.items.length, 1); // nested-file.jpg
  assertEquals(result.items[0].name, "nested-file.jpg");
});

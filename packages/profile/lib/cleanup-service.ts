import { TokenManager } from "./token-manager.ts";

export class CleanupService {
  private static instance: CleanupService;
  private cleanupInterval: number | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  /**
   * Start the cleanup service
   */
  start(): void {
    if (this.cleanupInterval) {
      console.log("Cleanup service is already running");
      return;
    }

    console.log("Starting OAuth token cleanup service");

    // Run initial cleanup
    this.runCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("OAuth token cleanup service stopped");
    }
  }

  /**
   * Run cleanup manually
   */
  async runCleanup(): Promise<void> {
    try {
      await TokenManager.scheduleCleanup();
    } catch (error) {
      console.error("Cleanup service error:", error);
    }
  }

  /**
   * Get cleanup service status
   */
  getStatus(): { running: boolean; nextCleanup?: Date } {
    const running = this.cleanupInterval !== null;
    const nextCleanup = running ? new Date(Date.now() + this.CLEANUP_INTERVAL_MS) : undefined;

    return { running, nextCleanup };
  }
}

// Auto-start cleanup service when module is imported
if (import.meta.main) {
  const cleanupService = CleanupService.getInstance();
  cleanupService.start();

  // Graceful shutdown
  Deno.addSignalListener("SIGINT", () => {
    cleanupService.stop();
    Deno.exit(0);
  });

  Deno.addSignalListener("SIGTERM", () => {
    cleanupService.stop();
    Deno.exit(0);
  });
}

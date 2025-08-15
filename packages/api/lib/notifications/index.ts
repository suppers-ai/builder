import type { NotificationProvider, NotificationProviderConfig } from "./types.ts";
import { OneSignalEmailProvider } from "./providers/onesignal.ts";
import config from "../../../config.ts";

export class NotificationFactory {
  private static provider: NotificationProvider | null = null;

  static getProvider(): NotificationProvider {
    if (!this.provider) {
      this.provider = this.createProvider(config.notifications);
    }
    return this.provider;
  }

  private static createProvider(config: NotificationProviderConfig): NotificationProvider {
    switch (config.provider) {
      case 'onesignal':
        return new OneSignalEmailProvider(config.onesignal);
      default:
        throw new Error(`Unsupported notification provider: ${config.provider}`);
    }
  }

  static validateProviderConfig(config: NotificationProviderConfig): boolean {
    try {
      const provider = this.createProvider(config);
      return provider.validateConfig();
    } catch (error) {
      console.error('Provider validation failed:', error);
      return false;
    }
  }

  // Reset provider instance (useful for testing or config changes)
  static reset(): void {
    this.provider = null;
  }
}

export class ProviderRegistry {
  private static supportedProviders = ['onesignal'] as const;

  static getSupportedProviders(): readonly string[] {
    return this.supportedProviders;
  }

  static isProviderSupported(provider: string): boolean {
    return this.supportedProviders.includes(provider as any);
  }

  static getProviderInfo(provider: string): { name: string; type: string; description: string } | null {
    switch (provider) {
      case 'onesignal':
        return {
          name: 'OneSignal',
          type: 'email',
          description: 'Professional email delivery service with templates and analytics'
        };
      default:
        return null;
    }
  }
}

// Template processing utilities
export class TemplateProcessor {
  static processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;

    // Simple mustache-style template processing
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }

    // Handle conditionals {{#if key}}...{{/if}}
    processed = processed.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, key, content) => {
      return data[key] ? content : '';
    });

    return processed;
  }

  static extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const regex = /{{(\w+)}}/g;
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }
}

// Rate limiting utility
export class RateLimiter {
  private static attempts: Map<string, number[]> = new Map();

  static isAllowed(key: string, windowMs: number, maxAttempts: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing attempts for this key
    const attempts = this.attempts.get(key) || [];

    // Filter out old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);

    // Update the attempts array
    this.attempts.set(key, recentAttempts);

    // Check if we're within the limit
    return recentAttempts.length < maxAttempts;
  }

  static recordAttempt(key: string): void {
    const attempts = this.attempts.get(key) || [];
    attempts.push(Date.now());
    this.attempts.set(key, attempts);
  }

  static getRemainingAttempts(key: string, windowMs: number, maxAttempts: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;

    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);

    return Math.max(0, maxAttempts - recentAttempts.length);
  }

  static reset(key?: string): void {
    if (key) {
      this.attempts.delete(key);
    } else {
      this.attempts.clear();
    }
  }
}

// Exports
export * from "./types.ts";
export * from "./providers/base.ts";
export * from "./providers/onesignal.ts";
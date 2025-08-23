/**
 * Configuration module for API
 * Loads environment variables and provides typed configuration
 */

interface ApiConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  storage: {
    maxFileSize: number;
    defaultStorageLimit: number;
    defaultBandwidthLimit: number;
  };
  notifications: {
    provider: string;
    onesignal?: {
      appId: string;
      restApiKey: string;
    };
  };
  emailSharing: {
    defaultExpiryHours: number;
    rateLimit: number;
    maxRecipients: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  api: {
    version: string;
    basePath: string;
  };
  jwt: {
    secret: string;
    expiration: number;
  };
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
}

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: ApiConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private getEnv(key: string, defaultValue?: string): string {
    try {
      return Deno.env.get(key) || defaultValue || '';
    } catch {
      return defaultValue || '';
    }
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = this.getEnv(key);
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = this.getEnv(key)?.toLowerCase();
    if (!value) return defaultValue;
    return value === 'true' || value === '1' || value === 'yes';
  }

  private getEnvArray(key: string, defaultValue: string[] = []): string[] {
    const value = this.getEnv(key);
    if (!value) return defaultValue;
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }

  getConfig(): ApiConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  private loadConfig(): ApiConfig {
    const environment = this.getEnv('ENVIRONMENT', 'development') as ApiConfig['environment'];
    
    const config: ApiConfig = {
      supabase: {
        url: this.getEnv('SUPABASE_URL', 'http://localhost:54321'),
        anonKey: this.getEnv('SUPABASE_ANON_KEY', ''),
        serviceRoleKey: this.getEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
      },
      storage: {
        maxFileSize: this.getEnvNumber('MAX_FILE_SIZE', 52428800), // 50MB
        defaultStorageLimit: this.getEnvNumber('DEFAULT_STORAGE_LIMIT', 262144000), // 250MB
        defaultBandwidthLimit: this.getEnvNumber('DEFAULT_BANDWIDTH_LIMIT', 262144000), // 250MB
      },
      notifications: {
        provider: this.getEnv('NOTIFICATION_PROVIDER', 'onesignal'),
        onesignal: undefined,
      },
      emailSharing: {
        defaultExpiryHours: this.getEnvNumber('EMAIL_SHARING_DEFAULT_EXPIRY_HOURS', 168),
        rateLimit: this.getEnvNumber('EMAIL_SHARING_RATE_LIMIT', 10),
        maxRecipients: this.getEnvNumber('EMAIL_SHARING_MAX_RECIPIENTS', 20),
      },
      cors: {
        allowedOrigins: this.getEnvArray('CORS_ALLOWED_ORIGINS', [
          'http://localhost:8000',
          'http://localhost:8001',
          'http://localhost:8002',
          'http://localhost:8003',
          'http://localhost:8004',
          'http://localhost:8007',
          'http://localhost:8010',
          'http://localhost:8011',
          'http://localhost:8012',
          'http://localhost:8013',
        ]),
      },
      api: {
        version: this.getEnv('API_VERSION', 'v1'),
        basePath: this.getEnv('API_BASE_PATH', '/functions/v1'),
      },
      jwt: {
        secret: this.getEnv('JWT_SECRET', 'super-secret-jwt-token-with-at-least-32-characters-long'),
        expiration: this.getEnvNumber('JWT_EXPIRATION', 86400),
      },
      environment,
      debug: this.getEnvBoolean('DEBUG', environment === 'development'),
    };

    // Add OneSignal config if credentials are provided
    const onesignalAppId = this.getEnv('ONESIGNAL_APP_ID');
    const onesignalApiKey = this.getEnv('ONESIGNAL_REST_API_KEY');
    if (onesignalAppId && onesignalApiKey) {
      config.notifications.onesignal = {
        appId: onesignalAppId,
        restApiKey: onesignalApiKey,
      };
    }

    return config;
  }

  // Utility methods for common config access
  isProduction(): boolean {
    return this.getConfig().environment === 'production';
  }

  isDevelopment(): boolean {
    return this.getConfig().environment === 'development';
  }

  isDebug(): boolean {
    return this.getConfig().debug;
  }
}

// Export singleton instance
export const config = ConfigurationManager.getInstance().getConfig();
export const configManager = ConfigurationManager.getInstance();

// Export type for use in other modules
export type { ApiConfig };
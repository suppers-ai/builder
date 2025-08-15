import { BaseNotificationProvider } from "./base.ts";
import type { 
  NotificationMessage, 
  NotificationResult, 
  EmailMessage 
} from "../types.ts";

interface OneSignalConfig {
  apiKey: string;
  appId: string;
}

export class OneSignalEmailProvider extends BaseNotificationProvider {
  name = 'onesignal';
  type: 'email' = 'email';

  private config: OneSignalConfig;

  constructor(config: OneSignalConfig) {
    super(config);
    this.config = config;
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.appId);
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    try {
      const emailMessage = this.validateEmailMessage(message);
      this.validateEmailAddresses(emailMessage.to);

      const sanitizedHtml = this.sanitizeHtml(emailMessage.htmlBody);

      // OneSignal API call
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          include_email_tokens: emailMessage.to,
          email_subject: emailMessage.subject,
          email_body: sanitizedHtml,
          email_from_name: 'Suppers AI Builder',
          email_from_address: 'noreply@suppersai.com', // Configure this based on your domain
          template_id: undefined, // We're using custom HTML
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OneSignal API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();

      const result: NotificationResult = {
        success: true,
        messageId: responseData.id,
        details: responseData,
      };

      this.logSendAttempt(message, result);
      return result;

    } catch (error) {
      const result: NotificationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      };

      this.logSendAttempt(message, result);
      return result;
    }
  }

  // Helper method to check delivery status (for monitoring)
  async getDeliveryStatus(notificationId: string): Promise<any> {
    try {
      const response = await fetch(`https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${this.config.appId}`, {
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get delivery status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get OneSignal delivery status:', error);
      throw error;
    }
  }
}
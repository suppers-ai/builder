import type { 
  NotificationProvider, 
  NotificationMessage, 
  NotificationResult,
  EmailMessage 
} from "../types.ts";

export abstract class BaseNotificationProvider implements NotificationProvider {
  abstract name: string;
  abstract type: 'email' | 'sms' | 'push';

  constructor(protected config: Record<string, any>) {}

  abstract send(message: NotificationMessage): Promise<NotificationResult>;
  abstract validateConfig(): boolean;

  protected validateEmailMessage(message: NotificationMessage): EmailMessage {
    if (message.type !== 'email') {
      throw new Error(`Provider ${this.name} only supports email messages`);
    }

    const emailMessage = message as EmailMessage;
    
    if (!emailMessage.to || emailMessage.to.length === 0) {
      throw new Error('Email message must have at least one recipient');
    }

    if (!emailMessage.subject || !emailMessage.htmlBody) {
      throw new Error('Email message must have subject and htmlBody');
    }

    return emailMessage;
  }

  protected validateEmailAddresses(emails: string[]): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }

  protected sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  protected logSendAttempt(message: NotificationMessage, result: NotificationResult): void {
    console.log(`[${this.name}] Send attempt:`, {
      messageType: message.type,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  }
}
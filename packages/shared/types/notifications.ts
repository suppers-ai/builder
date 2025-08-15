// Notification system types

export interface NotificationProvider {
  name: string;
  type: 'email' | 'sms' | 'push';
  send(message: NotificationMessage): Promise<NotificationResult>;
  validateConfig(): boolean;
}

export interface NotificationMessage {
  id?: string;
  type: 'email' | 'sms' | 'push';
  createdAt?: Date;
}

export interface EmailMessage extends NotificationMessage {
  type: 'email';
  to: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
  replyTo?: string;
  templateData?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export interface EmailShareRequest {
  emails: string[];
  message?: string;
  expiresIn?: number; // hours
  allowDownload?: boolean;
}

export interface EmailShareResponse {
  success: boolean;
  sessionId: string;
  recipients: Array<{
    email: string;
    token: string;
    status: 'pending' | 'sent' | 'failed';
  }>;
  error?: string;
}

export interface NotificationProviderConfig {
  provider: 'onesignal';
  onesignal: {
    apiKey: string;
    appId: string;
  };
  emailSharing: {
    defaultExpiryHours: number;
    rateLimit: number;
    maxRecipients: number;
  };
}
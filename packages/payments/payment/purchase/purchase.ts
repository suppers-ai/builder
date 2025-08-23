export type PurchaseData = Record<string, any>;

export enum PurchaseStatus {
  pending = "pending",
  confirmed = "confirmed",
  declined = "declined",
  cancelled = "cancelled",
}

export interface IPaymentData {
  timestamp: number;
  paymentType: PaymentType;
  // will be stripe payment id for stripe payments
  paymentId: string;
}

export interface IPurchase {
  id: string;

  // the user that made the purchase
  userId: string;

  // the product that was purchased
  product: {
    id: string;
    // we use name to account for potential changes to the offering name
    // and to prevent an additional lookup
    name: string;

    // the currency of the purchase
    currency: string;
  };

  // the status of the purchase
  status: PurchaseStatus;

  // the payment data
  paymentData: IPaymentData;

  // we use data to be more flexible and allow for different types of purchases
  purchaseData: Record<string, any>;

  // If users are requesting any changes to the purchase, we store that data here
  modificationData?: ModificationData;

  // the cancellation data
  cancellationData?: CancellationData;

  // price lines
  billingItems: IBillingItem[];

  // if the purchase was deleted
  deleted?: boolean;

  // Date when the host approved the purchase
  approved?: {
    timestamp: number;
    // could be undefined if the host approved the purchase automatically
    // or be the admin user that approved the purchase
    userId?: string;
  };

  // the attribution data
  attribution?: Attribution;

  // Used to monitor updates
  verId: number;
}

export interface IBillingItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isTax?: boolean;
}

export interface CommissionData {
  percentage: number;
  // Not sure if we need this, can we also calculate this with stripe tax?
  taxes: ITax[];
}

export interface ITax {
  name: string;
  rate: number;
}

export interface ModificationData {
  timestamp: number;
  data: PurchaseData;
}

export enum PaymentType {
  stripe = "stripe",
  // will add future payments types for third party etc
}

export interface CancellationData {
  // the timestamp of the cancellation
  timestamp: number;

  // the policy that was applied to the cancellation
  policyId: string;

  // the amount that was refunded
  refundAmount: number;
}

// Any attribution data we use to track the source of the purchase
export interface Attribution {
  referral?: string;
}

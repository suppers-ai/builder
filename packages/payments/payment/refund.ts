export enum RefundType {
  percentage = "percentage",
  fixed = "fixed",
}

export interface Refund {
  type: RefundType;
  amount: number;
}

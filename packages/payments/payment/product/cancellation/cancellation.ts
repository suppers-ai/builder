import { Refund } from "../../refund.ts";

export interface ICancellationPolicy {
  id: string;
  name?: string;
  description?: string;
  policies: Record<string, CancellationPolicy>;
}

export interface CancellationPolicy {
  id: string;
  name?: string;
  description?: string;
  refund?: Refund;
  condition?: CancellationCondition;
}

export enum CancellationConditionType {
  // The cutoff time for the refund, in milliseconds
  cutoffTime = "cutoff-time",
}

export interface CancellationCondition {
  type: CancellationConditionType;
  value: number;
}

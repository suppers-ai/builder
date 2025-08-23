import { ISODateTimeLocal } from "../date.ts";

export type ParticipantType = string;

export interface IBookingPurchaseData {
  purchaseDate?: ISODateTimeLocal;
  participants?: IParticipantInfo[];
  units?: number;
}

export interface IParticipantInfo {
  age?: number;
}

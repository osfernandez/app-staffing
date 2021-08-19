export interface CardData {
  id: string;
  avatar: string;
  name: string;
  title: string;
  startDate: string;
  endDate: string;
  skills: {
    name: string;
  }[];
  available: boolean;
}

import { cardData } from "../mocks";

export async function getData(): Promise<CardData[]> {
  return cardData;
}

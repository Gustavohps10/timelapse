import { api } from "../lib/axios.js";

export type TimeEntriesRequest = {
  key?: string;
  userId?: number;
  initialDate: string;
  finalDate: string;
};

export type TimeEntry = {
  id: number;
  project: {
    id: number;
    name: string;
  };
  issue: {
    id: number;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
  hours: number;
  comments: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
};

export type TimeEntriesResponse = {
  time_entries: TimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
};

export async function TimeEntries({ key, userId, initialDate, finalDate }: TimeEntriesRequest) {
  const { data } = await api.get<TimeEntriesResponse>(
    "/projects/faturamento_erp/time_entries.json",
    {
      params: {
        key, 
        user_id: userId,
        from: initialDate,
        to: finalDate,
        limit: 100,
      },
    }
  );

  return data;
}

"use client";

import type {
  DecisionFilter,
  DecisionMode,
  FoodOption,
  HistoryEntry,
  OptionInput,
  VoteSession,
  VoteSessionInput,
} from "./types";
import type { OptionStat } from "./repo";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error || `请求失败 (${res.status})`);
  }
  return data;
}

export const api = {
  listOptions: (activeOnly = false) =>
    request<{ options: FoodOption[] }>(
      `/api/options${activeOnly ? "?active=true" : ""}`,
    ).then((d) => d.options),

  createOption: (input: OptionInput) =>
    request<{ option: FoodOption }>("/api/options", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((d) => d.option),

  updateOption: (id: number, input: OptionInput) =>
    request<{ option: FoodOption }>(`/api/options/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }).then((d) => d.option),

  deleteOption: (id: number) =>
    request<{ success: boolean }>(`/api/options/${id}`, { method: "DELETE" }),

  meta: () =>
    request<{ categories: string[]; tags: string[] }>("/api/meta"),

  pool: (filter: Partial<DecisionFilter>) =>
    request<{ options: FoodOption[] }>("/api/pool", {
      method: "POST",
      body: JSON.stringify({ filter }),
    }).then((d) => d.options),

  decide: (filter: Partial<DecisionFilter>, mode: DecisionMode, record = true) =>
    request<{ option: FoodOption }>("/api/decide", {
      method: "POST",
      body: JSON.stringify({ filter, mode, record }),
    }).then((d) => d.option),

  history: () =>
    request<{ history: HistoryEntry[]; topPicks: OptionStat[] }>(
      "/api/history",
    ),

  recordHistory: (optionId: number, mode: DecisionMode, note?: string) =>
    request("/api/history", {
      method: "POST",
      body: JSON.stringify({ optionId, mode, note }),
    }),

  clearHistory: () => request("/api/history", { method: "DELETE" }),

  listVoteSessions: () =>
    request<{ sessions: VoteSession[] }>("/api/vote").then((d) => d.sessions),

  createVoteSession: (input: VoteSessionInput) =>
    request<{ session: VoteSession }>("/api/vote", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((d) => d.session),

  getVoteSession: (id: string) =>
    request<{ session: VoteSession }>(`/api/vote/${id}`).then((d) => d.session),

  castVote: (id: string, candidateId: number, voter: string) =>
    request<{ session: VoteSession }>(`/api/vote/${id}`, {
      method: "POST",
      body: JSON.stringify({ candidateId, voter }),
    }).then((d) => d.session),

  closeVoteSession: (id: string) =>
    request<{ session: VoteSession }>(`/api/vote/${id}`, {
      method: "PATCH",
    }).then((d) => d.session),
};

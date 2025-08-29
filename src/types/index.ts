// src/types/index.ts
export type Group = {
  id: string;
  name: string;
  role: "admin" | "manager" | "member";
};

export type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string; // ISO string format
  groups: Group[];
};
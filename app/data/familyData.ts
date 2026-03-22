import { Person } from "../types/family";

export const initialFamily: Person[] = [
  // ── Generation 4 — Great-Grandparents ─────────────────────────────
  {
    id: "gg-1", firstName: "Buyut", lastName: "Kakung",
    generation: 4, gender: "male",
    dateOfBirth: "1905-03-10", isAlive: false,
    parents: [], spouses: ["gg-2"],
  },
  {
    id: "gg-2", firstName: "Buyut", lastName: "Putri",
    generation: 4, gender: "female",
    dateOfBirth: "1908-07-22", isAlive: false,
    parents: [], spouses: ["gg-1"],
  },

  // ── Generation 3 — Grandparents & Siblings ──────────────────────────
  {
    id: "gp-1", firstName: "Kakek", lastName: "Satu",
    generation: 3, gender: "male",
    dateOfBirth: "1930-04-12", isAlive: false,
    parents: ["gg-1", "gg-2"], spouses: ["gp-2"],
  },
  {
    id: "gp-2", firstName: "Nenek", lastName: "Satu",
    generation: 3, gender: "female",
    dateOfBirth: "1933-07-29", isAlive: false,
    parents: [], spouses: ["gp-1"],
  },
  {
    id: "gp-sibling-1", firstName: "Paman", lastName: "Kakek",
    generation: 3, gender: "male",
    dateOfBirth: "1935-08-14", isAlive: false,
    parents: ["gg-1", "gg-2"], spouses: [],
  },

  // ── Generation 2 — Parents & Uncles/Aunts ──────────────────────────
  {
    id: "p-1", firstName: "Ayah", lastName: "",
    generation: 2, gender: "male",
    dateOfBirth: "1960-03-22", isAlive: true,
    parents: ["gp-1", "gp-2"], spouses: ["p-2"],
  },
  {
    id: "p-2", firstName: "Ibu", lastName: "",
    generation: 2, gender: "female",
    dateOfBirth: "1963-11-08", isAlive: true,
    parents: [], spouses: ["p-1"],
  },
  {
    id: "uncle-1", firstName: "Paman", lastName: "Satu",
    generation: 2, gender: "male",
    dateOfBirth: "1965-05-11", isAlive: true,
    parents: ["gp-1", "gp-2"], spouses: [],
  },

  // ── Generation 1 — You & Siblings & Cousins ────────────────────────
  {
    id: "self", firstName: "Saya", lastName: "",
    generation: 1, gender: "male",
    dateOfBirth: "1990-06-15", isAlive: true,
    parents: ["p-1", "p-2"], spouses: [],
  },
  {
    id: "sibling-1", firstName: "Adik", lastName: "",
    generation: 1, gender: "female",
    dateOfBirth: "1994-09-20", isAlive: true,
    parents: ["p-1", "p-2"], spouses: [],
  },
];

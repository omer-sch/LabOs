// ─── Shared cycle test data module ───────────────────────────────────────────
// Used by detail page (TestChartsSection) and comparison page (CompareView).

export const TEST_COLORS = {
  "CT-2024-012": "#f472b6",
  "CT-2024-011": "#60a5fa",
  "CT-2024-010": "#34d399",
  "CT-2024-009": "#fbbf24",
  "CT-2024-008": "#a78bfa",
  "CT-2024-007": "#f87171",
} as const;

export type TestId = keyof typeof TEST_COLORS;

export const ALL_TEST_IDS = Object.keys(TEST_COLORS) as TestId[];

export const TEST_META: Record<
  TestId,
  {
    id: TestId;
    chemistry: string;
    cellId: string;
    cycles: number;
    retention: number;
    avgCE: number;
    q0: number;
    color: string;
    status: string;
  }
> = {
  "CT-2024-012": {
    id: "CT-2024-012", chemistry: "NCM-532", cellId: "BC-532-08",
    cycles: 62, retention: 88.7, avgCE: 99.4, q0: 2.134,
    color: "#f472b6", status: "running",
  },
  "CT-2024-011": {
    id: "CT-2024-011", chemistry: "NCM-532", cellId: "BC-532-07",
    cycles: 50, retention: 89.1, avgCE: 99.2, q0: 2.112,
    color: "#60a5fa", status: "complete",
  },
  "CT-2024-010": {
    id: "CT-2024-010", chemistry: "NCM-622", cellId: "BC-622-03",
    cycles: 75, retention: 84.3, avgCE: 99.1, q0: 2.241,
    color: "#34d399", status: "complete",
  },
  "CT-2024-009": {
    id: "CT-2024-009", chemistry: "NCM-622", cellId: "BC-622-02",
    cycles: 40, retention: 92.0, avgCE: 99.6, q0: 2.238,
    color: "#fbbf24", status: "complete",
  },
  "CT-2024-008": {
    id: "CT-2024-008", chemistry: "LFP", cellId: "BC-LFP-11",
    cycles: 120, retention: 96.2, avgCE: 99.8, q0: 1.842,
    color: "#a78bfa", status: "complete",
  },
  "CT-2024-007": {
    id: "CT-2024-007", chemistry: "LFP", cellId: "BC-LFP-10",
    cycles: 33, retention: 71.4, avgCE: 98.3, q0: 1.836,
    color: "#f87171", status: "flagged",
  },
};

// Per-test noise seeds — different sin/cos multipliers make curves visually distinct
const NOISE: Record<TestId, [number, number, number, number]> = {
  "CT-2024-012": [1.9, 0.7, 0.004, 0.003],
  "CT-2024-011": [1.7, 0.9, 0.004, 0.003],
  "CT-2024-010": [2.3, 1.1, 0.005, 0.004],
  "CT-2024-009": [0.8, 1.5, 0.003, 0.002],
  "CT-2024-008": [3.1, 0.7, 0.002, 0.002],
  "CT-2024-007": [1.2, 2.1, 0.010, 0.008], // flagged — more erratic
};

// Per-test linear decay rate: computed so last-cycle discharge ≈ q0 * retention
const DECAY: Record<TestId, number> = {
  "CT-2024-012": (2.134 * (1 - 0.887)) / 61,
  "CT-2024-011": (2.112 * (1 - 0.891)) / 49,
  "CT-2024-010": (2.241 * (1 - 0.843)) / 74,
  "CT-2024-009": (2.238 * (1 - 0.920)) / 39,
  "CT-2024-008": (1.842 * (1 - 0.962)) / 119,
  "CT-2024-007": (1.836 * (1 - 0.714)) / 32,
};

export type CapacityPoint = {
  cycle: number;
  discharge: number;
  charge: number;
  normalized: number; // (discharge / q0) * 100
};

export function genCapacityData(id: TestId): CapacityPoint[] {
  const { q0, cycles } = TEST_META[id];
  const decay = DECAY[id];
  const [sm, cm, sa, ca] = NOISE[id];
  const rows: CapacityPoint[] = [];
  for (let c = 1; c <= cycles; c++) {
    const noise = Math.sin(c * sm) * sa + Math.cos(c * cm) * ca;
    const discharge = +(q0 - decay * (c - 1) + noise).toFixed(4);
    const charge = +(discharge + 0.012 + Math.sin(c * 0.5) * 0.003).toFixed(4);
    rows.push({ cycle: c, discharge, charge, normalized: +(discharge / q0 * 100).toFixed(2) });
  }
  return rows;
}

export type CEPoint = { cycle: number; ce: number };

const CE_NOISE: Record<TestId, [number, number]> = {
  "CT-2024-012": [2.0, 1.4],
  "CT-2024-011": [2.1, 1.3],
  "CT-2024-010": [1.8, 1.6],
  "CT-2024-009": [2.3, 0.9],
  "CT-2024-008": [1.5, 2.2],
  "CT-2024-007": [3.1, 1.7], // flagged — noisier
};

export function genCEData(id: TestId): CEPoint[] {
  const { cycles, avgCE } = TEST_META[id];
  const [sm, cm] = CE_NOISE[id];
  const c1CE = id === "CT-2024-007" ? 79.8 : 83.5 + Math.sin(ALL_TEST_IDS.indexOf(id) * 1.3) * 1.5;
  const rows: CEPoint[] = [];
  for (let c = 1; c <= cycles; c++) {
    let ce: number;
    if (c === 1) ce = +c1CE.toFixed(3);
    else if (c === 2) ce = +(c1CE + (avgCE - c1CE) * 0.65).toFixed(3);
    else if (c === 3) ce = +(avgCE - 0.15).toFixed(3);
    else {
      // Flagged test shows more scatter and slight drift downward
      const drift = id === "CT-2024-007" ? -(c - 4) * 0.008 : 0;
      const noise = Math.sin(c * sm) * 0.08 + Math.cos(c * cm) * 0.06;
      ce = +(avgCE + noise + drift).toFixed(3);
    }
    rows.push({ cycle: c, ce });
  }
  return rows;
}

// ─── Comparison builders ──────────────────────────────────────────────────────

export type ComparisonCapacityRow = { cycle: number } & Partial<Record<TestId, number>>;

export function buildComparisonCapacityData(ids: TestId[]): ComparisonCapacityRow[] {
  if (ids.length === 0) return [];
  const maxC = Math.max(...ids.map((id) => TEST_META[id].cycles));
  const allData = Object.fromEntries(ids.map((id) => [id, genCapacityData(id)])) as Record<TestId, CapacityPoint[]>;
  return Array.from({ length: maxC }, (_, i) => {
    const cycle = i + 1;
    const row: ComparisonCapacityRow = { cycle };
    for (const id of ids) {
      if (cycle <= TEST_META[id].cycles) {
        row[id] = allData[id][i].normalized;
      }
    }
    return row;
  });
}

export type ComparisonCERow = { cycle: number } & Partial<Record<TestId, number>>;

export function buildComparisonCEData(ids: TestId[]): ComparisonCERow[] {
  if (ids.length === 0) return [];
  const maxC = Math.max(...ids.map((id) => TEST_META[id].cycles));
  const allData = Object.fromEntries(ids.map((id) => [id, genCEData(id)])) as Record<TestId, CEPoint[]>;
  // Start from cycle 2 — cycle 1 formation CE is an outlier that would collapse the y-axis
  return Array.from({ length: maxC - 1 }, (_, i) => {
    const cycle = i + 2;
    const row: ComparisonCERow = { cycle };
    for (const id of ids) {
      if (cycle <= TEST_META[id].cycles) {
        row[id] = allData[id][i + 1].ce;
      }
    }
    return row;
  });
}

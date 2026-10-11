import { z } from "zod";

import { Buffer } from "node:buffer";

export const stlSettingsSchema = z.object({
  materialId: z.enum(["pla", "petg", "abs", "asa", "tpu", "nylon", "peba"]),
  infillPct: z.number().finite().min(0).max(100),
  wallThicknessMm: z.number().finite().min(0.4).max(5),
  topBottomLayers: z.number().int().min(1).max(20),
  supportsPct: z.number().finite().min(0).max(50),
  multiColor: z.boolean(),
  numberOfColors: z.number().int().min(2).max(16),
});

export type StlSettings = z.infer<typeof stlSettingsSchema>;

export interface StlAnalysis {
  volumeMm3: number;
  areaMm2: number;
  bbox: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
  vertices: number[];
  triangles: number;
  format: "binary" | "ascii";
}

export interface StlEstimate {
  totalCost: number;
  costPerPrint: number;
  materialCost: number;
  electricityCost: number;
  modelGrams: number;
  supportGrams: number;
  purgeGrams: number;
  startupWaste: number;
  totalGrams: number;
  timeStr: string;
  materialName: string;
  infillPct: number;
  supportsPct: number;
}

export const materials = {
  pla: { name: "PLA", density: 1.24, pricePerKg: 20, markup: 10 },
  petg: { name: "PETG", density: 1.27, pricePerKg: 19, markup: 10 },
  abs: { name: "ABS", density: 1.04, pricePerKg: 21, markup: 10 },
  asa: { name: "ASA", density: 1.07, pricePerKg: 25, markup: 10 },
  tpu: { name: "TPU 95A", density: 1.21, pricePerKg: 28, markup: 10 },
  nylon: { name: "Nylon / PA", density: 1.14, pricePerKg: 45, markup: 10 },
  peba: { name: "PEBA", density: 1.12, pricePerKg: 80, markup: 1.5 },
} as const;

const PREVIEW_TRIANGLE_LIMIT = 20000;
const ELECTRICITY_RATE_PER_KWH = 0.15;
const PRINTER_POWER_WATTS = 150;
const AVERAGE_FLOW_MM3_PER_SEC = 8;
const STARTUP_WASTE_GRAMS = 2;

function signedVolume(a: number[], b: number[], c: number[]) {
  return (
    (a[0] * (b[1] * c[2] - b[2] * c[1]) +
      b[0] * (c[1] * a[2] - c[2] * a[1]) +
      c[0] * (a[1] * b[2] - a[2] * b[1])) /
    6
  );
}

function triangleArea(a: number[], b: number[], c: number[]) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const cross = [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];
  return Math.hypot(...cross) / 2;
}

function createAccumulator(
  triangleCount: number,
  format: StlAnalysis["format"],
) {
  const bbox = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
  const previewStride = Math.max(
    1,
    Math.ceil(triangleCount / PREVIEW_TRIANGLE_LIMIT),
  );
  const previewVertices: number[] = [];
  let volume = 0;
  let area = 0;
  let triangles = 0;

  return {
    add(a: number[], b: number[], c: number[]) {
      if (![...a, ...b, ...c].every(Number.isFinite)) {
        throw new Error("STL contains invalid vertex coordinates.");
      }

      volume += signedVolume(a, b, c);
      area += triangleArea(a, b, c);
      for (const [x, y, z] of [a, b, c]) {
        bbox.minX = Math.min(bbox.minX, x);
        bbox.minY = Math.min(bbox.minY, y);
        bbox.minZ = Math.min(bbox.minZ, z);
        bbox.maxX = Math.max(bbox.maxX, x);
        bbox.maxY = Math.max(bbox.maxY, y);
        bbox.maxZ = Math.max(bbox.maxZ, z);
      }
      if (triangles % previewStride === 0) {
        previewVertices.push(...a, ...b, ...c);
      }
      triangles++;
    },
    finish(): StlAnalysis {
      if (triangles === 0) {
        throw new Error("The STL file does not contain any triangles.");
      }
      return {
        volumeMm3: Math.abs(volume),
        areaMm2: area,
        bbox,
        vertices: previewVertices,
        triangles,
        format,
      };
    },
  };
}

function parseBinaryStl(buffer: Buffer): StlAnalysis {
  if (buffer.length < 84) throw new Error("File too small for binary STL.");
  const triangleCount = buffer.readUInt32LE(80);
  const expectedSize = 84 + triangleCount * 50;
  if (expectedSize !== buffer.length) {
    throw new Error("Binary STL has an invalid triangle count.");
  }

  const accumulator = createAccumulator(triangleCount, "binary");
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const offset = 84 + triangle * 50 + 12;
    const vertices: number[][] = [];
    for (let vertex = 0; vertex < 3; vertex++) {
      const vertexOffset = offset + vertex * 12;
      vertices.push([
        buffer.readFloatLE(vertexOffset),
        buffer.readFloatLE(vertexOffset + 4),
        buffer.readFloatLE(vertexOffset + 8),
      ]);
    }
    accumulator.add(vertices[0], vertices[1], vertices[2]);
  }
  return accumulator.finish();
}

function parseAsciiStl(text: string): StlAnalysis {
  const triangleCount = (text.match(/\bvertex\s+/gi)?.length ?? 0) / 3;
  if (!Number.isInteger(triangleCount) || triangleCount === 0) {
    throw new Error("ASCII STL does not contain valid triangles.");
  }

  const accumulator = createAccumulator(triangleCount, "ascii");
  const vertexPattern =
    /\bvertex\s+([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s+([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s+([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/gi;
  let pending: number[][] = [];
  let match: RegExpExecArray | null;

  while ((match = vertexPattern.exec(text)) !== null) {
    pending.push([Number(match[1]), Number(match[2]), Number(match[3])]);
    if (pending.length === 3) {
      accumulator.add(pending[0], pending[1], pending[2]);
      pending = [];
    }
  }
  if (pending.length !== 0) {
    throw new Error("ASCII STL contains an incomplete triangle.");
  }
  return accumulator.finish();
}

export function analyzeStl(buffer: Buffer): StlAnalysis {
  if (buffer.length < 1) throw new Error("The STL file is empty.");

  if (buffer.length >= 84) {
    const triangleCount = buffer.readUInt32LE(80);
    if (84 + triangleCount * 50 === buffer.length) {
      return parseBinaryStl(buffer);
    }
  }

  const text = new TextDecoder().decode(buffer);
  if (/\bfacet\s+normal\b/i.test(text) && /\bvertex\s+/i.test(text)) {
    return parseAsciiStl(text);
  }

  if (buffer.length >= 84) return parseBinaryStl(buffer);
  throw new Error("Unrecognized STL format.");
}

export function calculateStlEstimate(
  mesh: StlAnalysis,
  settings: StlSettings,
  quantity: number,
): StlEstimate {
  const material = materials[settings.materialId];
  const skinThickness = settings.topBottomLayers * 0.2;
  const wallVolume = mesh.areaMm2 * settings.wallThicknessMm;
  const skinVolume = mesh.areaMm2 * skinThickness * 0.35;
  const shellVolume = Math.min(wallVolume + skinVolume, mesh.volumeMm3 * 0.95);
  const interiorVolume = Math.max(0, mesh.volumeMm3 - shellVolume);
  const modelPrintedVolume =
    shellVolume + interiorVolume * (settings.infillPct / 100);
  const modelGrams = (modelPrintedVolume / 1000) * material.density;
  const supportGrams = modelGrams * (settings.supportsPct / 100);
  const purgeGrams = settings.multiColor
    ? Math.max(5, (settings.numberOfColors - 1) * 8)
    : 0;
  const totalGrams =
    modelGrams + supportGrams + purgeGrams + STARTUP_WASTE_GRAMS;
  const materialCost = totalGrams * (material.pricePerKg / 1000);
  const markedUpMaterialCost = materialCost * material.markup;
  const printedVolume =
    ((modelGrams + supportGrams + purgeGrams) / material.density) * 1000;
  const printTimeHours = printedVolume / AVERAGE_FLOW_MM3_PER_SEC / 3600;
  const billableHours = Math.max(1, Math.ceil(printTimeHours));
  const electricityCost =
    ((billableHours * PRINTER_POWER_WATTS) / 1000) * ELECTRICITY_RATE_PER_KWH;
  const hours = Math.floor(printTimeHours);
  const minutes = Math.round((printTimeHours - hours) * 60);

  return {
    totalCost: (markedUpMaterialCost + electricityCost) * quantity,
    costPerPrint: markedUpMaterialCost + electricityCost,
    materialCost,
    electricityCost,
    modelGrams,
    supportGrams,
    purgeGrams,
    startupWaste: STARTUP_WASTE_GRAMS,
    totalGrams,
    timeStr: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    materialName: material.name,
    infillPct: settings.infillPct,
    supportsPct: settings.supportsPct,
  };
}

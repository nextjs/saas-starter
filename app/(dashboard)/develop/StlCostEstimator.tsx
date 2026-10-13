"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { StlAnalysis, StlEstimate, StlSettings } from "@/lib/stl-estimate";

type MeshData = StlAnalysis;
type EstimateResult = StlEstimate;
type AuthStatus = "checking" | "signed-in" | "signed-out" | "error";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface QuoteToast {
  type: "success" | "error";
  message: string;
}

const MATERIAL_OPTIONS: { id: StlSettings["materialId"]; name: string }[] = [
  { id: "pla", name: "PLA" },
  { id: "petg", name: "PETG" },
  { id: "abs", name: "ABS" },
  { id: "asa", name: "ASA" },
  { id: "tpu", name: "TPU 95A" },
  { id: "nylon", name: "Nylon / PA" },
  { id: "peba", name: "PEBA" },
];

function StlModelViewer({ mesh }: { mesh: MeshData | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const cameraRef = useRef({
    rotationX: -0.65,
    rotationY: 0.7,
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const pointerRef = useRef({ x: 0, y: 0, pointerId: -1, panning: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !mesh) return;

    const camera = cameraRef.current;
    const centerX = (mesh.bbox.minX + mesh.bbox.maxX) / 2;
    const centerY = (mesh.bbox.minY + mesh.bbox.maxY) / 2;
    const centerZ = (mesh.bbox.minZ + mesh.bbox.maxZ) / 2;
    const largestDimension = Math.max(
      mesh.bbox.maxX - mesh.bbox.minX,
      mesh.bbox.maxY - mesh.bbox.minY,
      mesh.bbox.maxZ - mesh.bbox.minZ,
      1,
    );
    const triangleCount = Math.floor(mesh.vertices.length / 9);
    const previewTriangleCount = Math.min(triangleCount, 20000);
    const triangleStride = Math.max(
      1,
      Math.ceil(triangleCount / previewTriangleCount),
    );
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const render = () => {
      if (!width || !height) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const scale =
        (Math.min(width, height) * 0.72 * camera.zoom) / largestDimension;
      const cosX = Math.cos(camera.rotationX);
      const sinX = Math.sin(camera.rotationX);
      const cosY = Math.cos(camera.rotationY);
      const sinY = Math.sin(camera.rotationY);

      const project = (x: number, y: number, z: number) => {
        const centeredX = x - centerX;
        const centeredY = y - centerY;
        const centeredZ = z - centerZ;
        const rotatedY = centeredY * cosX - centeredZ * sinX;
        const rotatedZ = centeredY * sinX + centeredZ * cosX;
        const rotatedX = centeredX * cosY + rotatedZ * sinY;
        const depth = -centeredX * sinY + rotatedZ * cosY;
        return {
          x: width / 2 + camera.panX + rotatedX * scale,
          y: height / 2 + camera.panY - rotatedY * scale,
          depth,
        };
      };

      const faces: {
        points: ReturnType<typeof project>[];
        depth: number;
        shade: number;
      }[] = [];

      for (let face = 0; face < triangleCount; face += triangleStride) {
        const offset = face * 9;
        const ax = mesh.vertices[offset] - centerX;
        const ay = mesh.vertices[offset + 1] - centerY;
        const az = mesh.vertices[offset + 2] - centerZ;
        const bx = mesh.vertices[offset + 3] - centerX;
        const by = mesh.vertices[offset + 4] - centerY;
        const bz = mesh.vertices[offset + 5] - centerZ;
        const cx = mesh.vertices[offset + 6] - centerX;
        const cy = mesh.vertices[offset + 7] - centerY;
        const cz = mesh.vertices[offset + 8] - centerZ;
        const normalX = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const normalY = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const normalZ = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
        const rotatedNormalY = (normalY * cosX - normalZ * sinX) / normalLength;
        const rotatedNormalZ = (normalY * sinX + normalZ * cosX) / normalLength;
        const rotatedNormalX =
          (normalX * cosY + rotatedNormalZ * sinY) * normalLength;
        const finalNormalZ =
          (-normalX * sinY + rotatedNormalZ * cosY) * normalLength;
        const lightLength =
          Math.hypot(
            rotatedNormalX,
            rotatedNormalY * normalLength,
            finalNormalZ,
          ) || 1;
        const light = Math.abs(
          (rotatedNormalX * 0.35 +
            rotatedNormalY * normalLength * 0.65 +
            finalNormalZ * 0.68) /
            lightLength,
        );
        const points = [
          project(
            mesh.vertices[offset],
            mesh.vertices[offset + 1],
            mesh.vertices[offset + 2],
          ),
          project(
            mesh.vertices[offset + 3],
            mesh.vertices[offset + 4],
            mesh.vertices[offset + 5],
          ),
          project(
            mesh.vertices[offset + 6],
            mesh.vertices[offset + 7],
            mesh.vertices[offset + 8],
          ),
        ];
        faces.push({
          points,
          depth: (points[0].depth + points[1].depth + points[2].depth) / 3,
          shade: 0.38 + light * 0.52,
        });
      }

      faces.sort((a, b) => a.depth - b.depth);
      for (const face of faces) {
        context.beginPath();
        context.moveTo(face.points[0].x, face.points[0].y);
        context.lineTo(face.points[1].x, face.points[1].y);
        context.lineTo(face.points[2].x, face.points[2].y);
        context.closePath();
        context.fillStyle = `rgb(${Math.round(50 + 42 * face.shade)}, ${Math.round(105 + 77 * face.shade)}, ${Math.round(180 + 65 * face.shade)})`;
        context.fill();
      }
    };

    renderRef.current = render;
    const resizeObserver = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      pixelRatio = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      render();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      renderRef.current = null;
    };
  }, [mesh]);

  const zoom = (factor: number) => {
    const camera = cameraRef.current;
    camera.zoom = Math.min(8, Math.max(0.25, camera.zoom * factor));
    renderRef.current?.();
  };

  const resetView = () => {
    Object.assign(cameraRef.current, {
      rotationX: -0.65,
      rotationY: 0.7,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
    renderRef.current?.();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      panning: event.button === 2 || event.shiftKey,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    if (pointer.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (pointer.panning) {
      cameraRef.current.panX += deltaX;
      cameraRef.current.panY += deltaY;
    } else {
      cameraRef.current.rotationY += deltaX * 0.01;
      cameraRef.current.rotationX += deltaY * 0.01;
    }
    renderRef.current?.();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerRef.current.pointerId = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <Card className="mb-6 gap-4 p-5">
      <h2 className="border-b pb-2 text-base font-semibold">
        3D Model Preview
      </h2>
      {mesh ? (
        <>
          <canvas
            ref={canvasRef}
            aria-label="Interactive 3D preview of the uploaded STL model"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(event) => event.preventDefault()}
            onWheel={(event) => {
              event.preventDefault();
              zoom(event.deltaY < 0 ? 1.1 : 1 / 1.1);
            }}
            className="block h-[280px] w-full touch-none cursor-grab rounded-md border bg-muted"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Zoom in"
              onClick={() => zoom(1.2)}
            >
              +
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Zoom out"
              onClick={() => zoom(1 / 1.2)}
            >
              −
            </Button>
            <Button type="button" variant="outline" onClick={resetView}>
              Reset view
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">
              Drag to rotate · Shift-drag or right-drag to pan · Scroll to zoom
            </span>
          </div>
          {mesh.triangles > 20000 && (
            <p className="mt-3 text-sm text-muted-foreground">
              The preview is simplified for performance; analysis uses all{" "}
              {mesh.triangles.toLocaleString()} triangles.
            </p>
          )}
        </>
      ) : (
        <div className="grid h-[280px] place-items-center rounded-md border bg-muted text-muted-foreground">
          Upload an STL to preview your model.
        </div>
      )}
    </Card>
  );
}

export default function StlCostEstimator() {
  const [mesh, setMesh] = useState<MeshData | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const [materialId, setMaterialId] =
    useState<StlSettings["materialId"]>("pla");
  const [infill, setInfill] = useState(20);
  const [wallThickness, setWallThickness] = useState(1.2);
  const [topBottomLayers, setTopBottomLayers] = useState(4);
  const [supportsPct, setSupportsPct] = useState(15);
  const [multiColor, setMultiColor] = useState(false);
  const [numColors, setNumColors] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [requestedByDate, setRequestedByDate] = useState("");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteToast, setQuoteToast] = useState<QuoteToast | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const [result, setResult] = useState<EstimateResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quoteToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Unable to check sign-in status.");
        }
        const session = (await response.json()) as { user?: unknown };
        if (!cancelled) {
          setAuthStatus(session.user ? "signed-in" : "signed-out");
        }
      } catch {
        if (!cancelled) setAuthStatus("error");
      }
    };

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const showQuoteToast = (toast: QuoteToast) => {
    if (quoteToastTimeoutRef.current) {
      clearTimeout(quoteToastTimeoutRef.current);
    }
    setQuoteToast(toast);
    quoteToastTimeoutRef.current = setTimeout(() => {
      setQuoteToast(null);
      quoteToastTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    if (!stlFile) {
      setEstimateLoading(false);
      setMesh(null);
      setResult(null);
      return;
    }

    const controller = new AbortController();
    const estimate = async () => {
      setEstimateLoading(true);
      setResult(null);
      setFileError("");
      const form = new FormData();
      form.set("stl", stlFile, stlFile.name);
      form.set(
        "settings",
        JSON.stringify({
          materialId,
          infillPct: infill,
          wallThicknessMm: wallThickness,
          topBottomLayers,
          supportsPct,
          multiColor,
          numberOfColors: numColors,
        } satisfies StlSettings),
      );
      form.set("quantity", String(quantity));

      try {
        const response = await fetch("/api/quotes/estimate", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        const body = (await response.json()) as {
          mesh?: MeshData;
          estimate?: EstimateResult;
          error?: string;
        };
        if (!response.ok || !body.mesh || !body.estimate) {
          throw new Error(body.error ?? "Unable to calculate the estimate.");
        }
        setMesh(body.mesh);
        setResult(body.estimate);
        setFileInfo(
          `${stlFile.name} • ${(stlFile.size / 1024).toFixed(0)} KB • ${body.mesh.triangles.toLocaleString()} triangles`,
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setMesh(null);
        setResult(null);
        setFileError(
          error instanceof Error
            ? error.message
            : "Unable to calculate the estimate.",
        );
      } finally {
        if (!controller.signal.aborted) setEstimateLoading(false);
      }
    };

    void estimate();
    return () => controller.abort();
  }, [
    stlFile,
    materialId,
    infill,
    wallThickness,
    topBottomLayers,
    supportsPct,
    multiColor,
    numColors,
    quantity,
  ]);

  useEffect(
    () => () => {
      if (quoteToastTimeoutRef.current) {
        clearTimeout(quoteToastTimeoutRef.current);
      }
    },
    [],
  );

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".stl")) {
      setFileError("Please upload an STL file.");
      setStlFile(null);
      setFileInfo("");
      setMesh(null);
      setResult(null);
      return;
    }
    if (file.size === 0 || file.size > 20 * 1024 * 1024) {
      setFileError("STL files must be between 1 byte and 20 MB.");
      setStlFile(null);
      setFileInfo("");
      return;
    }
    setFileError("");
    setFileInfo(
      `Loading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`,
    );
    setMesh(null);
    setResult(null);
    setStlFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const submitQuote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authStatus !== "signed-in") return;
    if (!mesh || !stlFile || !result) return;
    if (!projectName.trim() || !requestedByDate) return;

    if (stlFile.size > 20 * 1024 * 1024) {
      showQuoteToast({
        type: "error",
        message: "The STL file must be 20 MB or smaller to submit a quote.",
      });
      return;
    }
    setQuoteSubmitting(true);
    setQuoteSubmitting(true);
    try {
      const form = new FormData();
      form.set(
        "quote",
        JSON.stringify({
          projectName,
          requestedByDate,
          settings: {
            materialId,
            infillPct: infill,
            wallThicknessMm: wallThickness,
            topBottomLayers,
            supportsPct,
            multiColor,
            numberOfColors: numColors,
          },
          quantity,
        }),
      );
      form.set("stl", stlFile, stlFile.name);

      const response = await fetch("/api/quotes", {
        method: "POST",
        body: form,
      });
      const responseBody: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Unable to submit the quote request.",
        );
      }

      setProjectName("");
      setRequestedByDate("");
      setStlFile(null);
      setFileInfo("");
      setFileError("");
      setMesh(null);
      setResult(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showQuoteToast({
        type: "success",
        message: "Quote request sent. We’ll be in touch soon.",
      });
    } catch (error) {
      showQuoteToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit the quote request. Please try again.",
      });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const dx = mesh ? mesh.bbox.maxX - mesh.bbox.minX : 0;
  const dy = mesh ? mesh.bbox.maxY - mesh.bbox.minY : 0;
  const dz = mesh ? mesh.bbox.maxZ - mesh.bbox.minZ : 0;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="mb-1 text-3xl font-bold tracking-tight">
            Get Estimate
          </h1>
          <p className="text-muted-foreground">
            Upload an STL → get an instant estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Card className="gap-4 p-5">
              <h2 className="mb-4 border-b pb-2 text-base font-semibold">
                1. Upload STL
              </h2>
              <div
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-accent/50 ${
                  dragOver ? "border-primary bg-accent/50" : "border-border"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <p className="font-medium">
                  📁 Drop STL file here or click to browse
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Binary or ASCII • Files up to 20 MB can be attached to quote
                  requests
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl"
                  className="sr-only"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
              </div>
              {fileInfo && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {fileInfo}
                </div>
              )}
              {fileError && (
                <div className="mt-2 text-sm text-destructive">{fileError}</div>
              )}
            </Card>

            <Card className="mt-6 gap-3 p-5">
              <h2 className="mb-4 border-b pb-2 text-base font-semibold">
                2. Material & Settings
              </h2>

              <label className="mb-1 mt-3 block text-sm font-medium">
                Material
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={materialId}
                onChange={(e) => {
                  const material = MATERIAL_OPTIONS.find(
                    (option) => option.id === e.target.value,
                  );
                  if (material) setMaterialId(material.id);
                }}
              >
                {MATERIAL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <label className="mb-1 mt-3 block text-sm font-medium">
                Infill (%)
              </label>
              <input
                type="range"
                className="h-4 w-full accent-primary"
                min={0}
                max={100}
                value={infill}
                onChange={(e) => setInfill(Number(e.target.value))}
              />
              <div className="text-right text-sm text-muted-foreground">
                {infill}%
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 mt-3 block text-sm font-medium">
                    Wall thickness (mm)
                  </label>
                  <Input
                    type="number"
                    className="w-full"
                    value={wallThickness}
                    step={0.1}
                    min={0.4}
                    max={5}
                    onChange={(e) => setWallThickness(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1 mt-3 block text-sm font-medium">
                    Top/Bottom layers
                  </label>
                  <Input
                    type="number"
                    className="w-full"
                    value={topBottomLayers}
                    step={1}
                    min={1}
                    max={20}
                    onChange={(e) => setTopBottomLayers(Number(e.target.value))}
                  />
                </div>
              </div>

              <label className="mb-1 mt-3 block text-sm font-medium">
                Supports extra material (%)
              </label>
              <input
                type="range"
                className="h-4 w-full accent-primary"
                min={0}
                max={50}
                value={supportsPct}
                onChange={(e) => setSupportsPct(Number(e.target.value))}
              />
              <div className="text-right text-sm text-muted-foreground">
                {supportsPct}% of model
              </div>

              <label className="mb-1 mt-3 block text-sm font-medium">
                Number of colors / materials
              </label>
              <Input
                type="number"
                className="w-full"
                value={numColors}
                min={2}
                max={16}
                step={1}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setNumColors(n);
                }}
              />

              {multiColor && (
                <div className="mt-3 rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    Purge material is estimated automatically from the color
                    count.
                  </p>
                </div>
              )}

              <label
                htmlFor="print-quantity"
                className="mb-1 mt-3 block text-sm font-medium"
              >
                Quantity
              </label>
              <Input
                id="print-quantity"
                type="number"
                min={1}
                max={10000}
                step={1}
                value={quantity}
                onChange={(e) => {
                  const nextQuantity = Math.floor(Number(e.target.value));
                  setQuantity(
                    Number.isFinite(nextQuantity)
                      ? Math.min(10000, Math.max(1, nextQuantity))
                      : 1,
                  );
                }}
              />
              {estimateLoading && (
                <p
                  className="mt-4 text-center text-sm text-muted-foreground"
                  role="status"
                >
                  Calculating estimate on the server…
                </p>
              )}
            </Card>
          </div>

          <div>
            <StlModelViewer mesh={mesh} />
            <Card className="gap-3 p-5">
              <h2 className="mb-4 border-b pb-2 text-base font-semibold">
                Model Analysis
              </h2>
              {mesh ? (
                <>
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">Solid volume</span>
                    <span className="font-semibold tabular-nums">
                      {(mesh.volumeMm3 / 1000).toFixed(2)} cm³
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">Surface area</span>
                    <span className="font-semibold tabular-nums">
                      {(mesh.areaMm2 / 100).toFixed(1)} cm²
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">
                      Dimensions (X×Y×Z)
                    </span>
                    <span className="font-semibold tabular-nums">
                      {dx.toFixed(1)} × {dy.toFixed(1)} × {dz.toFixed(1)} mm
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">Triangles</span>
                    <span className="font-semibold tabular-nums">
                      {mesh.triangles.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-semibold tabular-nums">
                      {mesh.format.toUpperCase()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Upload an STL to see volume, surface area, and dimensions.
                </p>
              )}
            </Card>

            {result && (
              <Card className="mt-6 gap-3 p-5">
                <h2 className="mb-4 border-b pb-2 text-base font-semibold">
                  Cost Estimate
                </h2>
                <div className="my-4 text-center text-3xl font-bold tabular-nums text-primary">
                  ${result.totalCost.toFixed(2)}
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-semibold tabular-nums">{quantity}</span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">
                    Estimated print time
                  </span>
                  <span className="font-semibold tabular-nums">
                    {result.timeStr}
                  </span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">
                    Model material (shell + infill)
                  </span>
                  <span className="font-semibold tabular-nums">
                    {result.modelGrams.toFixed(1)} g
                  </span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">
                    Supports ({result.supportsPct}%)
                  </span>
                  <span className="font-semibold tabular-nums">
                    {result.supportGrams.toFixed(1)} g
                  </span>
                </div>
                {result.purgeGrams > 0 && (
                  <div className="flex justify-between border-b py-2 last:border-0">
                    <span className="text-muted-foreground">
                      Purge / prime tower
                    </span>
                    <span className="font-semibold tabular-nums">
                      {result.purgeGrams.toFixed(1)} g
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">Startup / waste</span>
                  <span className="font-semibold tabular-nums">
                    {result.startupWaste.toFixed(1)} g
                  </span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">
                    <strong>Total filament</strong>
                  </span>
                  <span className="font-semibold tabular-nums">
                    <strong>{result.totalGrams.toFixed(1)} g</strong>
                  </span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">Infill</span>
                  <span className="font-semibold tabular-nums">
                    {result.infillPct}%
                  </span>
                </div>
                <div className="flex justify-between border-b py-2 last:border-0">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-semibold tabular-nums">
                    {result.materialName}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  This is an approximation based on solid volume + shell/infill
                  model + supports + purge + estimated print time and
                  electricity. Actual filament usage and time are best
                  determined by slicing the model. Watertightness and
                  orientation affect real results.
                </p>
                <form
                  onSubmit={submitQuote}
                  className="mt-4 space-y-3 border-t pt-4"
                >
                  <h3 className="font-semibold">Request a quote</h3>
                  <div>
                    <label
                      htmlFor="quote-project-name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Project Name
                    </label>
                    <Input
                      id="quote-project-name"
                      autoComplete="off"
                      maxLength={120}
                      required
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quote-requested-by-date"
                      className="mb-1 block text-sm font-medium"
                    >
                      When do you need the prints?
                    </label>
                    <Input
                      id="quote-requested-by-date"
                      type="date"
                      required
                      min={getLocalDateString(new Date())}
                      value={requestedByDate}
                      onChange={(event) =>
                        setRequestedByDate(event.target.value)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We’ll use the name and email address from your signed-in
                    account.
                  </p>
                  {authStatus === "signed-out" && (
                    <p className="text-sm text-muted-foreground">
                      <Link
                        href="/sign-in"
                        className="font-medium text-primary underline"
                      >
                        Sign in
                      </Link>{" "}
                      to submit a quote request.
                    </p>
                  )}
                  {authStatus === "checking" && (
                    <p className="text-sm text-muted-foreground" role="status">
                      Checking sign-in status…
                    </p>
                  )}
                  {authStatus === "error" && (
                    <p className="text-sm text-destructive" role="alert">
                      Unable to check sign-in status. Refresh the page and try
                      again.
                    </p>
                  )}
                  {stlFile && stlFile.size > 20 * 1024 * 1024 && (
                    <p className="text-sm text-destructive" role="alert">
                      This STL is over 20 MB and cannot be attached to a quote
                      request.
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={
                      authStatus !== "signed-in" ||
                      quoteSubmitting ||
                      !stlFile ||
                      stlFile.size > 20 * 1024 * 1024 ||
                      !projectName.trim() ||
                      !requestedByDate
                    }
                  >
                    {quoteSubmitting
                      ? "Sending quote request…"
                      : "Submit quote request"}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>

        <footer className="pt-4 text-center text-sm text-muted-foreground">
          Your STL is processed on our server to calculate the estimate and
          emailed to our quotes team only when you submit a quote request.
          Estimates are approximate.
        </footer>
      </div>
      {quoteToast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border bg-background px-4 py-3 text-sm shadow-lg ${
            quoteToast.type === "success"
              ? "border-primary text-foreground"
              : "border-destructive text-destructive"
          }`}
          role={quoteToast.type === "error" ? "alert" : "status"}
          aria-live={quoteToast.type === "error" ? "assertive" : "polite"}
        >
          {quoteToast.message}
        </div>
      )}
    </div>
  );
}

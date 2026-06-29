"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileCheck2,
  FileImage,
  Loader2,
  MonitorUp,
  ScanText,
  ShieldCheck,
  Upload
} from "lucide-react";
import { track } from "@vercel/analytics/react";

type ParseState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      copied: boolean;
      data: {
        result: {
          plate: string;
          statusSuggestion: string;
          confidenceLevel: string;
          confidenceScore: number;
          summary: string;
          alerts: string[];
          fieldRows: Array<{ label: string; value: string }>;
          sellerScript: string;
          reportNotes: string[];
        };
        savedSource?: unknown;
        savedOperatorEvidence?: unknown;
      };
    }
  | { status: "error"; message: string };

type OcrState =
  | { status: "idle" }
  | { status: "reading"; fileName: string; progress: number }
  | { status: "success"; fileName: string; progress: number }
  | { status: "error"; fileName?: string; message: string };

type OcrProgressMessage = {
  status?: string;
  progress?: number;
};

type ImageInputSource = "upload" | "drop" | "paste";

function cleanPlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function statusLabel(value: string) {
  if (value === "consulted_no_alert") {
    return "Sin deuda visible";
  }

  if (value === "consulted_with_alert") {
    return "Con observacion";
  }

  return "Revisar evidencia";
}

function imageFileName(file: File, source: ImageInputSource) {
  if (file.name.trim()) {
    return file.name;
  }

  if (source === "paste") {
    return "sat-screenshot-pegado.png";
  }

  if (source === "drop") {
    return "sat-captura-arrastrada.png";
  }

  return "captura-sat.png";
}

function looksLikeSatEvidence(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  return (
    value.trim().length >= 20 &&
    /(SAT|PAPELETA|MULTA|DEUDA|PLACA|CAPTURA|INFRACCION|REGISTRO)/.test(normalized)
  );
}

export function SatCopilot({
  initialPlate = "5075cd",
  sourceResultId
}: {
  initialPlate?: string;
  sourceResultId?: string;
}) {
  const [plate, setPlate] = useState(initialPlate);
  const [rawText, setRawText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [state, setState] = useState<ParseState>({ status: "idle" });
  const [ocrState, setOcrState] = useState<OcrState>({ status: "idle" });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const normalizedPlate = useMemo(() => cleanPlate(plate), [plate]);
  const officialUrl = "https://www.sat.gob.pe/VirtualSAT/modulos/papeletas.aspx";
  const imageInputDisabled = ocrState.status === "reading" || state.status === "loading";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPlate = params.get("placa");
    if (queryPlate) {
      setPlate(queryPlate);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function copyPlate() {
    await navigator.clipboard.writeText(normalizedPlate);
  }

  const submitEvidence = useCallback(async (textToAnalyze = rawText) => {
    const evidence = textToAnalyze.trim();

    if (evidence.length < 20) {
      setState({
        status: "error",
        message: "Necesito la tabla, texto o captura OCR del resultado SAT."
      });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/operator/sat/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: normalizedPlate,
          rawText: evidence,
          evidenceUrl,
          sourceResultId
        })
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        const firstIssue = data.issues
          ? Object.values(data.issues).flat().filter(Boolean)[0]
          : undefined;
        setState({
          status: "error",
          message:
            typeof firstIssue === "string"
              ? firstIssue
              : data.error ?? "No se pudo analizar."
        });
        return;
      }

      track("operator_sat_parsed", {
        status: data.result.statusSuggestion,
        confidence: data.result.confidenceScore
      });
      setPlate(data.result.plate);
      setState({ status: "success", data, copied: false });
      window.dispatchEvent(
        new CustomEvent("operator-evidence-saved", {
          detail: {
            plate: data.result.plate,
            sourceId: data.result.sourceId
          }
        })
      );
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor."
      });
    }
  }, [evidenceUrl, normalizedPlate, rawText, sourceResultId]);

  async function analyzeEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitEvidence();
  }

  async function handleEvidencePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const evidence = html.includes("<table") ? html : text;

    if (!looksLikeSatEvidence(evidence)) {
      return;
    }

    event.preventDefault();
    setRawText(evidence);
    await submitEvidence(evidence);
  }

  const processImageFile = useCallback(async (file: File, source: ImageInputSource) => {
    const fileName = imageFileName(file, source);

    if (imageInputDisabled) {
      setOcrState({
        status: "error",
        fileName,
        message: "Espera a que termine el OCR actual antes de cargar otra captura."
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setOcrState({
        status: "error",
        fileName,
        message: "El archivo debe ser una imagen PNG, JPG o captura compatible."
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return previewUrl;
    });
    setState({ status: "idle" });
    setOcrState({ status: "reading", fileName, progress: 0 });

    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng", {
        logger: (message: OcrProgressMessage) => {
          if (message.status === "recognizing text" && typeof message.progress === "number") {
            setOcrState({
              status: "reading",
              fileName,
              progress: Math.round(message.progress * 100)
            });
          }
        }
      });
      const extractedText = result.data.text.trim();

      if (extractedText.length < 20) {
        setOcrState({
          status: "error",
          fileName,
          message: "El OCR no pudo leer suficiente texto. Sube una captura mas nitida de la tabla SAT."
        });
        return;
      }

      setRawText(extractedText);
      setOcrState({ status: "success", fileName, progress: 100 });
      await submitEvidence(extractedText);
    } catch {
      setOcrState({
        status: "error",
        fileName,
        message: "No se pudo leer la imagen. Prueba con PNG/JPG nitido o pega el texto manualmente."
      });
    }
  }, [imageInputDisabled, submitEvidence]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await processImageFile(file, "upload");
    } finally {
      input.value = "";
    }
  }

  function handleImageDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    if (!imageInputDisabled) {
      setIsDraggingImage(true);
    }
  }

  function handleImageDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsDraggingImage(false);
  }

  async function handleImageDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingImage(false);

    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFile) {
      setOcrState({
        status: "error",
        message: "Suelta una imagen valida de la tabla SAT."
      });
      return;
    }

    await processImageFile(imageFile, "drop");
  }

  useEffect(() => {
    function handleClipboardPaste(event: ClipboardEvent) {
      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) =>
        item.kind === "file" && item.type.startsWith("image/")
      );
      const imageFile = imageItem?.getAsFile();

      if (!imageFile) {
        return;
      }

      event.preventDefault();
      void processImageFile(imageFile, "paste");
    }

    window.addEventListener("paste", handleClipboardPaste);

    return () => {
      window.removeEventListener("paste", handleClipboardPaste);
    };
  }, [processImageFile]);

  async function copySellerScript() {
    if (state.status !== "success") {
      return;
    }

    await navigator.clipboard.writeText(state.data.result.sellerScript);
    setState({ ...state, copied: true });
  }

  return (
    <div className="grid min-w-0 gap-6 overflow-x-hidden">
      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-normal text-brand-700">
            SAT Lima
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink">
            Captura papeletas sin redactar el reporte
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slateText">
            Abre SAT, entra a Consulta de papeletas / Multas Administrativas,
            consulta la placa y pega la tabla o captura. El sistema detecta
            deuda, registros, captura administrativa y alertas.
          </p>

          <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-ink">Placa</span>
              <span className="flex min-h-16 min-w-0 items-center rounded-md border-2 border-ink bg-white px-4">
                <span className="mr-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-white">
                  PE
                </span>
                <input
                  value={normalizedPlate}
                  onChange={(event) => setPlate(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-black uppercase tracking-normal outline-none sm:text-3xl"
                  aria-label="Placa vehicular"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={copyPlate}
              className="mt-auto inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              <Clipboard aria-hidden="true" size={18} />
              Copiar
            </button>
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-900"
            >
              Abrir SAT
              <ExternalLink aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        <aside className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-normal text-slateText">
            Flujo SAT
          </p>
          <div className="mt-4 grid gap-4">
            {[
              ["1", "Abrir SAT", "Entrar a Consultas en linea."],
              ["2", "Elegir papeletas", "Consulta de papeletas / multas."],
              ["3", "Consultar placa", "Resolver validacion si aparece."],
              ["4", "Pegar evidencia", "Tabla, texto o screenshot."]
            ].map(([step, title, detail]) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-sm font-black text-brand-700">
                  {step}
                </span>
                <div>
                  <p className="font-bold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slateText">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <form
        onSubmit={analyzeEvidence}
        className="grid min-w-0 gap-5 rounded-md border border-line bg-white p-5 shadow-panel"
      >
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-bold text-ink">
              Tabla, HTML o texto SAT
            </span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              onPaste={(event) => {
                void handleEvidencePaste(event);
              }}
              rows={11}
              placeholder="Pega aqui el resultado SAT. Si copiaste una tabla de papeletas, se analizara automaticamente..."
              className="rounded-md border border-line bg-surface px-3 py-3 text-sm leading-6 outline-none focus:border-brand-700"
            />
          </label>

          <div className="grid min-w-0 gap-4">
            <label
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              className={[
                "grid min-w-0 cursor-pointer gap-3 rounded-md border-2 border-dashed p-4 transition",
                isDraggingImage
                  ? "border-brand-700 bg-white shadow-panel ring-2 ring-brand-200"
                  : "border-brand-200 bg-brand-50 hover:border-brand-700 hover:bg-white",
                imageInputDisabled ? "opacity-80" : ""
              ].join(" ")}
            >
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <FileImage aria-hidden="true" size={18} />
                Captura SAT
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
                disabled={imageInputDisabled}
              />
              <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-bold text-white">
                {ocrState.status === "reading" ? (
                  <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                ) : (
                  <Upload aria-hidden="true" size={18} />
                )}
                Elegir captura
              </span>
              <span className="text-xs leading-5 text-slateText">
                Arrastra la imagen aqui, pegala desde el portapapeles o elige
                un archivo PNG/JPG.
              </span>
              {isDraggingImage ? (
                <span className="rounded-md bg-white px-3 py-2 text-center text-xs font-bold text-brand-700">
                  Suelta la captura para leerla
                </span>
              ) : null}
            </label>

            {ocrState.status === "reading" ? (
              <div className="rounded-md border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-slateText">
                  <span className="truncate">{ocrState.fileName}</span>
                  <span>{ocrState.progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-brand-700 transition-all"
                    style={{ width: `${Math.max(8, ocrState.progress)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {ocrState.status === "success" ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
                <div className="flex gap-3">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                  <p>
                    OCR listo para <strong>{ocrState.fileName}</strong>. Ya se
                    envio al analizador.
                  </p>
                </div>
              </div>
            ) : null}

            {ocrState.status === "error" ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-redRisk">
                {ocrState.message}
              </div>
            ) : null}

            {imagePreviewUrl ? (
              <div className="overflow-hidden rounded-md border border-line bg-surface">
                <img
                  src={imagePreviewUrl}
                  alt="Captura SAT cargada"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            ) : null}

            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-ink">
                URL de evidencia
              </span>
              <input
                value={evidenceUrl}
                onChange={(event) => setEvidenceUrl(event.target.value)}
                placeholder="https://..."
                className="h-11 rounded-md border border-line px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <div className="flex gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                <p>
                  SAT usa sesiones web dinamicas. El sistema no automatiza la
                  sesion ni salta validaciones: analiza solo evidencia visible
                  obtenida por el vendedor.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={state.status === "loading" || ocrState.status === "reading"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-bold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.status === "loading" ? (
                <Loader2 aria-hidden="true" className="animate-spin" size={18} />
              ) : (
                <ScanText aria-hidden="true" size={18} />
              )}
              Analizar SAT
            </button>
          </div>
        </div>
      </form>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <section className="grid gap-5">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                Resultado SAT
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-black text-ink">
                  {state.data.result.confidenceScore}
                </span>
                <span className="pb-2 text-sm font-bold text-slateText">
                  confianza {state.data.result.confidenceLevel}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  {statusLabel(state.data.result.statusSuggestion)}
                </span>
                <span className="rounded-md bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                  {state.data.result.plate}
                </span>
              </div>
            </article>

            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                    Guion para venta
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink">
                    {state.data.result.sellerScript}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copySellerScript}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-900"
                >
                  <Clipboard aria-hidden="true" size={17} />
                  {state.copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </article>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                Campos extraidos
              </p>
              {state.data.result.fieldRows.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {state.data.result.fieldRows.map((field) => (
                    <div key={field.label} className="rounded-md bg-surface p-4">
                      <p className="text-xs font-bold uppercase tracking-normal text-slateText">
                        {field.label}
                      </p>
                      <p className="mt-2 break-words text-sm font-bold text-ink">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  No se extrajeron campos suficientes. Copia la tabla completa
                  del resultado SAT o sube una captura mas nitida.
                </div>
              )}
            </article>

            <aside className="grid gap-4">
              <div className="rounded-md border border-line bg-white p-5 shadow-panel">
                <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                  Alertas
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  {state.data.result.alerts.length ? (
                    state.data.result.alerts.map((alert) => (
                      <div key={alert} className="flex gap-3 text-amber-950">
                        <AlertTriangle
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-amberRisk"
                          size={17}
                        />
                        <span>{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 text-ink">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      <span>Sin deuda o papeleta evidente en el texto capturado.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-line bg-white p-5 shadow-panel">
                <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                  Control final
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  {state.data.result.reportNotes.map((note) => (
                    <div key={note} className="flex gap-3">
                      <FileCheck2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`/reporte-en-vivo?placa=${encodeURIComponent(state.data.result.plate)}&paquete=pro`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              Ver reporte vivo
              <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a
              href="/panel"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              Ir al panel
              <MonitorUp aria-hidden="true" size={17} />
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}

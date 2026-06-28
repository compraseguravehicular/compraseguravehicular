import { z } from "zod";

const plateSchema = z
  .string()
  .trim()
  .min(5, "Ingresa una placa valida.")
  .max(12, "La placa es demasiado larga.")
  .regex(/^[A-Za-z0-9-]+$/, "Usa solo letras, numeros y guion.");

const optionalText = z
  .string()
  .trim()
  .max(180)
  .optional()
  .transform((value) => (value ? value : undefined));

export const createOrderSchema = z.object({
  plate: plateSchema.transform((value) => value.toUpperCase()),
  customerName: z.string().trim().min(2, "Ingresa tu nombre.").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un WhatsApp valido.")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "WhatsApp no valido."),
  email: z
    .string()
    .trim()
    .email("Email no valido.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  packageType: z.enum(["express", "compra_segura", "pro"]),
  city: z.string().trim().min(2).max(80),
  vehicleType: z.string().trim().min(2).max(60),
  sellerName: optionalText,
  sellerDocument: optionalText,
  listingUrl: z
    .string()
    .trim()
    .url("Link no valido.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  vin: optionalText,
  mileage: z
    .number()
    .int()
    .min(0)
    .max(2000000)
    .optional()
    .or(z.nan().transform(() => undefined)),
  notes: z.string().trim().max(500).optional(),
  consentAccepted: z
    .boolean()
    .refine((value) => value, "Debes aceptar el tratamiento informativo de datos.")
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;

export const createClaimSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre completo.").max(120),
  documentNumber: z
    .string()
    .trim()
    .min(6, "Ingresa un documento valido.")
    .max(20),
  email: z.string().trim().email("Email no valido.").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un telefono valido.")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Telefono no valido."),
  address: z.string().trim().min(5, "Ingresa una direccion.").max(220),
  orderCode: optionalText,
  claimType: z.enum(["reclamo", "queja"]),
  productService: z
    .string()
    .trim()
    .min(3, "Indica el servicio relacionado.")
    .max(160),
  amount: z.number().min(0).max(100000).optional(),
  detail: z
    .string()
    .trim()
    .min(20, "Describe el detalle con mayor precision.")
    .max(2500),
  request: z
    .string()
    .trim()
    .min(10, "Indica el pedido concreto.")
    .max(1500),
  consentAccepted: z
    .boolean()
    .refine((value) => value, "Debes aceptar el tratamiento de datos.")
});

export type CreateClaimPayload = z.infer<typeof createClaimSchema>;

export const sourceStatusSchema = z.enum([
  "pending",
  "consulted_no_alert",
  "consulted_with_alert",
  "unavailable",
  "not_applicable",
  "not_included",
  "requires_manual_document",
  "failed"
]);

export const confidenceLevelSchema = z.enum([
  "Alta",
  "Media",
  "Baja",
  "No aplica"
]);

export const updateSourceResultSchema = z.object({
  id: z.string().uuid("Fuente no valida."),
  status: sourceStatusSchema,
  confidenceLevel: confidenceLevelSchema,
  summary: z
    .string()
    .trim()
    .max(1200, "El resumen es demasiado largo.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  evidenceUrl: z
    .string()
    .trim()
    .url("URL de evidencia no valida.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined))
});

export type UpdateSourceResultPayload = z.infer<typeof updateSourceResultSchema>;

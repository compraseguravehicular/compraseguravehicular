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

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";

export const businessConfig = {
  brandName: "Compra Segura Vehicular",
  legalName:
    process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME ?? "Compra Segura Vehicular",
  ruc: process.env.NEXT_PUBLIC_BUSINESS_RUC ?? "",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "compraseguravehicular@gmail.com",
  supportPhone: whatsappNumber,
  paymentAccountName:
    process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME ??
    process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME ??
    "Compra Segura Vehicular",
  yapeNumber: process.env.NEXT_PUBLIC_PAYMENT_YAPE_NUMBER ?? whatsappNumber,
  plinNumber: process.env.NEXT_PUBLIC_PAYMENT_PLIN_NUMBER ?? whatsappNumber,
  responseSla: "24 horas habiles",
  reportDisclaimer:
    "Reporte informativo basado en fuentes disponibles al momento de consulta. No reemplaza certificados oficiales, asesoria legal ni inspeccion mecanica presencial."
};

export const isBusinessIdentityComplete =
  Boolean(process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME) &&
  Boolean(process.env.NEXT_PUBLIC_BUSINESS_RUC);

export const businessIdentityText = isBusinessIdentityComplete
  ? `Titular comercial: ${businessConfig.legalName}. RUC: ${businessConfig.ruc}.`
  : `Titular comercial: ${businessConfig.legalName}. Datos tributarios pendientes de configuracion antes de cobro publico.`;

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function whatsappHref(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

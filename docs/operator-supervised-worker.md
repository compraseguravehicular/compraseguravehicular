# Copiloto vendedor y worker supervisado

Este flujo existe para operar fuentes oficiales sin convertir el negocio en scraping fragil.

## Ruta web

Abrir:

```txt
/operador?placa=5075cd
```

El vendedor:

1. Copia la placa normalizada.
2. Abre la fuente oficial SUNARP.
3. Completa la verificacion oficial cuando aparezca.
4. Pega el resultado visible o HTML en el copiloto.
5. El sistema extrae campos, alertas, confianza y guion de venta.

## Worker local supervisado

En una computadora operativa con navegador:

```bash
npm run operator:sunarp -- 5075cd
```

El worker:

- Abre Chromium visible.
- Intenta cargar la placa en SUNARP.
- Espera que el operador complete la verificacion oficial.
- Captura texto, HTML y screenshot.
- Guarda evidencia en `artifacts/operator`.

Luego se pega el `.txt` generado en `/operador`.

## Por que este flujo es profesional

- No resuelve ni evade verificaciones antiabuso.
- Automatiza preparacion, captura, extraccion y resumen.
- Reduce errores del vendedor.
- Deja evidencia auditable.
- Permite migrar a API/proveedor cuando haya credenciales.

## Siguiente evolucion

1. Guardar evidencia en Supabase Storage.
2. Asociar automaticamente la evidencia a `source_results`.
3. Crear workers equivalentes para SOAT, MTC CITV y SAT cuando el flujo sea permitido.
4. Conectar proveedores API cuando haya credenciales reales.

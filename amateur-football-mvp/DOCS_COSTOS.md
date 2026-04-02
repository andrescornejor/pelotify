# Estimación de Costos Mensuales - Pelotify

Esta es una estimación de los costos de infraestructura (hosting, base de datos y APIs) basada en el stack actual de la aplicación.

## 🟢 Etapa 1: Lanzamiento y MVP (0 - 500 Usuarios Activos)
En esta etapa, casi todos los servicios se mantienen dentro de sus **capas gratuitas**.

| Servicio | Proveedor | Costo Estimado | Notas |
| :--- | :--- | :--- | :--- |
| **Frontend/Hosting** | Vercel (Hobby) | **$0** | Suficiente para proyectos personales y MVPs. |
| **Base de Datos / Auth** | Supabase (Free) | **$0** | Incluye hasta 50k usuarios activos y 500MB de BD. |
| **Mapas / Lugares** | Google Maps API | **$0** | Google regala $200 USD de crédito mensual recurrente. |
| **Pagos** | Mercado Pago | **$0** | Solo cobran comisión por cada venta exitosa. |
| **Clima** | Open-Meteo | **$0** | API gratuita para uso no comercial/bajo volumen. |
| **Dominio** | Nick.ar / GoDaddy | **~$1.25** | Aprox. $15 USD al año (~$15.000 - $20.000 ARS). |
| **TOTAL ESTIMADO** | | **~$1.50 USD / mes** | |

---

## 🟡 Etapa 2: Crecimiento (500 - 5.000 Usuarios Activos)
A medida que la app escala, podrías necesitar planes pagos para evitar límites o pausas de servicio.

| Servicio | Proveedor | Costo Estimado | Razón del cambio |
| :--- | :--- | :--- | :--- |
| **Hosting Pro** | Vercel Pro | **$20** | Mayor ancho de banda y soporte para equipos. |
| **Database Pro** | Supabase Pro | **$25** | Evita que la DB "se duerma" por inactividad y aumenta el storage. |
| **Mapas** | Google Maps API | **$0** | El crédito de $200 suele cubrir hasta ~28.000 cargas de mapa. |
| **Mantenimiento** | Varios | **$5 - $10** | Posibles costos extra de almacenamiento (S3) o emails (Resend). |
| **TOTAL ESTIMADO** | | **~$50 - $60 USD / mes** | |

---

## 🚀 Consideraciones Clave:
1.  **Google Maps**: Es el servicio más "peligroso" si se usa mal. He implementado Pelotify para que haga búsquedas inteligentes y no gaste de más. Con el crédito de $200 USD, es muy difícil que pagues algo al principio.
2.  **Supabase**: El plan gratuito borra proyectos inactivos tras 1 semana. Para producción real, el plan de **$25 USD** es la inversión más importante para asegurar estabilidad.
3.  **Emails**: Si empiezas a enviar muchos correos de confirmación, podrías sumar unos **$10 USD** extra con servicios como Resend o SendGrid.

> [!TIP]
> **Recomendación Inicial:** Empieza con **$0**. Solo escala a planes pagos cuando la app genere ingresos o el tráfico lo exija. El stack actual está optimizado para que el costo de entrada sea prácticamente nulo.

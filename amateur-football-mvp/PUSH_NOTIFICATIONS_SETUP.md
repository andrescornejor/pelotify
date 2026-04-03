# 🚀 Guía de Configuración: Push Notifications (FCM)

Has integrado un sistema de notificaciones push de nivel profesional utilizando **Firebase Cloud Messaging (FCM)**. Para que las notificaciones funcionen en producción y local, debes seguir estos pasos.

---

## 1. Configuración en Firebase Console
1.  Ve a [Firebase Console](https://console.firebase.google.com/).
2.  Crea un nuevo proyecto o usa uno existente.
3.  **Añade una Web App**:
    *   Registra tu app (ej. "Pelotify").
    *   Copia el objeto `firebaseConfig` que te proporcionan. Necesitarás estos valores para tu `.env.local`.
4.  **Cloud Messaging**:
    *   Ve a *Configuración del proyecto* → *Cloud Messaging*.
    *   En *Web configuration*, genera una **VAPID Key** (Web Push certificates). Cópiala.
5.  **Service Account**:
    *   Ve a *Configuración del proyecto* → *Cuentas de servicio*.
    *   Haz clic en **Generar nueva clave privada**.
    *   Descarga el JSON. Ábrelo y copia **todo el contenido** para la variable `FIREBASE_SERVICE_ACCOUNT_KEY`.

---

## 2. Variables de Entorno (`.env.local`)
Actualiza tu archivo `.env.local` con los valores obtenidos:

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pelotify-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pelotify-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pelotify-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BH...

# Firebase Admin (Secret - Server Side)
# Debes pegar el JSON completo en una sola línea o asegurarte de que se lea correctamente.
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":...}'
```

---

## 3. Base de Datos (Supabase)
He creado el archivo `fcm_tokens_migration.sql`. Debes ejecutar su contenido en el **SQL Editor** de Supabase para crear la tabla de tokens y las políticas de seguridad.

---

## 4. ¿Qué hemos implementado?

### 🔔 Notificaciones en Tiempo Real
*   **Mensajes de Chat**: Al recibir un mensaje directo o en el lobby de un partido.
*   **Partido**: Cuando un jugador se une, cuando recibes una invitación o cuando se confirma el resultado final.
*   **Equipos**: Invitaciones a unirse a un equipo.
*   **Retos**: Nuevos retos de equipo y respuestas a retos enviados.
*   **Amigos**: Nuevas solicitudes de amistad.

### 📱 Experiencia Premium (UI/UX)
*   **Foreground Toast**: Si el usuario tiene la app abierta, verá un "toast" premium diseñado con Framer Motion en la parte superior.
*   **Background Notifications**: Si la app está cerrada, el navegador mostrará una notificación nativa. Al hacer clic, te llevará directamente a la sección correspondiente (partido, chat, etc.).
*   **Permission Banner**: Un banner no intrusivo en el layout que invita al usuario a activar las notificaciones si aún no lo ha hecho.
*   **Notification Bell**: Un contador de notificaciones integrado en el header con un dropdown para ver mensajes recientes.

---

## 5. Notas de Desarrollo
*   **PWA**: Las notificaciones funcionan mejor si instalas la app como PWA.
*   **Service Worker**: Se utiliza `firebase-messaging-sw.js` para manejar los mensajes en segundo plano. No interfiere con el `sw.js` de caché de la PWA.
*   **Auto-Cleanup**: El sistema limpia automáticamente los tokens inválidos de la base de datos cuando Firebase reporta que ya no son válidos.

Ready to roll! ⚽🔥

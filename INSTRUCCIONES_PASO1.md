# PASO 1 — Registro, login y estructura base

## Qué tienes al final de este paso
- Proyecto Vite + React listo
- Backend serverless con 2 endpoints: registro y login
- Sistema de sesión con JWT (token que dura 7 días)
- Contraseñas seguras con bcrypt (+ migración automática de las legacy)
- Navegación completa con 5 módulos (los siguientes pasos los rellenan)
- Funciona en móvil (barra inferior) y desktop (sidebar)

---

## 1. PREPARAR LA BASE DE DATOS

Entra a phpMyAdmin en awardspace y ejecuta este SQL:
*(Archivo adjunto: `migracion_chat_seguridad.sql`)*

Esto añade:
- Columna `password_hash` a la tabla `usuarios`
- Tablas `conversaciones_chat`, `mensajes_chat`, `disponibilidad`, `citas`

---

## 2. INSTALAR EL PROYECTO

```bash
# Crea la carpeta del proyecto y entra
mkdir orienta-plataforma && cd orienta-plataforma

# Copia todos los archivos de este paso aquí

# Instala dependencias (tanto frontend como backend)
npm install
npm install mysql2 bcryptjs jsonwebtoken @anthropic-ai/sdk
```

---

## 3. CONFIGURAR VARIABLES DE ENTORNO

```bash
cp .env.example .env.local
```

Edita `.env.local` y rellena:
- `DB_PASSWORD` → la contraseña de tu base de datos awardspace
- `JWT_SECRET` → inventa una cadena de 40+ caracteres aleatoria
- `ANTHROPIC_API_KEY` → tu clave de Claude API (para el chat, siguiente paso)
- `ADMIN_EMAIL` → tu email para identificar el panel de admin

---

## 4. PROBAR EN LOCAL

Necesitas [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel dev
```

Abre http://localhost:3000

Prueba:
1. Ir a /registro → crear una cuenta nueva
2. Ir a /login → entrar
3. Ver el dashboard con las 4 tarjetas
4. Hacer logout y comprobar que /dashboard redirige a /login

---

## 5. SUBIR A VERCEL

```bash
vercel login   # si aún no lo has hecho
vercel         # primer deploy (te pregunta configuración)
```

Después entra al dashboard de Vercel → Settings → Environment Variables
y añade las mismas variables de `.env.local`.

---

## Estructura de archivos entregados

```
api/
  _db.js              ← conexión MySQL + helpers JWT
  auth/
    register.js       ← POST /api/auth/register
    login.js          ← POST /api/auth/login
src/
  context/
    AuthContext.jsx   ← sesión global
  lib/
    api.js            ← fetch helper con JWT
  components/
    Layout.jsx        ← barra nav desktop + mobile
    ProtectedRoute.jsx
  pages/
    Login.jsx
    Register.jsx
    Dashboard.jsx
    Citas.jsx         ← placeholder (Paso 2)
    Chat.jsx          ← placeholder (Paso 3)
    BrainTrain.jsx    ← placeholder (Paso 4)
    Talleres.jsx      ← placeholder (Paso 5)
  App.jsx             ← rutas
  main.jsx
  index.css
index.html
vite.config.js
tailwind.config.js
postcss.config.js
vercel.json
package.json
.env.example
```

---

## Próximos pasos

| Paso | Módulo                            |
|------|-----------------------------------|
| 2    | Agenda de citas + videollamada    |
| 3    | Chat IA 24h (Claude API)          |
| 4    | Cuestionario Brain Train completo |
| 5    | Talleres y cursos grabados        |
| 6    | Panel de admin                    |
| 7    | Pasarela de pago (Stripe)         |

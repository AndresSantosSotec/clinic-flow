# MedicApp - Frontend

Sistema de gestión clínica desarrollado con React, TypeScript y Vite.

## 🚀 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura la URL de tu API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

**Para producción**, cambia la URL a la de tu servidor backend.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Compilar para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🏗️ Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas de la aplicación
├── lib/            # Utilidades y configuración
├── hooks/          # Custom hooks de React
└── types/          # Definiciones de TypeScript
```

## 🔑 Credenciales de Prueba

- **Administrador**: admin@medicapp.com / password123
- **Doctor**: doctor@medicapp.com / password123
- **Recepcionista**: recepcion@medicapp.com / password123

## 📦 Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Shadcn/ui** - Componentes de UI
- **React Query** - Manejo de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Axios** - Cliente HTTP

## 📝 Notas

- Asegúrate de que el backend esté corriendo antes de iniciar el frontend
- El archivo `.env` no debe ser commiteado al repositorio
- Usa `.env.example` como plantilla para nuevas instalaciones

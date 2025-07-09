# Arquitectura en Capas - RC Starter Kit

RC Starter Kit utiliza una arquitectura en capas estricta para mantener la separación de responsabilidades y facilitar el mantenimiento del código.

## **Estructura de Capas**

### **Capa de Servicios (`src/services/`)**
- **Responsabilidad:** Única capa que puede usar Prisma directamente
- **Contenido:** Operaciones CRUD y lógica de base de datos
- **Archivos:** `*-service.ts` (ej: `user-service.ts`, `auth-service.ts`)
- **Funciones:** Exportar funciones específicas y bien tipadas
- **Importaciones permitidas:** `@prisma/client`, `@/lib/prisma`

```typescript
// ✅ CORRECTO: En src/services/user-service.ts
import { prisma } from "@/lib/prisma"
import { Role, type User } from "@prisma/client"

export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } })
}
```

### **Capa de Lógica de Negocio (`src/lib/`, `src/app/`, componentes)**
- **Responsabilidad:** Lógica de aplicación, validaciones, Auth.js
- **Importaciones:** Solo servicios, nunca Prisma directamente
- **Prohibido:** `import { prisma }` o cualquier uso directo de Prisma

```typescript
// ✅ CORRECTO: En src/lib/auth.ts
import { getUserForAuth } from "@/services/user-service"

// ❌ INCORRECTO: Usar Prisma directamente
import { prisma } from "@/lib/prisma"
```

### **Capa de Presentación (Componentes React)**
- **Responsabilidad:** UI, estado del cliente, interacciones
- **Importaciones:** Hooks, servicios (via server actions)
- **Prohibido:** Prisma directo, lógica de base de datos

## **Organización Modular por Features**

RC Starter Kit sigue un patrón de **co-ubicación modular** donde todo lo relacionado con una feature específica se mantiene junto.

### **Estructura Modular de Admin Features**

```
src/app/admin/
├── layout.tsx              # Layout común para admin
├── [feature]/              # Módulo específico (users, etc.)
│   ├── page.tsx            # Lista/index de la feature
│   ├── actions.ts          # Server actions específicas
│   ├── [feature]-form.tsx  # Formulario crear/editar
│   ├── [feature]-table.tsx # Tabla con acciones
│   ├── delete-[feature]-dialog.tsx # Modal confirmación
│   ├── new/
│   │   └── page.tsx        # Página crear
│   └── [id]/
│       └── edit/
│           └── page.tsx    # Página editar
```

### **Patrones de Co-ubicación**

#### **1. Server Actions Co-ubicadas**
```typescript
// src/app/admin/users/actions.ts
"use server"

import { createUser, updateUser } from "@/services/user-service"
import { revalidatePath } from "next/cache"

export async function createUserAction(formData: FormData) {
  // Lógica específica de la UI
  // Usa user-service para BD
  // Revalidate paths específicos
}
```

#### **2. Componentes Específicos de Feature**
```typescript
// src/app/admin/users/user-form.tsx
import { useState } from "react"
import { createUserAction } from "./actions"

export function UserForm({ user, isEdit = false }) {
  // Lógica específica para formularios de usuario
  // Usa actions co-ubicadas
}
```

## **Servicios + Validaciones Co-ubicadas**

### **Patrón de Servicio con Validaciones**
```typescript
// src/services/user-service.ts
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ✅ Validaciones al inicio del archivo
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "CLIENT"])
})

export const updateUserSchema = createUserSchema.partial()

// Tipos derivados de schemas
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

// Funciones de servicio
export async function createUser(data: CreateUserData) {
  const validated = createUserSchema.parse(data)
  // Lógica de creación...
}
```

## **Reglas Estrictas**

### **✅ HACER:**
- Crear servicios específicos por modelo: `user-service.ts`, `auth-service.ts`, etc.
- Co-ubicar validaciones Zod al inicio de cada servicio
- Usar tipos explícitos en servicios (`CreateUserData`, `UpdateUserData`)
- Usar Server Actions en lugar de API routes
- Mantener servicios enfocados en un solo modelo/dominio
- Organizar features en módulos auto-contenidos

### **❌ NO HACER:**
- Importar `prisma` fuera de `src/services/`
- Crear queries de Prisma en componentes, lib, o auth
- Usar API routes cuando Server Actions son más apropiadas
- Servicios que manejen múltiples modelos sin relación
- Crear "reutilización" prematura de componentes

## **Beneficios de esta Arquitectura**

- **Mantenibilidad:** Cambios en BD solo afectan servicios
- **Modularidad:** Features auto-contenidas y fáciles de mantener
- **Testabilidad:** Servicios se pueden mockear fácilmente
- **Tipado:** TypeScript fuerte en todas las capas
- **Developer Experience:** Todo lo relacionado está junto
- **Consistencia:** Patrón repetible para nuevas features
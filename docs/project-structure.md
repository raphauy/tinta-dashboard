# Project Structure

## Estructura Actual del Starter Kit

```
src/
├── app/                     # App Router páginas
│   ├── admin/              # Panel de administración (existente)
│   │   ├── components/     # Componentes específicos del admin
│   │   ├── users/          # Gestión de usuarios
│   │   ├── workspaces/     # Gestión de workspaces
│   │   ├── layout.tsx      # Layout del admin panel
│   │   └── page.tsx        # Dashboard principal
│   ├── w/                  # Workspaces (existente)
│   │   ├── [slug]/         # Workspace individual
│   │   │   ├── members/    # Gestión de miembros
│   │   │   ├── settings/   # Configuración del workspace
│   │   │   ├── layout.tsx  # Layout del workspace
│   │   │   └── page.tsx    # Dashboard del workspace
│   │   ├── profile/        # Perfil de usuario
│   │   ├── settings/       # Configuración global
│   │   └── layout.tsx      # Layout base de workspaces
│   ├── login/              # Autenticación OTP (existente)
│   ├── onboarding/         # Proceso de onboarding (existente)
│   ├── invite/[token]/     # Aceptación de invitaciones (existente)
│   ├── layout.tsx          # Layout raíz
│   └── page.tsx            # Homepage
├── components/             # Componentes globales reutilizables
│   ├── ui/                 # shadcn/ui components (existente)
│   ├── emails/             # Templates de email (existente)
│   ├── theme-provider.tsx  # Proveedor de themes
│   └── theme-toggle.tsx    # Toggle de dark mode
├── services/               # Capa de servicios (existente)
│   ├── auth-service.ts     # Gestión OTP
│   ├── user-service.ts     # CRUD usuarios
│   ├── workspace-service.ts # CRUD workspaces
│   ├── invitation-service.ts # Sistema de invitaciones
│   ├── email-service.ts    # Envío de emails
│   ├── upload-service.ts   # Gestión de archivos
│   └── dashboard-service.ts # Métricas y analytics
├── lib/                    # Utilidades y configuración
│   ├── auth.ts             # Configuración NextAuth
│   ├── prisma.ts           # Cliente Prisma
│   └── utils.ts            # Utilidades generales
├── types/                  # Tipos TypeScript
│   ├── auth.ts             # Tipos de autenticación
│   └── next-auth.d.ts      # Extensión NextAuth
├── hooks/                  # Custom hooks
│   └── use-mobile.ts       # Hook para detección móvil
└── middleware.ts           # Middleware de autenticación
```

## Estructura Propuesta para Form Builder

### Nuevas Rutas y Páginas

```
src/app/
├── admin/                  # Extensión del panel existente
│   ├── templates/          # 🆕 Gestión de plantillas globales
│   │   ├── new/
│   │   │   └── page.tsx    # Crear nueva plantilla
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx # Editar plantilla
│   │   │   └── page.tsx    # Ver plantilla
│   │   ├── actions.ts      # Server actions para plantillas
│   │   ├── template-form.tsx
│   │   ├── templates-list.tsx
│   │   └── page.tsx        # Lista de plantillas
│   └── forms/              # 🆕 Vista global de formularios
│       ├── page.tsx        # Dashboard de formularios por workspace
│       └── [workspaceId]/
│           └── page.tsx    # Formularios de workspace específico
├── w/[slug]/               # Extensión de workspaces existentes
│   ├── forms/              # 🆕 Gestión de formularios por workspace
│   │   ├── new/
│   │   │   └── page.tsx    # Crear formulario (desde plantilla o scratch)
│   │   ├── [formId]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx # Editor de formularios
│   │   │   ├── responses/
│   │   │   │   ├── [responseId]/
│   │   │   │   │   └── page.tsx # Ver respuesta individual
│   │   │   │   └── page.tsx # Lista de respuestas
│   │   │   ├── share/
│   │   │   │   └── page.tsx # Gestión de enlaces públicos
│   │   │   └── page.tsx    # Vista general del formulario
│   │   ├── actions.ts      # Server actions para formularios
│   │   ├── form-builder.tsx # Constructor drag-and-drop
│   │   ├── form-list.tsx   # Lista de formularios
│   │   ├── response-viewer.tsx
│   │   └── page.tsx        # Dashboard de formularios del workspace
│   └── templates/          # 🆕 Plantillas del workspace
│       ├── new/
│       │   └── page.tsx    # Crear plantilla desde formulario
│       └── page.tsx        # Lista de plantillas accesibles
└── f/                      # 🆕 Formularios públicos
    ├── [token]/
    │   ├── components/
    │   │   ├── public-form-renderer.tsx
    │   │   ├── file-upload-field.tsx
    │   │   └── form-submission-success.tsx
    │   ├── actions.ts      # Envío de formularios públicos
    │   └── page.tsx        # Formulario público renderizado
    └── layout.tsx          # Layout para formularios públicos (sin auth)
```

### Nuevos Componentes

```
src/components/
├── forms/                  # 🆕 Componentes específicos del form builder
│   ├── form-builder/       # Constructor de formularios
│   │   ├── field-types/
│   │   │   ├── text-field.tsx
│   │   │   ├── textarea-field.tsx
│   │   │   ├── file-upload-field.tsx
│   │   │   └── field-wrapper.tsx
│   │   ├── drag-drop/
│   │   │   ├── draggable-field.tsx
│   │   │   ├── drop-zone.tsx
│   │   │   └── field-palette.tsx
│   │   ├── builder-canvas.tsx
│   │   ├── field-editor.tsx
│   │   ├── form-preview.tsx
│   │   └── builder-toolbar.tsx
│   ├── templates/          # Gestión de plantillas
│   │   ├── template-selector.tsx
│   │   ├── template-card.tsx
│   │   ├── template-preview.tsx
│   │   └── template-form.tsx
│   ├── responses/          # Visualización de respuestas
│   │   ├── response-table.tsx
│   │   ├── response-viewer.tsx
│   │   ├── response-export.tsx
│   │   └── response-status.tsx
│   └── public/             # Componentes para formularios públicos
│       ├── public-form-layout.tsx
│       ├── public-field-renderer.tsx
│       ├── form-progress.tsx
│       └── submission-confirmation.tsx
├── workspace/              # 🆕 Extensiones de workspace
│   ├── workspace-selector.tsx # Selector dropdown para sidebar
│   ├── form-stats-card.tsx
│   └── quick-actions.tsx
├── ui/                     # Extensiones de shadcn/ui
│   ├── drag-drop.tsx       # 🆕 Componentes drag-and-drop
│   ├── file-upload.tsx     # 🆕 Componente de subida de archivos
│   ├── progress-indicator.tsx # 🆕 Indicador de progreso
│   └── status-badge.tsx    # 🆕 Badge de estados
└── emails/                 # Nuevos templates de email
    ├── form-submission-notification.tsx # 🆕
    └── form-share-notification.tsx      # 🆕
```

### Nuevos Servicios

```
src/services/
├── form-service.ts         # 🆕 CRUD formularios
├── template-service.ts     # 🆕 CRUD plantillas
├── form-field-service.ts   # 🆕 Gestión de campos
├── form-response-service.ts # 🆕 Gestión de respuestas
├── form-analytics-service.ts # 🆕 Métricas de formularios
└── file-validation-service.ts # 🆕 Validación extendida de archivos
```

### Extensiones de la Base de Datos

```prisma
// Nuevos modelos para el schema.prisma

model FormTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  fields      Json     // Estructura de campos serializada
  isGlobal    Boolean  @default(true) // Todas las plantillas son globales
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  createdBy User @relation(fields: [createdById], references: [id])
  forms     Form[] // Formularios creados desde esta plantilla
  
  @@map("form_templates")
}

model Form {
  id           String        @id @default(cuid())
  name         String
  description  String?
  fields       Json          // Estructura de campos personalizada
  workspaceId  String
  templateId   String?       // Plantilla de origen (opcional)
  shareToken   String        @unique // Token para enlace público
  isActive     Boolean       @default(true)
  allowEdits   Boolean       @default(false) // Permitir ediciones múltiples
  createdById  String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  // Relaciones
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  template    FormTemplate? @relation(fields: [templateId], references: [id])
  createdBy   User          @relation(fields: [createdById], references: [id])
  responses   FormResponse[]
  
  @@index([shareToken])
  @@index([workspaceId])
  @@map("forms")
}

model FormResponse {
  id          String            @id @default(cuid())
  formId      String
  data        Json              // Respuestas serializadas
  status      ResponseStatus    @default(new)
  submittedAt DateTime          @default(now())
  submitterIP String?           // IP del usuario (opcional)
  
  // Relaciones
  form  Form @relation(fields: [formId], references: [id], onDelete: Cascade)
  files FormResponseFile[]
  
  @@index([formId])
  @@index([status])
  @@map("form_responses")
}

model FormResponseFile {
  id         String @id @default(cuid())
  responseId String
  fieldName  String // Nombre del campo que subió el archivo
  fileName   String // Nombre original del archivo
  fileUrl    String // URL en Vercel Blob
  fileSize   Int    // Tamaño en bytes
  fileType   String // MIME type
  uploadedAt DateTime @default(now())
  
  // Relaciones
  response FormResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  @@index([responseId])
  @@map("form_response_files")
}

enum ResponseStatus {
  new
  reviewed
  processed
}

// Extensiones a modelos existentes
model User {
  // ... campos existentes
  formTemplates FormTemplate[] // Plantillas creadas
  forms         Form[]          // Formularios creados
}

model Workspace {
  // ... campos existentes
  forms Form[] // Formularios del workspace
}
```

## Patrones de Organización de Archivos

### Co-localización de Componentes
- Componentes específicos de página junto a la página que los usa
- Actions de Server Actions en el mismo directorio que los componentes
- Componentes compartidos en directorios temáticos (`/components/forms/`)

### Barrel Exports
```typescript
// src/components/forms/index.ts
export { FormBuilder } from './form-builder/builder-canvas'
export { TemplateSelector } from './templates/template-selector'
export { ResponseViewer } from './responses/response-viewer'
```

### Separación de Componentes Cliente/Servidor
```typescript
// Componentes servidor (por defecto)
export function FormList({ workspaceId }: { workspaceId: string }) { ... }

// Componentes cliente (explícito)
'use client'
export function FormBuilderCanvas() { ... }
```

### Tipos TypeScript Organizados
```typescript
// src/types/forms.ts
export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'file'
  label: string
  helpText?: string
  required: boolean
  order: number
  properties?: Record<string, any>
}

export interface FormTemplate {
  id: string
  name: string
  description?: string
  fields: FormField[]
  isGlobal: boolean
  createdBy: User
  createdAt: Date
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  files: FormResponseFile[]
  status: 'new' | 'reviewed' | 'processed'
  submittedAt: Date
}
```

## Consideraciones de Arquitectura

### Reutilización de Patrones Existentes
- **Server Actions**: Continuar usando el patrón de `actions.ts` para mutaciones
- **Service Layer**: Mantener la separación de lógica de negocio en servicios
- **Middleware**: Extender el middleware existente para proteger rutas de formularios
- **Validación Zod**: Usar esquemas Zod para todas las validaciones de datos

### Escalabilidad
- **Modularidad**: Cada funcionalidad en su propio módulo/directorio
- **Lazy Loading**: Componentes pesados cargados bajo demanda
- **Optimistic Updates**: Para mejor UX en acciones del form builder
- **Caching**: Aprovechar el caching de Next.js para templates y formularios

### Performance
- **Bundle Splitting**: Separar código del form builder del resto de la app
- **Image Optimization**: Para archivos subidos en formularios
- **Streaming**: Para listas grandes de respuestas
- **Edge Functions**: Para validación de tokens públicos

### Seguridad
- **Validation**: Doble validación cliente/servidor para todos los inputs
- **File Security**: Validación estricta de tipos y tamaños de archivo
- **Token Security**: Tokens criptográficamente seguros para enlaces públicos
- **Rate Limiting**: Para prevenir spam en formularios públicos
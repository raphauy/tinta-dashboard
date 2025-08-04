# Especificaciones UI/UX

## Integración con el Sistema de Diseño

### Aprovechamiento de shadcn/ui Existente
El proyecto reutilizará completamente la biblioteca de componentes shadcn/ui ya configurada, manteniendo consistencia visual con el resto de la aplicación.

#### Componentes Base Disponibles
- **Layout**: Sidebar, Sheet, Navigation Menu, Separator
- **Forms**: Input, Label, Textarea, Select, Button
- **Feedback**: Toast (Sonner), Skeleton, Tooltip, Badge
- **Data**: Table, Card, Dialog, Dropdown Menu
- **Interactive**: Avatar, Progress (para indicadores de formulario)

#### Dark Mode Existente
- **Sistema completo**: Light, dark, system preference
- **Toggle integrado**: Dropdown con opciones en header
- **CSS variables**: Personalización mediante variables CSS de shadcn/ui
- **Transiciones suaves**: UX pulida ya implementada

### Extensiones de Componentes Necesarios

#### Nuevos Componentes UI
```typescript
// src/components/ui/drag-drop.tsx
// Componentes para drag-and-drop del form builder
export const DragDropContainer = ({ children }: { children: React.ReactNode }) => { ... }
export const Draggable = ({ id, children }: { id: string, children: React.ReactNode }) => { ... }
export const Droppable = ({ onDrop, children }: { onDrop: Function, children: React.ReactNode }) => { ... }

// src/components/ui/file-upload.tsx  
// Componente avanzado de subida de archivos
export const FileUpload = ({ 
  accept, 
  maxSize, 
  multiple, 
  onUpload 
}: FileUploadProps) => { ... }

// src/components/ui/progress-indicator.tsx
// Indicador de progreso para formularios
export const FormProgress = ({ 
  currentStep, 
  totalSteps, 
  completedFields 
}: ProgressProps) => { ... }

// src/components/ui/status-badge.tsx
// Badge para estados de respuesta
export const StatusBadge = ({ 
  status, 
  variant 
}: { status: 'new' | 'reviewed' | 'processed', variant?: 'default' | 'outline' }) => { ... }
```

## Branding e Identidad Visual Tinta

### Manual de Marca Oficial
**📖 Recurso Principal**: `/docs/resources/Tinta_Guía2025_manual_de_marca.pdf`

Este documento contiene las especificaciones oficiales de marca de Tinta Agency para 2025 y debe ser consultado durante la implementación de la interfaz de usuario para:

- **Paleta de colores oficial** - Colores primarios, secundarios y tonos específicos
- **Tipografía corporativa** - Familias tipográficas, jerarquías y usos
- **Logotipos y variaciones** - Versiones principales, monocromáticas, y aplicaciones
- **Iconografía de marca** - Estilo de iconos y elementos gráficos
- **Espaciado y proporciones** - Grid system y márgenes corporativos
- **Aplicaciones en digital** - Guías específicas para aplicaciones web

### Integración de Marca
Basándose en el manual de marca oficial y los recursos disponibles en `/docs/resources/`, se implementará la identidad visual de Tinta Agency:

#### Paleta de Colores (extraer del manual de marca PDF)
```css
:root {
  /* Colores primarios Tinta - EXTRAER DEL MANUAL */
  --tinta-primary: hsl(var(--tinta-primary));
  --tinta-primary-foreground: hsl(var(--tinta-primary-foreground));
  
  /* Colores secundarios - SEGÚN MANUAL 2025 */
  --tinta-accent: hsl(var(--tinta-accent));
  --tinta-accent-foreground: hsl(var(--tinta-accent-foreground));
  
  /* Tonos de vino (específicos para la industria) - VERIFICAR CON MANUAL */
  --wine-red: hsl(var(--wine-red));
  --wine-purple: hsl(var(--wine-purple));
  --wine-gold: hsl(var(--wine-gold));
}

[data-theme="dark"] {
  /* Adaptaciones para dark mode manteniendo identidad */
  --tinta-primary: hsl(var(--tinta-primary-dark));
  --wine-red: hsl(var(--wine-red-dark));
}
```

> **⚠️ Importante**: Todos los valores de color deben extraerse directamente del manual de marca oficial para garantizar consistencia con la identidad corporativa de Tinta Agency.

#### Tipografía
- **Mantener**: Geist Sans y Geist Mono del starter kit
- **Añadir**: Variaciones de peso específicas para branding
- **Jerarquía**: H1-H6 con escalas apropiadas para forms

#### Iconografía
- **Base**: Continuar usando Lucide React
- **Extensiones**: Iconos específicos de vino/formularios donde sea apropiado
- **Consistencia**: Mantener estilo outlined/filled consistente

## Componentes Específicos del Form Builder

### 1. Constructor de Formularios (`form-builder/`)

#### Canvas Principal
```typescript
// src/components/forms/form-builder/builder-canvas.tsx
interface FormBuilderCanvasProps {
  initialFields?: FormField[]
  onSave: (fields: FormField[]) => void
  readOnly?: boolean
}

// Características:
// - Drop zone para nuevos campos
// - Campos existentes draggables y editables
// - Toolbar lateral con tipos de campo
// - Preview mode toggle
// - Save/Auto-save functionality
```

#### Paleta de Campos
```typescript
// src/components/forms/form-builder/field-palette.tsx
interface FieldPaletteProps {
  onFieldAdd: (fieldType: FieldType) => void
  availableTypes: FieldType[]
}

// Diseño:
// - Cards visuales para cada tipo de campo
// - Drag source para añadir al canvas
// - Iconos descriptivos (texto, textarea, upload)
// - Tooltips con descripción de cada tipo
```

#### Editor de Propiedades
```typescript
// src/components/forms/form-builder/field-editor.tsx
interface FieldEditorProps {
  field: FormField | null
  onUpdate: (field: FormField) => void
  onDelete: () => void
}

// Panel lateral con:
// - Propiedades básicas: label, helpText, required
// - Propiedades específicas por tipo
// - Preview del campo en tiempo real
// - Validaciones inmediatas
```

### 2. Gestión de Plantillas (`templates/`)

#### Selector de Plantillas
```typescript
// src/components/forms/templates/template-selector.tsx
interface TemplateSelectorProps {
  onSelect: (template: FormTemplate | null) => void
  workspaceId: string
}

// Diseño:
// - Grid de cards de plantillas
// - Preview modal on hover/click
// - Search/filter functionality
// - "Start from scratch" option
// - Categorización por tipo (Logo, Diseño, Marca)
```

#### Previsualización de Plantilla
```typescript
// src/components/forms/templates/template-preview.tsx
interface TemplatePreviewProps {
  template: FormTemplate
  showActions?: boolean
}

// Modal/Card con:
// - Vista previa del formulario resultante
// - Lista de campos incluidos
// - Descripción de la plantilla
// - Actions: Use Template, Edit, Delete
```

### 3. Formularios Públicos (`public/`)

#### Layout Público
```typescript
// src/components/forms/public/public-form-layout.tsx
interface PublicFormLayoutProps {
  form: Form
  children: React.ReactNode
}

// Características especiales:
// - Branding Tinta prominente
// - Sin navigation/sidebar
// - Footer con info de contacto
// - Mobile-first responsive
// - Loading states elegantes
```

#### Renderizador de Campos
```typescript
// src/components/forms/public/public-field-renderer.tsx
interface PublicFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
}

// Dinámico por tipo de campo:
// - Text: Input con validación en tiempo real
// - Textarea: Auto-resize, character count
// - File: Drag-drop zone, progress, preview
// - Consistent styling across all types
```

#### Indicador de Progreso
```typescript
// src/components/forms/public/form-progress.tsx
interface FormProgressProps {
  totalFields: number
  completedFields: number
  requiredFields: number
  completedRequired: number
}

// Visual design:
// - Progress bar con porcentaje
// - Indicador de campos requeridos vs opcionales
// - Motivacional messaging
// - Sticky position en mobile
```

## Experiencia de Usuario (UX)

### Flujos de Usuario Principales

#### 1. Agency Member - Crear Formulario
```
1. Dashboard Workspace → Ver "Forms" en sidebar
2. Click "Nuevo Formulario" → Modal de selección de plantilla
3. Seleccionar plantilla → Form Builder abre con campos pre-poblados
4. Customizar campos → Drag-drop, edit properties, preview
5. Guardar formulario → Generar enlace, configurar sharing
6. Compartir con cliente → Copy link, enviar por email
```

#### 2. Cliente - Completar Formulario
```
1. Recibir enlace → Click para abrir formulario público
2. Ver intro/descripción → Contexto claro del formulario
3. Completar campos → Validación en tiempo real, progress indicator
4. Subir archivos → Drag-drop intuitivo, preview de archivos
5. Submit → Confirmation clara, next steps
6. (Opcional) Editar → Si permitido, acceso a modificar respuestas
```

#### 3. Agency Member - Revisar Respuestas
```
1. Notification email → Nueva respuesta recibida
2. Click link en email → Direct access a respuesta
3. Revisar datos → Formatted view, download files
4. Marcar como revisado → Update status, internal notes
5. Export si necesario → PDF download, share with team
```

### Responsive Design

#### Breakpoints (siguiendo Tailwind defaults)
- **Mobile**: < 640px - Stack vertical, sidebar colapsado
- **Tablet**: 640px - 1024px - Sidebar collapsible, grid layouts
- **Desktop**: > 1024px - Full sidebar, multi-column layouts

#### Mobile-First Considerations
- **Form Builder**: Simplified interface, drawer-based editing
- **Public Forms**: Optimized for touch, large tap targets
- **File Upload**: Touch-friendly drag areas, clear feedback
- **Navigation**: Hamburger menu, bottom nav for key actions

### Patrones de Interacción

#### Loading States
```typescript
// Skeleton components para cada contexto
<FormBuilderSkeleton /> // Constructor de formularios
<ResponseTableSkeleton /> // Lista de respuestas  
<PublicFormSkeleton /> // Formularios públicos
<TemplateSelectorSkeleton /> // Selector de plantillas
```

#### Error Handling
```typescript
// Error boundaries específicos
<FormBuilderErrorBoundary /> // Errores en constructor
<PublicFormErrorBoundary /> // Errores en submission
<FileUploadErrorBoundary /> // Errores de upload

// Toast notifications para feedback inmediato
toast.success("Formulario guardado correctamente")
toast.error("Error al subir archivo: tamaño máximo 10MB")
toast.loading("Procesando respuesta...")
```

#### Micro-interactions
- **Hover states**: Subtle elevations en cards y buttons
- **Focus indicators**: Clear focus rings para accesibilidad
- **Drag feedback**: Visual cues durante drag operations
- **Upload progress**: Animated progress bars, success animations
- **Auto-save**: Subtle indicators de guardado automático

### Accesibilidad (WCAG 2.1 AA)

#### Navegación por Teclado
- **Tab order**: Lógico y predecible en form builder
- **Keyboard shortcuts**: Comunes para power users
- **Focus management**: Proper focus trapping en modals
- **Skip links**: Para navigation hacia content principal

#### Screen Reader Support
- **Aria labels**: Descriptivos para campos dinámicos
- **Live regions**: Para feedback de drag-drop y submissions
- **Semantic HTML**: Proper heading hierarchy, form structure
- **Alt text**: Para iconos e imágenes de preview

#### Visual Accessibility
- **Contrast ratios**: Cumplir AA standards en todos los themes
- **Focus indicators**: Visible en todos los interactive elements
- **Text scaling**: Responsive hasta 200% zoom
- **Color independence**: Info no depende solo de color

## Especificaciones de Performance

### Métricas Objetivo
- **Initial Load**: < 2 segundos para formularios públicos
- **Form Builder**: < 3 segundos para carga inicial
- **File Upload**: Progress feedback en < 100ms
- **Auto-save**: Debounced a 2 segundos, feedback visual

### Optimizaciones Planeadas
- **Code splitting**: Form builder como lazy component
- **Image optimization**: Next.js Image para assets
- **Bundle analysis**: Monitoring de bundle size
- **Edge caching**: Para formularios públicos frecuentes

### Error Recovery
- **Auto-save**: Prevenir pérdida de trabajo en form builder
- **Retry logic**: Para failed uploads y submissions
- **Offline support**: Basic functionality sin conexión
- **Graceful degradation**: Fallbacks para JS disabled
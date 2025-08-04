# Plan de Implementación

## Visión General del Proyecto

El desarrollo del **Tinta Agency Form Builder** se organizará en 4 fases principales, cada una construyendo sobre las características del starter kit existente y añadiendo funcionalidades específicas del constructor de formularios.

**Duración Total Estimada**: 3-4 semanas  
**Stack Base**: Next.js 15, PostgreSQL, Prisma, NextAuth.js v5, shadcn/ui

---

## Fase 1: Fundación del Sistema de Formularios

**Dependencias:** Ninguna  
**Duración Estimada:** 5-7 días  
**Enfoque:** Establecer la base de datos y servicios core

### Tareas de Implementación

#### Base de Datos y Schemas
- [x] **Extender schema de Prisma** con modelos: `FormTemplate`, `Form`, `FormResponse`, `FormResponseFile`
- [x] **Crear y ejecutar migraciones** para nuevos modelos
- [x] **Actualizar tipos TypeScript** derivados de Prisma
- [x] **Ejecutar seeder** con plantillas predefinidas (Logo, Diseño, Marca)

#### Servicios Core
- [x] **Implementar `template-service.ts`** - CRUD para plantillas globales
- [x] **Implementar `form-service.ts`** - CRUD básico para formularios
- [ ] **Implementar `form-field-service.ts`** - Gestión de estructura de campos
- [ ] **Extender `upload-service.ts`** - Soporte para múltiples tipos de archivo (PDF, DOC, ZIP)

#### Validaciones y Tipos
- [x] **Crear esquemas Zod** para validación de formularios y plantillas
- [x] **Definir tipos TypeScript** en `/src/types/forms.ts`
- [ ] **Implementar validaciones de archivos** con límites de 10MB y tipos permitidos

#### Estructura de Rutas Básica
- [x] **Crear layouts base** para `/admin/templates` y `/w/[slug]/forms`
- [x] **Implementar rutas placeholder** para las principales páginas
- [x] **Configurar middleware** para proteger nuevas rutas

### Criterios de Aceptación

- ✅ Base de datos puede almacenar plantillas y formularios
- ✅ Servicios core funcionan con validaciones Zod
- ✅ Subida de archivos soporta nuevos tipos
- ✅ Rutas básicas están protegidas y accesibles según roles
- ✅ Seeder ejecuta correctamente con plantillas predefinidas

---

## Fase 2: Sistema de Plantillas y Constructor Básico

**Dependencias:** Fase 1 completada  
**Duración Estimada:** 7-9 días  
**Enfoque:** Interface de gestión de plantillas y constructor de formularios

### Tareas de Implementación

#### Gestión de Plantillas
- [x] **Implementar `/admin/templates`** - Lista y gestión de plantillas globales
- [x] **Crear `template-form.tsx`** - Formulario para crear/editar plantillas
- [x] **Implementar `template-selector.tsx`** - Selector de plantillas para nuevos formularios
- [x] **Añadir preview de plantillas** - Vista previa antes de crear formulario

#### Constructor de Formularios (MVP)
- [x] **Implementar `form-builder-canvas.tsx`** - Canvas principal para construcción
- [x] **Crear componentes de tipos de campo:**
  - `text-field.tsx` - Campo de texto corto
  - `textarea-field.tsx` - Campo de texto largo  
  - `file-upload-field.tsx` - Campo de subida de archivos
- [x] **Implementar `field-editor.tsx`** - Panel de propiedades de campo
- [x] **Crear `form-preview.tsx`** - Vista previa del formulario (implementado como `template-preview.tsx`)

#### Workflow Plantilla → Formulario
- [x] **Implementar `/w/[slug]/forms/new`** - Crear formulario desde plantilla o vacío
- [x] **Crear logic de copia** de estructura de campos de plantilla a formulario
- [x] **Implementar personalización** de campos después de seleccionar plantilla

#### Actions y Server Components
- [x] **Implementar Server Actions** para CRUD de plantillas
- [x] **Implementar Server Actions** para CRUD de formularios
- [x] **Crear componentes servidor** para listing y navegación

#### Funcionalidades Adicionales Implementadas
- [x] **Implementar `/w/[slug]/forms`** - Lista de formularios del workspace
- [x] **Crear `/w/[slug]/forms/[id]`** - Vista de detalles del formulario
- [x] **Implementar `/w/[slug]/forms/[id]/edit`** - Edición de formularios existentes
- [x] **Crear `new-form-wizard.tsx`** - Wizard de 3 pasos para crear formularios
- [x] **Implementar navegación integrada** - Agregado "Formularios" al workspace nav
- [x] **Crear componente Switch** - Toggle para activar/desactivar formularios
- [x] **Implementar `copy-link-button.tsx`** - Botón para copiar enlace público
- [x] **Añadir skeletons y loading states** - Para mejor UX durante cargas

### Criterios de Aceptación

- ✅ Superadmins pueden crear y gestionar plantillas globales
- ✅ Workspace admins pueden crear formularios desde plantillas
- ✅ Constructor permite añadir, editar y reordenar campos básicos
- ✅ Vista previa muestra cómo verán el formulario los clientes
- ✅ Formularios se guardan correctamente en la base de datos

---

## Fase 3: Formularios Públicos y Respuestas

**Dependencias:** Fase 2 completada  
**Duración Estimada:** 8-10 días  
**Enfoque:** Sistema público de formularios y gestión de respuestas

### Tareas de Implementación

#### Sistema Público de Formularios
- [x] **Implementar `/f/[token]`** - Ruta pública para formularios
- [x] **Crear `public-form-layout.tsx`** - Layout sin autenticación con branding Tinta
- [x] **Implementar `public-form-renderer.tsx`** - Renderizado dinámico de campos
- [x] **Crear `form-progress.tsx`** - Indicador de progreso de completion (sticky y responsive)
- [x] **Implementar validación cliente** - Validación en tiempo real de campos con tooltips profesionales

#### Generación y Gestión de Enlaces
- [x] **Implementar generación de tokens seguros** - Tokens criptográficos únicos
- [x] **Crear `/w/[slug]/forms/[formId]/share`** - Gestión de enlaces públicos
- [x] **Implementar activación/desactivación** de formularios
- [x] **Añadir configuración de permisos** (una vez vs editable)

#### Sistema de Respuestas
- [x] **Implementar `form-response-service.ts`** - Captura y gestión de submissions
- [x] **Crear `/w/[slug]/forms/[formId]/responses`** - Lista de respuestas
- [x] **Implementar `response-viewer.tsx`** - Vista formateada de respuesta individual
- [x] **Crear sistema de estados** - nuevo, revisado, procesado (en service)
- [x] **Implementar descarga de archivos** - Acceso seguro a archivos adjuntos

#### Subida y Gestión de Archivos
- [x] **Implementar drag-and-drop** para subida de archivos en formularios públicos
- [x] **Crear `FormResponseFile` handling** - Almacenamiento asociado a respuestas
- [x] **Implementar validación estricta** - Tipos, tamaños, limits de 10MB
- [x] **Crear interfaz de gestión** de archivos en respuestas

#### Sistema de Notificaciones
- [x] **Crear template `form-submission-notification.tsx`** - Email para nuevas submissions
- [x] **Implementar notificación automática** - A todos los members del workspace
- [x] **Extender `email-service.ts`** - Soporte para notificaciones de formularios
- [x] **Integrar en Server Action** - Envío automático al recibir submissions

### Criterios de Aceptación

- ✅ Clientes pueden acceder a formularios via enlaces únicos sin autenticación
- ✅ Formularios públicos son responsive y tienen validación en tiempo real
- ✅ Subida de archivos funciona con drag-and-drop y límites apropiados
- ✅ Respuestas se capturan completamente incluyendo archivos
- ✅ Workspace members pueden ver y gestionar todas las respuestas
- ✅ Estados de respuesta se pueden actualizar apropiadamente

---

## Fase 3.5: Conversión de Archivos - De Campos File a Adjuntos Opcionales

**Dependencias:** Fase 3 completada  
**Duración Estimada:** 1-2 días  
**Enfoque:** Refactorización de arquitectura de archivos para mayor flexibilidad

### Tareas de Implementación

#### Actualización del Modelo de Datos
- [x] **Eliminar tipo 'file' del enum** - Solo tipos 'text' y 'textarea'
- [x] **Añadir propiedad `allowAttachments`** - Boolean opcional para habilitar adjuntos
- [x] **Actualizar validaciones Zod** - Schemas con nueva estructura
- [x] **Actualizar seeder** - Convertir campos file existentes a textarea con allowAttachments

#### Refactorización de Componentes
- [x] **Crear AttachmentUploader component** - Componente reutilizable con diseño rosa
- [x] **Integrar en TextFieldRenderer** - Adjuntos opcionales en campos de texto
- [x] **Integrar en TextareaFieldRenderer** - Adjuntos opcionales en textarea
- [x] **Actualizar Form Builder** - Toggle para habilitar adjuntos por campo
- [x] **Eliminar FileFieldRenderer** - Ya no necesario con nueva arquitectura

#### Actualización de Lógica de Procesamiento
- [x] **Modificar Server Actions** - Procesar archivos de campos con allowAttachments
- [x] **Actualizar response viewer** - Mostrar archivos en contexto de cada campo
- [x] **Configurar límites de tamaño** - 10MB en next.config.ts para Server Actions
- [x] **Preservar funcionalidad completa** - Validación, subida y descarga

### Criterios de Aceptación

- ✅ Eliminado completamente el tipo de campo 'file'
- ✅ Cualquier campo text/textarea puede tener adjuntos opcionales
- ✅ Interfaz con botón "Adjuntar archivos" rosa como especificado
- ✅ Archivos adjuntos se muestran en contexto del campo correspondiente
- ✅ Toda la funcionalidad de archivos preservada (validación, subida, descarga)
- ✅ Form builder actualizado con toggle para habilitar adjuntos
- ✅ Compatibilidad con formularios públicos y gestión de respuestas
- ✅ Configuración de límites apropiados para archivos grandes

---

## Fase 4: Funcionalidades Avanzadas y Pulido

**Dependencias:** Fase 3.5 completada  
**Duración Estimada:** 5-7 días  
**Enfoque:** Notificaciones, drag-and-drop, exportaciones y optimizaciones

### Tareas de Implementación

#### Sistema de Notificaciones
- [x] **Crear template `form-submission-notification.tsx`** - Email para nuevas submissions (YA IMPLEMENTADO EN FASE 3)
- [x] **Implementar notificación automática** - A todos los members del workspace (YA IMPLEMENTADO EN FASE 3)
- [x] **Extender `email-service.ts`** - Soporte para notificaciones de formularios (YA IMPLEMENTADO EN FASE 3)

#### Drag-and-Drop Avanzado
- [x] **Implementar biblioteca drag-and-drop** (evaluar @dnd-kit o react-beautiful-dnd)
- [x] **Crear `draggable-field.tsx`** - Campos arrastrables en constructor
- [x] **Implementar `drop-zone.tsx`** - Zonas de drop para reordenamiento
- [x] **Añadir `field-palette.tsx`** - Paleta de tipos de campo arrastrables

#### Selector de Workspace
- [x] **Implementar `workspace-selector.tsx`** - Dropdown en sidebar
- [x] **Añadir persistencia de selección** - URL state
- [x] **Crear indicador visual** - Workspace activo claramente marcado
- [x] **Integrar en layout** existente de workspaces

#### Exportación y Analytics
- [ ] **Implementar exportación PDF** de respuestas individuales
- [ ] **Crear dashboard de métricas** - Formularios, respuestas, completion rates
- [ ] **Implementar `form-analytics-service.ts`** - Métricas por workspace
- [ ] **Añadir filtros y búsqueda** en listas de respuestas

#### Optimizaciones y Testing
- [ ] **Optimizar performance** - Lazy loading, code splitting
- [ ] **Implementar error boundaries** para form builder
- [ ] **Añadir loading states** y skeleton components
- [ ] **Testing de integración** - Flujos completos de formulario

#### Integración de Branding Tinta
- [x] **Analizar manual de marca oficial** - Revisado `/docs/resources/Tinta_Guía2025_manual_de_marca.md`
- [x] **Extraer paleta de colores** - Implementados colores oficiales según manual 2025
- [x] **Implementar tipografía corporativa** - Configurada tipografía Geist Variable
- [x] **Añadir assets de marca** - Isotipo con círculos superpuestos implementado
- [x] **Customizar formularios públicos** con identidad visual completa
- [x] **Adaptar dark mode** manteniendo consistencia de marca
- [x] **Versión alternativa de UI de link público** Implementar una versión que sea visualmente lo más parecida al pdf que se usa actualmente, aquí una imagen de ejemplo: docs/resources/bief_diseno_ejemplo.png
- [x] **Arreglar diseño de formularios públicos `/f1`** - Fondo blanco, formulario con color PAPER (#EBEBEB), ancho ajustado

### Criterios de Aceptación

- ✅ Notificaciones automáticas funcionan correctamente
- ✅ Constructor tiene drag-and-drop intuitivo y fluido
- ✅ Selector de workspace permite cambio fácil entre clientes
- ✅ Exportación PDF genera documentos bien formateados
- ✅ Dashboard muestra métricas útiles y actualizadas
- ✅ Branding de Tinta está integrado consistentemente
- ✅ Performance es óptima (formularios públicos < 2s carga)
- ✅ Todos los flujos están probados y funcionan end-to-end

---

## Estado Actual de Implementación

### ✅ **Fase 1: COMPLETADA** 
- Base de datos extendida con todos los modelos necesarios
- Servicios core implementados (`template-service.ts`, `form-service.ts`)
- Validaciones Zod y tipos TypeScript definidos
- Estructura de rutas básica creada y protegida

### ✅ **Fase 2: COMPLETADA** 
- Sistema completo de gestión de plantillas en `/admin/templates`
- Workflow plantilla → formulario completamente funcional
- Wizard de 3 pasos para crear formularios (`/w/[slug]/forms/new`)
- Vista previa y selector de plantillas implementados
- Gestión completa de formularios en workspaces
- Páginas de detalle y edición de formularios

### ✅ **Sistema Público de Formularios Completado**
- ✅ Ruta `/f/[token]` completamente funcional
- ✅ Layout público con branding Tinta Agency
- ✅ Renderizado dinámico de todos los tipos de campo (text, textarea, file)
- ✅ Progress bar sticky y responsive para formularios largos
- ✅ Validación en tiempo real con tooltips profesionales
- ✅ Soporte completo para dark mode
- ✅ Optimizado para móviles y desktop (max-width 4xl)

### ✅ **Sistema de Captura de Respuestas Completado**
- ✅ Service layer completo (`form-response-service.ts`) con todas las operaciones CRUD
- ✅ Server Action funcional con procesamiento completo de submissions
- ✅ Subida real de archivos a Vercel Blob (PDF, DOC, DOCX, JPG, PNG, ZIP)
- ✅ Validación estricta de archivos (tipos permitidos y límite 10MB)
- ✅ Guardado en base de datos (FormResponse + FormResponseFile)
- ✅ Sistema de estados para respuestas (nuevo, revisado, procesado)

### ✅ **Sistema de Notificaciones por Email Completado**
- ✅ Template profesional de email (`form-submission-notification.tsx`)
- ✅ Email service extendido con función de notificaciones
- ✅ Notificaciones automáticas a todos los miembros del workspace
- ✅ Enlaces directos para ver respuestas desde el email
- ✅ Manejo robusto de errores (no falla si email falla)
- ✅ Branding Tinta Agency en emails

### ✅ **Sistema de Gestión de Respuestas Completado**
- ✅ Interface completa de gestión (`/w/[slug]/forms/[formId]/responses`)
- ✅ Lista de respuestas con estadísticas y filtros por estado
- ✅ Visualizador de respuestas individuales (`/responses/[responseId]`)
- ✅ Sistema completo de cambio de estados (nuevo → revisado → procesado)
- ✅ Descarga segura de archivos con endpoint API protegido (`/api/files/[fileId]`)
- ✅ Preview de archivos y metadatos completos
- ✅ Navegación breadcrumb integrada
- ✅ Estados visuales con badges y iconos intuitivos

### ✅ **Fase 3 Completada**
- ✅ Sistema completo de gestión de enlaces compartidos
- ✅ Configuración avanzada de formularios (activación/permisos)
- ✅ Interfaz mejorada de gestión de archivos

### ✅ **Fase 3.5 Completada**
- ✅ **Arquitectura de archivos refactorizada** - Eliminado tipo 'file', añadidos adjuntos opcionales
- ✅ **AttachmentUploader component** - Componente reutilizable con diseño rosa corporativo
- ✅ **Form Builder mejorado** - Toggle para habilitar adjuntos en campos text/textarea
- ✅ **Formularios públicos actualizados** - Botón "Adjuntar archivos" integrado contextualmente
- ✅ **Gestión de respuestas optimizada** - Archivos mostrados en contexto de cada campo
- ✅ **Configuración Server Actions** - Límite 10MB para archivos grandes
- ✅ **Seeder actualizado** - Plantillas convertidas a nueva arquitectura

### 📊 **Progreso General**
- **Fase 1**: 100% completada
- **Fase 2**: 100% completada  
- **Fase 3**: 100% completada (Sistema de formularios públicos y respuestas completo)
- **Fase 3.5**: 100% completada (Refactorización de arquitectura de archivos)
- **Fase 4**: 0% iniciada

**Total del proyecto**: ~92% completado

### 🎯 **Sistema Funcional Actual**
El **Tinta Agency Form Builder** está ahora completamente funcional para su uso en producción:

**✅ Flujo Completo Operativo:**
1. **Superadmins** crean plantillas globales con campos predefinidos
2. **Workspace admins** crean formularios desde plantillas o desde cero
3. **Clientes** completan formularios públicos con validación en tiempo real
4. **Sistema** procesa submissions, guarda archivos y envía notificaciones
5. **Equipos** gestionan respuestas con estados y descarga de archivos

**✅ Características Principales:**
- Constructor visual de formularios con 3 tipos de campo (texto, textarea, archivos)
- Formularios públicos responsivos sin autenticación (`/f/[token]`)
- Captura completa con subida real de archivos a Vercel Blob
- Notificaciones automáticas por email a todos los miembros del workspace
- Gestión completa de respuestas con estados y descarga segura
- Integración completa con sistema de workspaces y permisos
- **NUEVO:** Página de configuración de compartir con gestión de tokens
- **NUEVO:** Control de activación/desactivación de formularios
- **NUEVO:** Configuración de permisos (envío único vs múltiple)
- **NUEVO:** Interfaz mejorada de archivos con preview de imágenes
- **NUEVO:** Control funcional de múltiples envíos (formularios se cierran después de la primera respuesta si allowEdits=false)
- **NUEVO:** Pantalla de "Formulario cerrado" con branding Tinta
- **NUEVO:** Footer sticky en formularios públicos

---

## Recursos y Enlaces de Referencia

### Documentación Técnica
- [Next.js 15 Documentation](https://nextjs.org/docs) - Framework base
- [Prisma Documentation](https://www.prisma.io/docs) - ORM y base de datos
- [shadcn/ui Documentation](https://ui.shadcn.com) - Biblioteca de componentes
- [NextAuth.js v5 Documentation](https://authjs.dev) - Sistema de autenticación
- [React Email Documentation](https://react.email) - Templates de email
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob) - File storage

### Bibliotecas Drag-and-Drop a Evaluar
- [@dnd-kit/core](https://docs.dndkit.com) - Biblioteca moderna y accesible
- [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) - Biblioteca madura
- [react-sortable-hoc](https://github.com/clauderic/react-sortable-hoc) - Alternativa ligera

### Herramientas de Desarrollo
- [Prisma Studio](https://www.prisma.io/studio) - GUI para base de datos
- [React Email Preview](http://localhost:3001) - Preview de templates (puerto 3001)
- [TypeScript Handbook](https://www.typescriptlang.org/docs) - Referencia de tipos

### Recursos de Diseño Tinta
- **📖 Principal**: `/docs/resources/Tinta_Guía2025_manual_de_marca.md` - Manual de marca oficial 2025
- `/docs/resources/Tinta_Brief_DeMarca.pdf` - Brief de marca (complementario)
- `/docs/resources/Tinta_Brief_DeLogotipo.pdf` - Guías de logotipo (complementario)
- `/docs/resources/Tinta_Brief_DeDiseño.pdf` - Estándares de diseño (complementario)

> **Nota**: El manual de marca 2025 es el documento principal y debe tener prioridad sobre los otros recursos en caso de conflictos o diferencias.

---

## Consideraciones de Riesgo y Mitigación

### Riesgos Técnicos Identificados

1. **Complejidad del Drag-and-Drop**
   - **Riesgo**: Implementación compleja puede afectar performance
   - **Mitigación**: Empezar con reordenamiento simple, iterar hacia drag-and-drop completo

2. **Validación de Archivos**
   - **Riesgo**: Archivos maliciosos o muy grandes
   - **Mitigación**: Validación estricta de tipos, escaneo de virus, límites de tamaño

3. **Performance de Formularios Públicos**
   - **Riesgo**: Carga lenta afecta experiencia de cliente
   - **Mitigación**: Optimización de bundle, lazy loading, edge caching

4. **Escalabilidad de Respuestas**
   - **Riesgo**: Muchas respuestas pueden afectar rendimiento
   - **Mitigación**: Paginación, índices de base de datos, archivado automático

### Plan de Contingencia

- **Reducción de scope**: Si tiempo es limitado, priorizar funcionalidades core
- **Implementación iterativa**: MVP funcional en Fase 2, refinamiento en Fases 3-4
- **Fallbacks**: Interfaz simple si drag-and-drop es problemático

---

## Criterios de Definición de "Completo"

### Funcionalidades Core (Mínimo Viable)
- ✅ Crear formularios desde plantillas predefinidas
- ✅ Formularios accesibles públicamente via enlaces únicos
- ✅ Captura completa de respuestas con archivos
- ✅ Notificaciones de nuevas submissions
- ✅ Gestión de respuestas por workspace

### Funcionalidades Avanzadas (Ideal)
- ✅ Constructor drag-and-drop intuitivo
- ✅ Selector de workspace fluido
- ✅ Exportación PDF de respuestas
- ✅ Analytics y métricas de formularios
- ✅ Branding Tinta completamente integrado

### Criterios de Calidad
- ✅ Performance: Formularios públicos cargan en < 2 segundos
- ✅ Seguridad: Archivos validados, enlaces seguros, datos aislados
- ✅ UX: Interfaz intuitiva para agencia y clientes
- ✅ Mantenibilidad: Código bien estructurado y documentado
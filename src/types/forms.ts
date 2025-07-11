import { type FormTemplate, type Form, type FormResponse, type FormResponseFile, type User, type Workspace, ResponseStatus } from "@prisma/client"

// Tipos base para campos de formulario
export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'file'
  label: string
  helpText?: string
  required: boolean
  order: number
  properties?: Record<string, unknown>
}

// Tipos para plantillas de formulario
export interface FormTemplateWithCreator extends FormTemplate {
  createdBy: Pick<User, 'id' | 'name' | 'email'>
}

export interface FormTemplateWithStats extends FormTemplateWithCreator {
  _count: {
    forms: number
  }
}

// Tipos para formularios
export interface FormWithWorkspace extends Form {
  workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
}

export interface FormWithTemplate extends Form {
  template?: Pick<FormTemplate, 'id' | 'name'> | null
}

export interface FormWithRelations extends Form {
  workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
  template?: Pick<FormTemplate, 'id' | 'name'> | null
  createdBy: Pick<User, 'id' | 'name' | 'email'>
  _count: {
    responses: number
  }
}

export interface FormWithWorkspaceUsers extends Form {
  workspace: Workspace & {
    users: Array<{
      user: Pick<User, 'id' | 'name' | 'email'>
    }>
  }
}

// Tipos para respuestas de formulario
export interface FormResponseWithFiles extends FormResponse {
  files: FormResponseFile[]
}

export interface FormResponseWithForm extends FormResponse {
  files: FormResponseFile[]
  form: Form & {
    workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
  }
}

export interface FormResponseForNotification extends FormResponse {
  files: FormResponseFile[]
  form: Form & {
    workspace: Workspace & {
      users: Array<{
        user: {
          id: string
          name: string | null
          email: string
        }
      }>
    }
  }
}

// Tipos para estadísticas
export interface FormStats {
  total: number
  active: number
  inactive: number
  withResponses: number
}

export interface ResponseStats {
  total: number
  new: number
  reviewed: number
  processed: number
}

export interface GlobalResponseStats extends ResponseStats {
  today: number
}

export type WorkspaceResponseStats = ResponseStats

// Tipos para datos de formulario público
export interface PublicFormData {
  [fieldId: string]: string | string[] | File[]
}

export interface FormSubmissionResult {
  success: boolean
  responseId?: string
  errors?: string[]
  missingFields?: string[]
}

// Tipos para configuración de campos
export interface TextFieldProperties {
  placeholder?: string
  maxLength?: number
  pattern?: string
}

export interface TextareaFieldProperties {
  placeholder?: string
  maxLength?: number
  rows?: number
}

export interface FileFieldProperties {
  accept?: string[]
  maxSize?: number
  multiple?: boolean
  maxFiles?: number
}

// Union type para propiedades específicas por tipo de campo
export type FieldProperties = 
  | TextFieldProperties 
  | TextareaFieldProperties 
  | FileFieldProperties

// Tipos para el constructor de formularios
export interface FormBuilderState {
  fields: FormField[]
  selectedField: FormField | null
  previewMode: boolean
  isDirty: boolean
}

export interface FormBuilderAction {
  type: 'ADD_FIELD' | 'UPDATE_FIELD' | 'DELETE_FIELD' | 'REORDER_FIELDS' | 'SELECT_FIELD' | 'TOGGLE_PREVIEW' | 'RESET_FORM'
  payload?: unknown
}

// Tipos para validación de formularios
export interface FieldValidationError {
  fieldId: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FieldValidationError[]
}

// Tipos para filtros y búsqueda
export interface FormFilters {
  status?: 'active' | 'inactive' | 'all'
  template?: string
  creator?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface ResponseFilters {
  status?: ResponseStatus | 'all'
  form?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

// Tipos para exportación
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json'
  includeFiles: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

// Constantes para tipos de campo
export const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  FILE: 'file'
} as const

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES]

// Constantes para estados de respuesta
export const RESPONSE_STATUSES = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  PROCESSED: 'processed'
} as const

export type ResponseStatusType = typeof RESPONSE_STATUSES[keyof typeof RESPONSE_STATUSES]

// Tipos para notificaciones
export interface FormNotificationData {
  formName: string
  workspaceName: string
  responseId: string
  submissionDate: Date
  viewResponseUrl: string
}

// Tipos para permisos de formulario
export interface FormPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  canViewResponses: boolean
}

// Tipos para análisis de formularios
export interface FormAnalytics {
  totalViews: number
  totalSubmissions: number
  conversionRate: number
  averageCompletionTime: number
  abandonmentRate: number
  popularFields: Array<{
    fieldId: string
    fieldLabel: string
    completionRate: number
  }>
}
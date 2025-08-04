import React from 'react'
import { getTintaColor } from '@/lib/tinta-colors'
import { type ResponseWithForm } from '@/services/form-response-service'
import { type FormField } from '@/types/forms'

interface ResponsePDFTemplateProps {
  response: ResponseWithForm
  logoUrl?: string
}

export function ResponsePDFTemplate({ response }: ResponsePDFTemplateProps) {
  const { form, data: responseData, files, submittedAt } = response
  const fields = (form.fields as unknown) as FormField[]
  const sortedFields = fields.sort((a, b) => a.order - b.order)
  const circleColor = getTintaColor(form.color || 'rosaVino') || '#DDBBC0'

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  // Función para obtener el ícono del tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦'
    return '📎'
  }

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
          }

          /* Header estilo PDF */
          .header-section {
            padding: 32px 48px 24px 48px;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }

          .title-section {
            flex: 1;
          }

          .title-with-circle {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: -8px;
          }

          .main-title {
            font-size: 48px;
            font-weight: 700;
            line-height: 1;
            letter-spacing: -0.02em;
            color: #8A8A7C;
          }

          .color-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .subtitle {
            font-size: 48px;
            font-weight: 700;
            line-height: 1;
            letter-spacing: -0.02em;
            color: #8A8A7C;
          }

          .metadata-section {
            width: 320px;
            margin-top: 8px;
          }

          .metadata-item {
            display: flex;
            align-items: baseline;
            gap: 12px;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 4px;
            margin-bottom: 12px;
          }

          .metadata-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #999;
            font-weight: 500;
            white-space: nowrap;
          }

          .metadata-value {
            font-size: 14px;
            color: #666;
            flex: 1;
            text-align: right;
          }

          .divider {
            border-bottom: 2px solid #e5e5e5;
            margin: 0 48px;
          }

          .description-section {
            text-align: center;
            padding: 16px 48px 24px 48px;
          }

          .description {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.02em;
            color: #8A8A7C;
          }

          /* Contenido del formulario */
          .content {
            padding: 32px 48px 48px 48px;
          }

          .field-container {
            margin-bottom: 32px;
            page-break-inside: avoid;
          }

          .field-number {
            font-size: 14px;
            color: #999;
            margin-bottom: 4px;
          }

          .field-label {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }

          .field-value {
            font-size: 14px;
            color: #555;
            padding: 12px 16px;
            background-color: #f9f9f9;
            border-radius: 6px;
            border: 1px solid #e5e5e5;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .field-value.empty {
            color: #999;
            font-style: italic;
          }

          /* Archivos adjuntos */
          .files-section {
            margin-top: 16px;
            padding: 16px;
            background-color: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
          }

          .files-title {
            font-size: 12px;
            font-weight: 600;
            color: #444;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
          }

          .file-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 8px;
          }

          .file-icon {
            font-size: 20px;
          }

          .file-info {
            flex: 1;
          }

          .file-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .file-meta {
            font-size: 12px;
            color: #666;
          }

          /* Imágenes embebidas */
          .image-preview {
            margin-top: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
          }

          .image-preview img {
            width: 100%;
            height: auto;
            display: block;
            max-height: 400px;
            object-fit: contain;
            background-color: #f9f9f9;
          }

          /* Footer */
          .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 24px 48px;
            border-top: 1px solid #e5e5e5;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #999;
            background-color: white;
          }

          .footer-logo {
            font-weight: 700;
            color: #143F3B;
            font-size: 14px;
            letter-spacing: 0.05em;
          }

          .footer-info {
            text-align: right;
          }

          /* Para páginas adicionales */
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page {
              margin: 0;
              page-break-after: always;
            }
            
            .field-container {
              page-break-inside: avoid;
            }
            
            .image-preview {
              page-break-inside: avoid;
            }
          }
        ` }} />
      </head>
      <body>
        <div className="page">
          {/* Header */}
          <div className="header-section">
            <div className="header-content">
              <div className="title-section">
                {form.title2 && form.color ? (
                  <div>
                    <div className="title-with-circle">
                      <h1 className="main-title">{form.title}</h1>
                      <div 
                        className="color-circle" 
                        style={{ backgroundColor: circleColor }}
                      />
                    </div>
                    <h2 className="subtitle">{form.title2}</h2>
                  </div>
                ) : (
                  <h1 className="main-title">{form.title}</h1>
                )}
              </div>
              
              <div className="metadata-section">
                <div className="metadata-item">
                  <div className="metadata-label">NOMBRE DEL PROYECTO</div>
                  <div className="metadata-value">{form.projectName || "—"}</div>
                </div>
                <div className="metadata-item">
                  <div className="metadata-label">CLIENTE</div>
                  <div className="metadata-value">{form.client || form.workspace.name}</div>
                </div>
                <div className="metadata-item">
                  <div className="metadata-label">FECHA DE ENVÍO</div>
                  <div className="metadata-value">
                    {new Date(submittedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="divider" />
          
          {/* Descripción */}
          {form.subtitle && (
            <>
              <div className="description-section">
                <p className="description">{form.subtitle}</p>
              </div>
              <div className="divider" />
            </>
          )}
          
          {/* Contenido */}
          <div className="content">
            {sortedFields.map((field, index) => {
              const fieldValue = responseData && typeof responseData === 'object' && !Array.isArray(responseData) 
                ? (responseData as Record<string, unknown>)[field.id] as string | undefined
                : undefined
              const fieldFiles = files.filter(file => file.fieldName === field.id)
              const fieldNumber = String(index + 1).padStart(2, '0')
              
              return (
                <div key={field.id} className="field-container">
                  <div className="field-number">{fieldNumber}</div>
                  <div className="field-label">{field.label}</div>
                  
                  {/* Valor del campo */}
                  <div className={`field-value ${!fieldValue ? 'empty' : ''}`}>
                    {fieldValue || '(Sin respuesta)'}
                  </div>
                  
                  {/* Archivos adjuntos */}
                  {fieldFiles.length > 0 && (
                    <div className="files-section">
                      <div className="files-title">Archivos adjuntos</div>
                      {fieldFiles.map((file) => {
                        const isImage = file.fileType.startsWith('image/')
                        
                        return (
                          <div key={file.id}>
                            <div className="file-item">
                              <div className="file-icon">
                                {getFileIcon(file.fileType)}
                              </div>
                              <div className="file-info">
                                <div className="file-name">{file.fileName}</div>
                                <div className="file-meta">
                                  {formatFileSize(file.fileSize)} • {file.fileType}
                                </div>
                              </div>
                            </div>
                            
                            {/* Mostrar preview de imágenes */}
                            {isImage && (
                              <div className="image-preview">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={file.fileUrl} 
                                  alt={file.fileName}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="footer">
            <div className="footer-logo">TINTA</div>
            <div className="footer-info">
              <div>Respuesta ID: {response.id}</div>
              <div>Generado el {new Date().toLocaleDateString('es-ES')}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
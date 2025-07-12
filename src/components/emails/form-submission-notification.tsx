import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface FormSubmissionNotificationProps {
  recipientName?: string
  formName?: string
  workspaceName?: string
  submittedAt?: string
  fieldsCount?: number
  filesCount?: number
  viewUrl?: string
}

export default function FormSubmissionNotification({
  recipientName = "Miembro del equipo",
  formName = "Brief de Marca",
  workspaceName = "Vinos del Valle",
  submittedAt = "Hoy a las 14:30",
  fieldsCount = 5,
  filesCount = 2,
  viewUrl = "https://dashboard.tinta.wine/w/workspace/forms/form-id/responses/response-id"
}: FormSubmissionNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Nueva respuesta recibida para el formulario &ldquo;{formName}&rdquo; de {workspaceName}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[580px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header with Tinta branding */}
              <Section 
                className="text-white text-center py-4" 
                style={{
                  background: '#143F3B', 
                  color: '#ffffff', 
                  textAlign: 'center', 
                  padding: '16px 0'
                }}
              >
                <Container className="px-4">
                  <Heading 
                    className="text-lg font-bold m-0 text-white" 
                    style={{color: '#ffffff', margin: 0}}
                  >
                    Tinta Agency
                  </Heading>
                  <Text 
                    className="text-white mt-1 mb-0 text-sm opacity-90" 
                    style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}
                  >
                    Embajadores de la cultura del vino
                  </Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-4 pb-3">
                <Heading className="text-gray-900 text-xl font-semibold mb-3 mt-0">
                  ¡Nueva respuesta recibida! 📋
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  Hola <strong>{recipientName}</strong>,
                </Text>

                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  Se ha recibido una nueva respuesta para el formulario{" "}
                  <strong>&ldquo;{formName}&rdquo;</strong> del cliente{" "}
                  <strong>{workspaceName}</strong>.
                </Text>

                {/* Form details */}
                <Section 
                  className="rounded-lg p-4 mb-4"
                  style={{
                    backgroundColor: '#EBEBEB',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}
                >
                  <Text className="text-gray-800 text-sm font-medium mb-2 mt-0">
                    📊 Detalles de la respuesta:
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1 mt-0">
                    <strong>Formulario:</strong> {formName}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1 mt-0">
                    <strong>Cliente:</strong> {workspaceName}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1 mt-0">
                    <strong>Enviado:</strong> {submittedAt}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1 mt-0">
                    <strong>Campos completados:</strong> {fieldsCount}
                  </Text>
                  {filesCount > 0 && (
                    <Text className="text-gray-600 text-sm mb-0 mt-0">
                      <strong>Archivos adjuntos:</strong> {filesCount}
                    </Text>
                  )}
                </Section>

                <Text className="text-gray-600 mb-4 leading-6 text-sm">
                  Esta respuesta ha sido marcada como{" "}
                  <span 
                    style={{
                      backgroundColor: '#DDBBC0',
                      color: '#2E2E2E',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    nueva
                  </span>{" "}
                  y está esperando tu revisión.
                </Text>

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={viewUrl}
                    className="text-white font-semibold py-3 px-6 rounded-lg text-base inline-block no-underline"
                    style={{
                      backgroundColor: '#143F3B',
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Ver Respuesta Completa
                  </Button>
                </Section>

                <Text className="text-gray-500 text-xs leading-4 mb-4 text-center">
                  Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                </Text>

                <Section 
                  className="rounded-lg p-3 mb-4"
                  style={{
                    backgroundColor: '#EBEBEB',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <Text 
                    className="text-xs m-0 word-break-all font-mono"
                    style={{color: '#143F3B', fontSize: '12px', margin: 0, fontFamily: 'monospace'}}
                  >
                    {viewUrl}
                  </Text>
                </Section>

                {/* Next steps */}
                <Section 
                  className="rounded-lg p-3 mb-4"
                  style={{
                    backgroundColor: '#E2E369',
                    border: '1px solid #AE8928',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <Text 
                    className="text-xs m-0 font-medium"
                    style={{color: '#2E2E2E', fontSize: '12px', margin: 0, fontWeight: '500'}}
                  >
                    💡 <strong>Próximos pasos:</strong> Revisa la respuesta, descarga los archivos si es necesario 
                    y marca como &ldquo;revisado&rdquo; cuando hayas completado tu análisis.
                  </Text>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Todas las respuestas de formularios se almacenan de forma segura y están disponibles 
                  para todos los miembros del workspace de {workspaceName}.
                </Text>
              </Section>

              {/* Footer */}
              <Section 
                className="px-4 py-3"
                style={{
                  backgroundColor: '#EBEBEB',
                  borderTop: '1px solid #d1d5db',
                  padding: '12px 16px'
                }}
              >
                <Text 
                  className="text-xs text-center m-0"
                  style={{color: '#6b7280', fontSize: '12px', textAlign: 'center', margin: 0}}
                >
                  Esta notificación fue enviada porque eres miembro del workspace &ldquo;{workspaceName}&rdquo; en Tinta Agency.
                </Text>
                <Text 
                  className="text-xs text-center mt-1 mb-0"
                  style={{color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '4px 0 0 0'}}
                >
                  © 2025 Tinta Agency. Embajadores de la cultura del vino.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
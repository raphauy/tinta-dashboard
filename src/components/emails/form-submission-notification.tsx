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
  appName?: string
}

export default function FormSubmissionNotification({
  recipientName = "Miembro del equipo",
  formName = "Brief de Marca",
  workspaceName = "Vinos del Valle",
  submittedAt = "Hoy a las 14:30",
  fieldsCount = 5,
  filesCount = 2,
  viewUrl = "https://dashboard.tinta.wine/w/workspace/forms/form-id/responses/response-id",
  appName = "Tinta Agency"
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-4" 
                style={{
                  background: 'linear-gradient(to right, #7c3aed, #db2777)', 
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
                    🍷 {appName}
                  </Heading>
                  <Text 
                    className="text-white mt-1 mb-0 text-sm opacity-90" 
                    style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}
                  >
                    Nueva Respuesta de Formulario
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
                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
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
                  Esta respuesta ha sido marcada como <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">nueva</span> y 
                  está esperando tu revisión.
                </Text>

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={viewUrl}
                    className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-base inline-block no-underline"
                    style={{
                      backgroundColor: '#7c3aed',
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

                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <Text className="text-purple-600 text-xs m-0 word-break-all font-mono">
                    {viewUrl}
                  </Text>
                </Section>

                {/* Next steps */}
                <Section className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <Text className="text-blue-800 text-xs m-0 font-medium">
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
              <Section className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Esta notificación fue enviada porque eres miembro del workspace &ldquo;{workspaceName}&rdquo; en {appName}.
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-1 mb-0">
                  © 2025 {appName}. Especialistas en marketing de vinos.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
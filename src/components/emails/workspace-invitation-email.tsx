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

interface WorkspaceInvitationEmailProps {
  invitedUserEmail?: string
  inviterName?: string
  workspaceName?: string
  acceptUrl?: string
  expiresInDays?: number
}

export default function WorkspaceInvitationEmail({
  invitedUserEmail = "usuario@ejemplo.com",
  inviterName = "Juan Pérez",
  workspaceName = "Mi Workspace",
  acceptUrl = "https://ejemplo.com/invite/token123",
  expiresInDays = 7
}: WorkspaceInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} te ha invitado a unirte al workspace &ldquo;{workspaceName}&rdquo; en Tinta Agency
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
                  ¡Has sido invitado! 🎉
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  <strong>{inviterName}</strong> te ha invitado a unirte al workspace{" "}
                  <strong>&ldquo;{workspaceName}&rdquo;</strong> en Tinta Agency.
                </Text>

                <Text className="text-gray-600 mb-4 leading-6 text-sm">
                  Al aceptar esta invitación podrás colaborar con el equipo, acceder a los recursos del workspace y participar en los proyectos compartidos.
                </Text>

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={acceptUrl}
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
                    Aceptar Invitación
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
                    {acceptUrl}
                  </Text>
                </Section>

                {/* Expiration notice */}
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
                    ⏰ Esta invitación expirará en {expiresInDays} día{expiresInDays !== 1 ? 's' : ''}. 
                    Asegúrate de aceptarla antes de que caduque.
                  </Text>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Si no conoces a {inviterName} o no esperabas esta invitación, puedes ignorar este email con seguridad.
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
                  Esta invitación fue enviada a {invitedUserEmail} por {inviterName} desde Tinta Agency.
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
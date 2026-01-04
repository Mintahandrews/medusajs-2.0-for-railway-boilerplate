import { Html, Body, Container, Preview, Tailwind, Head, Section, Img } from '@react-email/components'
import * as React from 'react'

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f8fa] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[0] max-w-[465px] w-full overflow-hidden bg-white">
            {/* Brand header with logo */}
            <Section className="w-full text-center" style={{ padding: '24px 0 12px 0', background: '#fff' }}>
              <Img
                src="https://letscase.up.railway.app/logo.png"
                alt="Letscase Logo"
                width={96}
                height={96}
                style={{ margin: '0 auto', display: 'block', verticalAlign: 'middle', maxWidth: '96px', maxHeight: '96px', borderRadius: '12px' }}
              />
            </Section>
            <div className="max-w-full break-words px-[20px] pb-[20px] pt-[10px]">
              {children}
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

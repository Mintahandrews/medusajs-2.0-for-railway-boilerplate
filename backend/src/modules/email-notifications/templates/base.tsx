import { Html, Body, Container, Preview, Tailwind, Head, Section, Img, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

const LOGO_URL = 'https://letscasegh.com/logo.png'
const SITE_URL = 'https://letscasegh.com'

export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f8fa] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-lg my-[40px] mx-auto p-[0] max-w-[520px] w-full overflow-hidden bg-white">
            {/* Brand header with logo */}
            <Section style={{ padding: '28px 0 16px 0', background: '#ffffff', textAlign: 'center' }}>
              <Link href={SITE_URL} style={{ textDecoration: 'none' }}>
                <Img
                  src={LOGO_URL}
                  alt="Letscase Ghana"
                  width={140}
                  height={140}
                  style={{
                    margin: '0 auto',
                    display: 'block',
                    width: '140px',
                    height: '140px',
                    objectFit: 'contain',
                    borderRadius: '16px',
                  }}
                />
              </Link>
              <Text style={{
                margin: '10px 0 0 0',
                fontSize: '11px',
                color: '#999',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Premium Phone Cases &amp; Tech Accessories
              </Text>
            </Section>
            <Hr style={{ borderColor: '#eaeaea', margin: '0' }} />
            <div className="max-w-full break-words px-[24px] pb-[24px] pt-[16px]">
              {children}
            </div>
            {/* Footer */}
            <Hr style={{ borderColor: '#eaeaea', margin: '0' }} />
            <Section style={{ padding: '16px 24px 20px', textAlign: 'center', background: '#fafafa' }}>
              <Text style={{ margin: '0 0 6px', fontSize: '12px', color: '#999' }}>
                Letscase Ghana &middot; E123 Prince Okai St, Accra
              </Text>
              <Text style={{ margin: '0', fontSize: '11px', color: '#bbb' }}>
                <Link href={SITE_URL} style={{ color: '#008080', textDecoration: 'none' }}>letscasegh.com</Link>
                {' '}&middot;{' '}
                <Link href="https://wa.me/233540451001" style={{ color: '#008080', textDecoration: 'none' }}>WhatsApp</Link>
                {' '}&middot;{' '}
                <Link href="https://www.instagram.com/letscasegh" style={{ color: '#008080', textDecoration: 'none' }}>Instagram</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

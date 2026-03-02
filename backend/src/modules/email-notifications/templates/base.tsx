import { Html, Body, Container, Preview, Tailwind, Head, Section, Img, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

const LOGO_URL = 'https://letscasegh.com/Lets%20Case%20Logo%20black.png'
const SITE_URL = 'https://letscasegh.com'
const BRAND_COLOR = '#1a1a1a'
const ACCENT_COLOR = '#008080'

export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e4e4e7] rounded-2xl my-[40px] mx-auto p-[0] max-w-[520px] w-full overflow-hidden bg-white shadow-sm">
            {/* Brand header with new logo */}
            <Section style={{ padding: '32px 24px 20px', background: '#ffffff', textAlign: 'center' }}>
              <Link href={SITE_URL} style={{ textDecoration: 'none' }}>
                <Img
                  src={LOGO_URL}
                  alt="Lets Case"
                  width={120}
                  height={120}
                  style={{
                    margin: '0 auto',
                    display: 'block',
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                  }}
                />
              </Link>
              <Text style={{
                margin: '12px 0 0 0',
                fontSize: '11px',
                color: '#a1a1aa',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Premium Phone Cases &amp; Tech Accessories
              </Text>
            </Section>
            <Hr style={{ borderColor: '#e4e4e7', margin: '0' }} />
            <div className="max-w-full break-words px-[24px] pb-[24px] pt-[20px]">
              {children}
            </div>
            {/* Footer */}
            <Hr style={{ borderColor: '#e4e4e7', margin: '0' }} />
            <Section style={{ padding: '20px 24px 24px', textAlign: 'center', background: '#fafafa' }}>
              <Text style={{ margin: '0 0 8px', fontSize: '12px', color: '#71717a', fontWeight: 500 }}>
                Lets Case Ghana &middot; Accra
              </Text>
              <Text style={{ margin: '0 0 12px', fontSize: '11px', color: '#a1a1aa' }}>
                <Link href={SITE_URL} style={{ color: ACCENT_COLOR, textDecoration: 'none' }}>letscasegh.com</Link>
                {' '}&middot;{' '}
                <Link href="https://wa.me/233540451001" style={{ color: ACCENT_COLOR, textDecoration: 'none' }}>WhatsApp</Link>
                {' '}&middot;{' '}
                <Link href="https://www.instagram.com/letscasegh" style={{ color: ACCENT_COLOR, textDecoration: 'none' }}>Instagram</Link>
              </Text>
              <Text style={{ margin: '0', fontSize: '10px', color: '#d4d4d8' }}>
                &copy; {new Date().getFullYear()} Lets Case. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

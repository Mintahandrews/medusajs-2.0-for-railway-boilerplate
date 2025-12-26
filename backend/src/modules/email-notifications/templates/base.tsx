import { Html, Body, Container, Preview, Tailwind, Head } from '@react-email/components'
import { Section, Text, Img } from '@react-email/components'
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
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                letscase: {
                  50: '#E6F3F3',
                  100: '#CCE7E7',
                  200: '#99CFCF',
                  300: '#66B7B7',
                  400: '#5BA5A5',
                  500: '#4A9B9B',
                  600: '#3B7C7C',
                  700: '#2C5D5D',
                  800: '#1E3E3E',
                  900: '#0F1F1F',
                },
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 my-auto mx-auto font-sans px-2">
          <Container className="bg-white border border-solid border-gray-200 rounded-xl my-[40px] mx-auto max-w-[500px] w-full overflow-hidden shadow-lg">
            {/* Header with Letscase branding */}
            <Section className="bg-[#4A9B9B] px-[20px] py-[24px]">
              <Text className="text-white text-[24px] font-bold text-center m-0">
                Letscase
              </Text>
              <Text className="text-white/80 text-[12px] text-center m-0 mt-1">
                Premium Tech Accessories
              </Text>
            </Section>

            {/* Content */}
            <div className="px-[24px] py-[20px] max-w-full break-words">
              {children}
            </div>

            {/* Footer */}
            <Section className="bg-gray-100 px-[24px] py-[20px] border-t border-gray-200">
              <Text className="text-gray-500 text-[12px] text-center m-0">
                © {new Date().getFullYear()} Letscase. All rights reserved.
              </Text>
              <Text className="text-gray-400 text-[11px] text-center m-0 mt-2">
                Ghana&apos;s Premier Tech Store
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

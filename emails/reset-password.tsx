import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';
import { CircleIcon } from 'lucide-react';
interface ResetPasswordEmailProps {
  username?: string;
  email: string;
  resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
  username = 'Friend',
  email,
  resetPasswordLink,
}: ResetPasswordEmailProps) => {
  const previewText = `Reset your password on ACME`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className='bg-white my-auto mx-auto font-sans px-2'>
          <Container className='border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]'>
            <Section className='mt-[32px] flex justify-center'>
              <Link href='/' className='flex items-center'>
                <CircleIcon className='h-[32px] w-[32px] text-orange-500' />
                <span className='ml-[10px] text-[24px] font-semibold text-gray-900'>
                  ACME
                </span>
              </Link>
            </Section>
            <Heading className='text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0'>
              Password Reset
            </Heading>
            <Text className='text-black text-[14px] leading-[24px]'>
              Hello {username},
            </Text>
            <Text className='text-black text-[14px] leading-[24px]'>
              Someone has requested a password reset for your ACME account.
              Click the button below to reset your password.
            </Text>
            <Section className='text-center mt-[32px] mb-[32px]'>
              <Button
                className='bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3'
                href={resetPasswordLink}
              >
                Reset Password
              </Button>
            </Section>
            <Text className='text-black text-[14px] leading-[24px]'>
              or copy and paste this URL into your browser:{' '}
              <Link
                href={resetPasswordLink}
                className='text-blue-600 no-underline'
              >
                {resetPasswordLink}
              </Link>
            </Text>
            <Hr className='border border-solid border-[#eaeaea] my-[26px] mx-0 w-full' />
            <Text className='text-[#666666] text-[12px] leading-[24px]'>
              This password reset email was intended for{' '}
              <span className='text-black'>{username}</span> and sent to{' '}
              <span className='text-black'>{email}</span>. If you were not
              expecting this password reset email, you can ignore this email. To
              keep your account secure, please{' '}
              <strong>do not forward this email to anyone</strong>.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;

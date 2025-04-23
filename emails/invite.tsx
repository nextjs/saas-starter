import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { CircleIcon } from 'lucide-react';
import * as React from 'react';
import { getURL } from '@/lib/utils';
interface InviteUserEmailProps {
  firstName?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  inviteId?: string;
  role?: string;
}

export const InviteUserEmail = ({
  firstName = 'John',
  invitedByUsername = 'ACME',
  invitedByEmail = 'acme@acme.com',
  teamName = 'ACME Team',
  inviteId = undefined,
  role = 'member',
}: InviteUserEmailProps) => {
  const previewText = `Join ${invitedByUsername} on Vercel`;
  const inviteLink = `${getURL()}/sign-up?inviteId=${inviteId}`;

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
                  You're Invited
                </span>
              </Link>
            </Section>
            <Heading className='text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0'>
              Join <strong>{teamName}</strong> on <strong>ACME</strong>
            </Heading>
            <Text className='text-black text-[14px] leading-[24px]'>
              Hello {firstName},
            </Text>
            <Text className='text-black text-[14px] leading-[24px]'>
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className='text-blue-600 no-underline'
              >
                {invitedByEmail}
              </Link>
              ) has invited you to the <strong>{teamName}</strong> team on{' '}
              <strong>ACME</strong>.
            </Text>
            <Section className='text-center mt-[32px] mb-[32px]'>
              <Button
                className='bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3'
                href={inviteLink}
              >
                Join the team
              </Button>
            </Section>
            <Text className='text-black text-[14px] leading-[24px]'>
              or copy and paste this URL into your browser:{' '}
              <Link href={inviteLink} className='text-blue-600 no-underline'>
                {inviteLink}
              </Link>
            </Text>
            <Hr className='border border-solid border-[#eaeaea] my-[26px] mx-0 w-full' />
            <Text className='text-[#666666] text-[12px] leading-[24px]'>
              This invitation was intended for{' '}
              <span className='text-black'>{firstName}</span>. This invite was
              sent by <span className='text-black'>{invitedByUsername}</span>.
              If you were not expecting this invitation, you can ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InviteUserEmail;

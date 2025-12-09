import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
} from '@react-email/components';

interface SubscriptionUpdatedEmailProps {
  name: string;
  planName: string;
  status: string;
}

export function SubscriptionUpdatedEmail({
  name,
  planName,
  status,
}: SubscriptionUpdatedEmailProps) {
  const isActive = status === 'active' || status === 'trialing';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription {isActive ? 'Updated' : 'Cancelled'}</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            {isActive
              ? `Your subscription to the ${planName} plan is now ${status}.`
              : `Your ${planName} subscription has been ${status}.`}
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.BASE_URL || 'http://localhost:3000'}/dashboard/pricing`}
            >
              Manage Subscription
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Questions? Contact our support team anytime.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
};

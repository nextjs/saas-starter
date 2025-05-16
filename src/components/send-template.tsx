interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate = ({
  firstName,
}: EmailTemplateProps) => (
  <div>
    <h1>Welcome to SaaS Stack, {firstName}!</h1>
    <p>We're thrilled to have you on board. Your journey to streamlined workflows and enhanced productivity begins now.</p>
    <p>Explore our intuitive interface, discover new features, and let us know how we can assist you in achieving your goals.</p>
    <p>Best regards,</p>
    <p>The SaaS Stack Team</p>
  </div>
);
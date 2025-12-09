import { render } from '@react-email/components';
import { sendEmail } from './service';
import { WelcomeEmail } from './templates/welcome';
import { TeamInvitationEmail } from './templates/team-invitation';
import { PasswordResetEmail } from './templates/password-reset';
import { SubscriptionUpdatedEmail } from './templates/subscription-updated';

export async function sendWelcomeEmail(to: string, name: string, teamName?: string) {
  const html = await render(<WelcomeEmail name={name} teamName={teamName} />);

  return sendEmail({
    to,
    subject: 'Welcome to Our Platform!',
    html,
  });
}

export async function sendTeamInvitationEmail(
  to: string,
  inviterName: string,
  teamName: string,
  inviteId: string
) {
  const inviteLink = `${process.env.BASE_URL || 'http://localhost:3000'}/sign-up?inviteId=${inviteId}`;
  const html = await render(
    <TeamInvitationEmail
      inviterName={inviterName}
      teamName={teamName}
      inviteLink={inviteLink}
    />
  );

  return sendEmail({
    to,
    subject: `You've been invited to join ${teamName}`,
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const html = await render(
    <PasswordResetEmail name={name} resetLink={resetLink} />
  );

  return sendEmail({
    to,
    subject: 'Reset Your Password',
    html,
  });
}

export async function sendSubscriptionUpdatedEmail(
  to: string,
  name: string,
  planName: string,
  status: string
) {
  const html = await render(
    <SubscriptionUpdatedEmail name={name} planName={planName} status={status} />
  );

  return sendEmail({
    to,
    subject: 'Subscription Update',
    html,
  });
}

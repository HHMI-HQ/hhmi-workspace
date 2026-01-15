import { Body, Container, Head, Hr, Html, Preview, Tailwind, Text } from '@react-email/components';
import { Logo, UnsubscribeButton } from '@curvenote/scms-core';
import type { DefaultEmailProps } from '@curvenote/scms-core';
import { DashboardRequestEmail } from './help-request-handlers.js';

export interface DashboardRequestEmailProps {
  requesterName: string;
  requesterEmail: string;
  recipientName?: string;
  sharePageUrl: string;
  previewText?: string;
}

export const DashboardRequestEmailTemplate = ({
  asBaseUrl,
  branding,
  unsubscribeUrl,
  previewText,
  requesterName,
  requesterEmail,
  recipientName,
  sharePageUrl,
}: DashboardRequestEmailProps & DefaultEmailProps) => {
  return (
    <Html>
      <Preview>
        {previewText || `${requesterName} has requested access to your compliance dashboard`}
      </Preview>
      <Tailwind>
        <Head />
        <Body className="px-2 mx-auto my-auto font-sans bg-white">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Logo asBaseUrl={asBaseUrl} branding={branding} />
            <DashboardRequestEmail
              requesterName={requesterName}
              requesterEmail={requesterEmail}
              recipientName={recipientName}
              sharePageUrl={sharePageUrl}
            />
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[12px] text-[#666666] leading-[24px]">
              This email was sent because {requesterName ?? 'someone'} requested access to your
              compliance dashboard. If you believe this was sent in error, please contact the
              requester directly.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

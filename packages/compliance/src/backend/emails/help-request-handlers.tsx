import { Button, Heading, Text, Section } from '@react-email/components';
import React from 'react';

/**
 * Composes the email body for a compliance report request
 */
export function ComplianceReportRequestEmail(params: {
  userName: string;
  userEmail: string;
  orcid: string;
  sanitizedMessage?: string;
}): React.ReactNode {
  const { userName, userEmail, orcid, sanitizedMessage } = params;

  return (
    <>
      <Heading className="mx-0 my-[30px] p-0 text-[24px] font-normal text-black">
        Compliance Dashboard Request
      </Heading>
      <Section className="my-[16px] p-[16px] bg-[#f4f4f4] rounded">
        <Text className="text-[14px] text-black leading-[24px] my-0">
          <strong>From:</strong> {userName} ({userEmail})
        </Text>
        <Text className="text-[14px] text-black leading-[24px] my-0">
          <strong>ORCID:</strong> {orcid}
        </Text>
      </Section>
      <Text className="text-[14px] text-black leading-[24px]">
        <strong>Issue:</strong> User has linked their ORCID on the HHMI Workspace but is not yet
        included in the HHMI compliance database.
      </Text>
      {sanitizedMessage && (
        <>
          <Text className="text-[14px] text-black leading-[24px] mt-[16px]">
            <strong>Additional Information:</strong>
          </Text>
          <Section className="my-[16px] p-[16px] bg-[#f4f4f4] rounded">
            <Text className="text-[14px] text-black leading-[24px] whitespace-pre-wrap my-0">
              {sanitizedMessage}
            </Text>
          </Section>
        </>
      )}
    </>
  );
}

/**
 * Composes the email body for a general help request
 */
export function GeneralHelpRequestEmail(params: {
  userName: string;
  userEmail: string;
  orcid?: string;
  sanitizedMessage?: string;
}): React.ReactNode {
  const { userName, userEmail, orcid, sanitizedMessage } = params;

  return (
    <>
      <Heading className="mx-0 my-[30px] p-0 text-[24px] font-normal text-black">
        Compliance Help Request
      </Heading>
      <Section className="my-[16px] p-[16px] bg-[#f4f4f4] rounded">
        <Text className="text-[14px] text-black leading-[24px] my-0">
          <strong>From:</strong> {userName} ({userEmail})
        </Text>
        {orcid && (
          <Text className="text-[14px] text-black leading-[24px] my-0">
            <strong>ORCID:</strong> {orcid}
          </Text>
        )}
      </Section>
      {sanitizedMessage && (
        <>
          <Text className="text-[14px] text-black leading-[24px]">
            <strong>Additional Information:</strong>
          </Text>
          <Section className="my-[16px] p-[16px] bg-[#f4f4f4] rounded">
            <Text className="text-[14px] text-black leading-[24px] whitespace-pre-wrap my-0">
              {sanitizedMessage}
            </Text>
          </Section>
        </>
      )}
    </>
  );
}

/**
 * Composes the email body for a dashboard sharing request
 */
export function DashboardRequestEmail(params: {
  requesterName: string;
  requesterEmail: string;
  recipientName?: string;
  sharePageUrl: string;
}): React.ReactNode {
  const { requesterName, requesterEmail, recipientName, sharePageUrl } = params;

  return (
    <>
      <Heading className="mx-0 my-[30px] p-0 text-[24px] font-normal text-black">
        Dashboard Sharing Request
      </Heading>
      <Text className="text-[14px] text-black leading-[24px]">
        Hello{recipientName ? ` ${recipientName}` : ''},
      </Text>
      <Text className="text-[14px] text-black leading-[24px]">
        <strong>{requesterName}</strong> ({requesterEmail}) has requested that you share your
        compliance dashboard with them.
      </Text>
      <Text className="text-[14px] text-black leading-[24px]">
        To grant access to your compliance dashboard, please visit the link below and use the form
        to share your dashboard with {requesterName}.
      </Text>
      <Section className="mt-[32px] mb-[32px] text-center">
        <Button
          className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
          href={sharePageUrl}
        >
          Share My Dashboard
        </Button>
      </Section>
      <Text className="text-[14px] text-black leading-[24px]">
        If you have any questions or concerns, please contact {requesterName} directly at{' '}
        {requesterEmail}.
      </Text>
    </>
  );
}

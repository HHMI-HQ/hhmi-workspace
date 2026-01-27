import { data as dataResponse } from 'react-router';
import type { SecureContext } from '@curvenote/scms-server';
import { getPrismaClient } from '@curvenote/scms-server';
import { HHMITrackEvent } from '../../analytics/events.js';
import { getEmailTemplates } from '../../client.js';
import { handleInviteNewUser } from '../compliance.share/actionHelpers.server.js';
import { addComplianceRoleToPayload } from '../../utils/analytics.server.js';

/**
 * Handler for requesting a user to share their compliance dashboard
 * Sends an email to the recipient requesting they share their dashboard
 */
export async function handleRequestDashboardShare(ctx: SecureContext, recipientUserId: string) {
  if (!recipientUserId) {
    return dataResponse(
      {
        error: {
          type: 'validation',
          message: 'Please select a user',
        },
      },
      { status: 400 },
    );
  }

  // Security check: Prevent requesting from yourself
  if (recipientUserId === ctx.user.id) {
    return dataResponse(
      {
        error: {
          type: 'validation',
          message: 'You cannot request access from yourself',
        },
      },
      { status: 400 },
    );
  }

  // Get recipient user information
  const prisma = await getPrismaClient();
  const recipient = await prisma.user.findUnique({
    where: { id: recipientUserId },
    select: {
      id: true,
      email: true,
      display_name: true,
      username: true,
    },
  });

  if (!recipient) {
    return dataResponse(
      {
        error: {
          type: 'validation',
          message: 'Recipient user not found',
        },
      },
      { status: 404 },
    );
  }

  if (!recipient.email) {
    return dataResponse(
      {
        error: {
          type: 'validation',
          message: 'Recipient user does not have an email address',
        },
      },
      { status: 400 },
    );
  }

  try {
    const requesterName = ctx.user.display_name || ctx.user.username || 'A user';
    const requesterEmail = ctx.user.email || '';
    const recipientName = recipient.display_name || recipient.username || undefined;
    const sharePageUrl = ctx.asBaseUrl('/app/compliance/share');

    // Send email notification
    await ctx.sendEmail(
      {
        eventType: 'COMPLIANCE_DASHBOARD_REQUEST',
        to: recipient.email,
        subject: `${requesterName} has requested access to your compliance dashboard`,
        templateProps: {
          requesterName,
          requesterEmail,
          recipientName,
          sharePageUrl,
        },
      },
      getEmailTemplates(),
    );

    // Track analytics event
    await ctx.trackEvent(
      HHMITrackEvent.HHMI_COMPLIANCE_DASHBOARD_REQUESTED,
      addComplianceRoleToPayload(ctx, {
        requesterUserId: ctx.user.id,
        requesterEmail: ctx.user.email,
        requesterDisplayName: ctx.user.display_name || ctx.user.username,
        recipientUserId: recipient.id,
        recipientEmail: recipient.email,
        recipientDisplayName: recipient.display_name || recipient.username,
      }),
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to send dashboard request:', error);
    return dataResponse(
      {
        error: {
          type: 'general',
          message: error instanceof Error ? error.message : 'Failed to send request',
        },
      },
      { status: 500 },
    );
  }
}

// Re-export handleInviteNewUser for convenience
export { handleInviteNewUser };

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { data } from 'react-router';
import { Library } from 'lucide-react';
import { PageFrame, SectionWithHeading, primitives } from '@curvenote/scms-core';
import { withAppContext, withValidFormData, validateFormData } from '@curvenote/scms-server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { getComplianceReportsSharedWith } from '../../backend/access.server.js';
import { ScientistListItem } from '../../components/ScientistListItem.js';
import { RequestDashboardForm } from '../../components/RequestDashboardForm.js';
import type { NormalizedScientist, ComplianceUserMetadataSection } from '../../backend/types.js';
import { fetchScientistByOrcid } from '../../backend/airtable.scientists.server.js';
import { handleRequestDashboardShare, handleInviteNewUser } from './actionHelpers.server.js';

interface LoaderData {
  scientists: NormalizedScientist[];
  complianceRole?: 'scientist' | 'lab-manager';
}

export const meta = () => {
  return [
    { title: 'Dashboards - My Compliance' },
    { name: 'description', content: 'View compliance dashboards that I have access to' },
  ];
};

/**
 * Intent types for shared dashboards actions
 */
const SharedDashboardsIntent = z.enum(['request-dashboard', 'invite-new-user']);

/**
 * Base intent schema to validate the intent field
 */
const IntentSchema = zfd.formData({
  intent: SharedDashboardsIntent,
});

/**
 * Schema for requesting a dashboard
 */
const RequestDashboardSchema = zfd.formData({
  intent: z.literal('request-dashboard'),
  recipientUserId: z.string().min(1, 'Recipient user ID is required'),
});

/**
 * Schema for inviting a new user
 */
const InviteNewUserSchema = zfd.formData({
  intent: z.literal('invite-new-user'),
  email: z.email({ message: 'Valid email is required' }),
  message: z.string().optional(),
});

export function shouldRevalidate(args?: { formAction?: string; [key: string]: any }) {
  // Prevent revalidation for dashboard request actions to avoid closing dialogs and unnecessary reloads
  const formAction = args?.formAction;
  if (formAction && typeof formAction === 'string' && formAction.includes('/compliance/shared')) {
    return false;
  }
  return true;
}

export async function action(args: ActionFunctionArgs) {
  const ctx = await withAppContext(args);

  const formData = await args.request.formData();

  // Validate intent first
  let intentData;
  try {
    intentData = validateFormData(IntentSchema, formData);
  } catch (error: any) {
    return data(
      {
        error: {
          type: 'validation',
          message: error.message ?? 'Invalid intent',
        },
      },
      { status: 400 },
    );
  }

  const intent = intentData.intent;

  switch (intent) {
    case 'request-dashboard': {
      return withValidFormData(RequestDashboardSchema, formData, async (payload) => {
        return handleRequestDashboardShare(ctx, payload.recipientUserId);
      });
    }

    case 'invite-new-user': {
      return withValidFormData(InviteNewUserSchema, formData, async (payload) => {
        return handleInviteNewUser(ctx, payload.email, payload.message);
      });
    }

    default:
      return data(
        {
          error: {
            type: 'validation',
            message: 'Invalid action',
          },
        },
        { status: 400 },
      );
  }
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData | Response> {
  const ctx = await withAppContext(args);

  const sharedReports = await getComplianceReportsSharedWith(ctx.user.id);

  // Fetch full scientist data for each shared report that has an ORCID
  const scientists: NormalizedScientist[] = [];

  await Promise.all(
    sharedReports.map(async (report) => {
      if (report.orcid) {
        try {
          const { scientist } = await fetchScientistByOrcid(report.orcid);
          if (scientist) {
            scientists.push(scientist);
          }
        } catch (error) {
          console.error(`Failed to fetch scientist data for ORCID ${report.orcid}:`, error);
        }
      }
    }),
  );

  const userData = (ctx.user.data as ComplianceUserMetadataSection) || { compliance: {} };
  const complianceRole = userData.compliance?.role;

  return {
    scientists,
    complianceRole,
  };
}

export default function SharedComplianceReportsPage({ loaderData }: { loaderData: LoaderData }) {
  const { scientists } = loaderData;

  const breadcrumbs = [
    { label: 'My Compliance', href: '/app/compliance' },
    { label: 'Dashboards', isCurrentPage: true },
  ];

  return (
    <PageFrame
      title="Dashboards that have been shared with you"
      subtitle="If other users have granted access to their dashboards, they will appear here."
      className="mx-auto max-w-screen-lg"
      breadcrumbs={breadcrumbs}
    >
      <RequestDashboardForm actionUrl="/app/compliance/shared" />

      <SectionWithHeading heading="Shared Dashboards" icon={Library}>
        {scientists.length === 0 ? (
          <primitives.Card className="p-4 bg-white">
            <div className="flex justify-center items-center py-8 w-full">
              <div className="text-gray-500 dark:text-gray-400">
                No dashboards have been shared with you yet.
              </div>
            </div>
          </primitives.Card>
        ) : (
          <div className="space-y-3">
            {scientists.map((scientist: NormalizedScientist) => (
              <primitives.Card key={scientist.id} className="p-4 bg-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <ScientistListItem
                    scientist={scientist}
                    baseUrl="/app/compliance/shared/reports"
                    showShareButton={false}
                  />
                </div>
              </primitives.Card>
            ))}
          </div>
        )}
      </SectionWithHeading>
    </PageFrame>
  );
}

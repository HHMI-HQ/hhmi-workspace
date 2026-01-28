import type { LoaderFunctionArgs } from 'react-router';
import { redirect, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { fetchScientistByOrcid } from '../backend/airtable.scientists.server.js';
import { withAppContext } from '@curvenote/scms-server';
import { PageFrame } from '@curvenote/scms-core';
import { isUserComplianceManager } from '../utils/analytics.server.js';
import { ComplianceReport } from '../components/ComplianceReport.js';
import {
  fetchEverythingCoveredByPolicy,
  fetchEverythingNotCoveredByPolicy,
} from '../backend/airtable.server.js';
import { ComplianceInfoCards } from '../components/ComplianceInfoCards.js';
import { ComplianceDashboardRequest } from '../components/ComplianceDashboardRequest.js';
import type {
  NormalizedArticleRecord,
  NormalizedScientist,
  ComplianceUserMetadataSection,
} from '../backend/types.js';

export const meta = () => {
  // Meta function runs on server, so we can't await promises here
  // Use default title since scientist is now a promise
  return [{ title: 'My Compliance Dashboard' }];
};

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData | { error: string }> {
  const ctx = await withAppContext(args);

  const orcidAccount = ctx.user.linkedAccounts.find(
    (account) => account.provider === 'orcid' && !account.pending,
  );

  // If no ORCID or pending ORCID, redirect to link page
  if (!orcidAccount) {
    throw redirect('/app/compliance/reports/me/link');
  }

  const orcid = orcidAccount.idAtProvider;
  if (!orcid) {
    return { error: 'ORCID is missing' };
  }

  // Get user's compliance metadata
  const userData = (ctx.user.data as ComplianceUserMetadataSection) || { compliance: {} };
  const dashboardRequested = userData.compliance?.dashboardRequested ?? false;
  const complianceRole = userData.compliance?.role;

  const preprintsCoveredPromise = fetchEverythingCoveredByPolicy(orcid);
  const preprintsNotCoveredPromise = fetchEverythingNotCoveredByPolicy(orcid);
  const scientistPromise = fetchScientistByOrcid(orcid);

  // Get enhancedArticleRendering flag from extension config
  const enhancedArticleRendering =
    ctx.$config.app.extensions?.['hhmi-compliance']?.enhancedArticleRendering ?? false;

  const path = new URL(args.request.url).pathname;
  return {
    orcid,
    scientist: scientistPromise,
    preprintsCovered: preprintsCoveredPromise,
    preprintsNotCovered: preprintsNotCoveredPromise,
    enhancedArticleRendering,
    dashboardRequested,
    complianceRole,
    path,
    isComplianceManager: isUserComplianceManager(ctx.user),
  };
}

interface LoaderData {
  orcid: string;
  scientist: Promise<{ scientist: NormalizedScientist | undefined; error?: string }>;
  preprintsCovered: Promise<NormalizedArticleRecord[]>;
  preprintsNotCovered: Promise<NormalizedArticleRecord[]>;
  enhancedArticleRendering: boolean;
  dashboardRequested: boolean;
  complianceRole?: 'scientist' | 'lab-manager';
  path?: string;
  isComplianceManager?: boolean;
}

export function shouldRevalidate(args?: { formAction?: string; [key: string]: any }) {
  // Prevent revalidation when help request form is submitted to avoid closing modals
  const formAction = args?.formAction;
  if (
    formAction &&
    typeof formAction === 'string' &&
    formAction.includes('/compliance/help-request')
  ) {
    return false;
  }
  return true;
}

export default function ComplianceReportPage({ loaderData }: { loaderData: LoaderData }) {
  const {
    scientist: scientistPromise,
    preprintsCovered,
    preprintsNotCovered,
    orcid,
    dashboardRequested,
  } = loaderData;
  const navigate = useNavigate();

  // Resolve scientist promise to check if scientist is not found
  const [isOrcidLinkedButNotFound, setIsOrcidLinkedButNotFound] = useState<boolean | null>(null);

  useEffect(() => {
    scientistPromise
      .then((result) => {
        setIsOrcidLinkedButNotFound(!result.scientist && !!orcid);
      })
      .catch((err) => {
        console.error('Failed to load scientist data:', err);
        setIsOrcidLinkedButNotFound(true);
      });
  }, [scientistPromise, orcid]);

  const breadcrumbs = [
    { label: 'My Compliance', href: '/app/compliance' },
    { label: 'My Compliance Dashboard', isCurrentPage: true },
  ];

  // Show not found state if scientist is not found (after promise resolves)
  if (isOrcidLinkedButNotFound === true) {
    return (
      <PageFrame
        title="My Compliance Dashboard"
        className="mx-auto max-w-screen-lg"
        description={<ComplianceInfoCards className="mt-4" dashboard={false} />}
        breadcrumbs={breadcrumbs}
      >
        <ComplianceDashboardRequest
          orcid={orcid ?? 'Unknown ORCID'}
          dashboardRequested={dashboardRequested}
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="My Compliance Dashboard"
      className="mx-auto max-w-screen-lg"
      description={<ComplianceInfoCards className="mt-4" dashboard={true} />}
      breadcrumbs={breadcrumbs}
    >
      <ComplianceReport
        orcid={orcid ?? 'Unknown ORCID'}
        scientist={scientistPromise}
        articlesCovered={preprintsCovered}
        articlesNotCovered={preprintsNotCovered}
        onShareClick={() => {
          navigate('/app/compliance/share');
        }}
        shareButtonText="Give Someone Access"
        viewContext="own"
        emptyMessageCovered="No articles covered by policy found. Only publications since the later of your HHMI hire date or January 1, 2022 are displayed."
        emptyMessageNotCovered="No articles found."
      />
    </PageFrame>
  );
}

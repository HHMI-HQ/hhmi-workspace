import { useLoaderData, useFetcher, redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { orcid, PageFrame, primitives, ui } from '@curvenote/scms-core';
import { withAppContext, userHasScopes } from '@curvenote/scms-server';
import { useState, useEffect } from 'react';
import { hhmi } from '../backend/scopes.js';
import { ComplianceInfoCards } from '../components/ComplianceInfoCards.js';

/**
 * ORCID Icon Component - Green square with white "iD" text, or inverted (white background with green text)
 */
function OrcidIcon({
  size = 16,
  className = '',
  inverted = false,
}: {
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded font-semibold ${
        inverted ? 'bg-white text-[#A6CE39] border border-[#A6CE39]' : 'bg-[#A6CE39] text-white'
      } ${className}`}
      style={{ width: size, height: size, display: 'inline-flex', verticalAlign: 'middle' }}
    >
      <span className="text-[0.6em] leading-none" style={{ lineHeight: 1 }}>
        iD
      </span>
    </div>
  );
}

export const meta = () => {
  return [{ title: 'Link Your ORCID Account - My Compliance' }];
};

export async function loader(args: LoaderFunctionArgs) {
  const ctx = await withAppContext(args);
  const orcidAccount = ctx.user.linkedAccounts.find(
    (account) => account.provider === 'orcid' && !account.pending,
  );
  if (orcidAccount) {
    throw redirect('/app/compliance/reports/me');
  }

  const isComplianceAdmin = userHasScopes(ctx.user, [hhmi.compliance.admin]);
  return {
    hasOrcid: !!orcidAccount,
    isComplianceAdmin,
  };
}

interface LoaderData {
  hasOrcid: boolean;
  isComplianceAdmin: boolean;
}

export default function LinkAccountLayout() {
  useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const [laggySubmitting, setLaggySubmitting] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setLaggySubmitting(true);
      const to = setTimeout(() => {
        setLaggySubmitting(false);
      }, 2000);
      return () => clearTimeout(to);
    }
  }, [fetcher.state]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Track the linking attempt
    await fetch('/app/settings/linked-accounts', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });
  };

  const breadcrumbs = [
    { label: 'My Compliance', href: '/app/compliance' },
    { label: 'Link Your ORCID Account', isCurrentPage: true },
  ];

  return (
    <PageFrame
      title="My Compliance Dashboard"
      className="mx-auto mb-6 max-w-screen-lg"
      description={<ComplianceInfoCards className="mt-4" />}
      breadcrumbs={breadcrumbs}
    >
      <div className="flex justify-center min-h-[60vh]">
        <div>
          <primitives.Card className="w-full max-w-2xl">
            <div className="p-6 space-y-6">
              {/* ORCID Logo and Name Header */}
              <div className="flex justify-center items-center">
                <orcid.Badge size={32} />
              </div>

              {/* Info Alert Box */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <OrcidIcon size={20} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Link your ORCID ID first
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This will give you access to many features. You only have to do this once and
                      it will unlock personalized compliance information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link Button */}
              <fetcher.Form
                method="POST"
                action="/auth/orcid?returnTo=/app/compliance/reports/me"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="provider" value="orcid" />
                <input type="hidden" name="intent" value="link" />
                <ui.StatefulButton
                  size="lg"
                  type="submit"
                  busy={fetcher.state !== 'idle' || laggySubmitting}
                  busyMessage="Connecting to ORCID..."
                  className="w-full h-12"
                >
                  <div className="flex gap-2 justify-center items-center" style={{ lineHeight: 1 }}>
                    <OrcidIcon size={20} inverted className="flex-shrink-0" />
                    <span style={{ lineHeight: 1.5 }}>Link Your ORCID Account</span>
                  </div>
                </ui.StatefulButton>
              </fetcher.Form>

              {/* Footer Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an ORCID?{' '}
                  <ui.Button variant="link" asChild className="p-0 h-auto text-sm">
                    <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer">
                      Create one for free
                    </a>
                  </ui.Button>
                </p>
              </div>
            </div>
          </primitives.Card>
        </div>
      </div>
    </PageFrame>
  );
}

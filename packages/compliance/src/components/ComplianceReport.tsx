import { useState, useEffect } from 'react';
import { BookCheckIcon, User, UserPlus } from 'lucide-react';
import { SectionWithHeading, ui, RequestHelpDialog } from '@curvenote/scms-core';
import { useCompliancePingEvent } from '../utils/analytics.js';
import { ScientistCard } from './ScientistCard.js';
import { ScientistCardSkeleton } from './ScientistCardSkeleton.js';
import { NonCoveredPublicationsSection } from './NonCoveredPublicationSection.js';
import type { NormalizedScientist, NormalizedArticleRecord } from '../backend/types.js';
import { CoveredArticleItem } from './CoveredArticleItem.js';
import { NotCoveredArticleItem } from './NotCoveredArticleItem.js';
import { CoveredPublicationSection } from './CoveredPublicationSection.js';
import { HHMITrackEvent } from '../analytics/events.js';
import type { ViewContext } from './Badges.js';
import { TimeoutErrorHandler, TimeoutErrorDisplay } from './TimeoutErrorHandler.js';

/**
 * Props for the ComplianceReport component.
 * This component is used across multiple routes, so the interface defines
 * the shared contract that all route loaders must satisfy.
 */
export interface ComplianceReportProps {
  orcid: string;
  scientist:
    | NormalizedScientist
    | undefined
    | Promise<{ scientist: NormalizedScientist | undefined; error?: string }>;
  error?: string;

  // New preprints-based data (used in compliance.reports.me)
  articlesCovered?: Promise<NormalizedArticleRecord[]>;
  articlesNotCovered?: Promise<NormalizedArticleRecord[]>;
  onShareClick?: () => void;
  shareButtonText?: string;
  viewContext: ViewContext;
  emptyMessageCovered?: string;
  emptyMessageNotCovered?: string;
}

export function ComplianceReport({
  scientist: scientistProp,
  articlesCovered,
  articlesNotCovered,
  error: errorProp,
  orcid,
  onShareClick,
  shareButtonText = 'Give Access to Someone',
  viewContext,
  emptyMessageCovered,
  emptyMessageNotCovered,
}: ComplianceReportProps) {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const pingEvent = useCompliancePingEvent();

  // Resolve scientist promise if it's a promise, otherwise use the value directly
  const [scientist, setScientist] = useState<NormalizedScientist | undefined>(
    scientistProp instanceof Promise ? undefined : scientistProp,
  );
  const [error, setError] = useState<string | undefined>(errorProp);
  const [isLoadingScientist, setIsLoadingScientist] = useState(scientistProp instanceof Promise);

  useEffect(() => {
    if (scientistProp instanceof Promise) {
      setIsLoadingScientist(true);
      scientistProp
        .then((result) => {
          setScientist(result.scientist);
          setError(result.error);
          setIsLoadingScientist(false);
        })
        .catch((err) => {
          console.error('Failed to load scientist data:', err);
          setError('Failed to load scientist data');
          setIsLoadingScientist(false);
        });
    }
  }, [scientistProp]);

  const handleShareClick = () => {
    pingEvent(HHMITrackEvent.HHMI_COMPLIANCE_REPORT_SHARE_CLICKED, {
      orcid,
      scientistName: scientist?.fullName,
    });
    onShareClick?.();
  };

  const handleHelpClick = () => {
    pingEvent(HHMITrackEvent.HHMI_COMPLIANCE_HELP_REQUESTED, {
      orcid,
      scientistName: scientist?.fullName,
      context: 'compliance-report',
    });
    setShowHelpDialog(true);
  };

  const handleHelpDialogClose = (open: boolean) => {
    setShowHelpDialog(open);
  };

  // Create a promise for timeout error handling
  const scientistPromiseForTimeout =
    scientistProp instanceof Promise
      ? scientistProp
          .then((result) => result.scientist)
          .catch((err) => {
            // Re-throw timeout errors so TimeoutErrorHandler can catch them
            if (
              err instanceof Error &&
              (err.message.includes('Server Timeout') ||
                err.message.includes('timeout') ||
                err.message.includes('Timeout'))
            ) {
              throw err;
            }
            // For other errors, return undefined so they're handled by the existing error state
            return undefined;
          })
      : Promise.resolve(scientistProp);

  return (
    <TimeoutErrorHandler promise={scientistPromiseForTimeout}>
      {({ error: timeoutError, isRetrying, retry }) => (
        <div className="space-y-8">
          {timeoutError && (
            <TimeoutErrorDisplay error={timeoutError} isRetrying={isRetrying} onRetry={retry} />
          )}
          {error && !timeoutError && (
            <div className="p-4 mb-6 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20">
              <div className="text-red-700 dark:text-red-400">
                <h3 className="mb-2 font-semibold">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          )}
          <SectionWithHeading
            heading={
              onShareClick ? (
                <div className="flex justify-between items-center">
                  <div>Profile</div>
                  <ui.Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareClick}
                    title={shareButtonText}
                  >
                    <UserPlus className="w-4 h-4 stroke-[1.5px]" /> {shareButtonText}
                  </ui.Button>
                </div>
              ) : (
                <div>Profile</div>
              )
            }
            icon={User}
          >
            {isLoadingScientist ? (
              <ScientistCardSkeleton />
            ) : (
              <>
                <ScientistCard
                  scientist={scientist}
                  emptyMessage={`No data found for ORCID: ${orcid}`}
                />
                <div className="flex justify-end items-center w-full row">
                  <ui.Button variant="link" className="text-xs" onClick={handleHelpClick}>
                    Something not right? Request help.
                  </ui.Button>
                </div>
              </>
            )}
          </SectionWithHeading>
          <RequestHelpDialog
            orcid={orcid}
            open={showHelpDialog}
            onOpenChange={handleHelpDialogClose}
            prompt="Please give us more details about what is missing or incorrect."
            title="Request Help from the Open Science Team"
            successMessage="Your request has been sent to the HHMI Open Science Team. We'll get back to you as soon as possible."
            intent="general-help"
          />
          {!isLoadingScientist && (
            <SectionWithHeading heading="Publications" icon={BookCheckIcon}>
              <ui.Tabs defaultValue="covered" className="w-full">
                <ui.TabsList>
                  <ui.TabsTrigger value="covered">Under HHMI Policy</ui.TabsTrigger>
                  <ui.TabsTrigger value="not-covered">Not under HHMI Policy</ui.TabsTrigger>
                </ui.TabsList>
                <ui.TabsContent value="covered">
                  <CoveredPublicationSection
                    publications={articlesCovered}
                    emptyMessage={emptyMessageCovered}
                    ItemComponent={CoveredArticleItem}
                    orcid={orcid}
                    scientist={scientist}
                    viewContext={viewContext}
                  />
                </ui.TabsContent>
                <ui.TabsContent value="not-covered">
                  <NonCoveredPublicationsSection
                    publications={articlesNotCovered}
                    emptyMessage={emptyMessageNotCovered}
                    ItemComponent={NotCoveredArticleItem}
                    orcid={orcid}
                    scientist={scientist}
                    viewContext={viewContext}
                  />
                </ui.TabsContent>
              </ui.Tabs>
            </SectionWithHeading>
          )}
        </div>
      )}
    </TimeoutErrorHandler>
  );
}

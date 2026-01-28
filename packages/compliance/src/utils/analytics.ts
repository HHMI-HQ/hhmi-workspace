import { usePingEvent, type EventOptions } from '@curvenote/scms-core';
import { useLoaderData, useLocation } from 'react-router';

/**
 * Interface for loader data that includes complianceRole, path, and isComplianceManager.
 * All compliance route loaders should include these fields.
 */
export interface ComplianceLoaderData {
  complianceRole?: 'scientist' | 'lab-manager';
  path?: string;
  isComplianceManager?: boolean;
  [key: string]: any;
}

/**
 * Custom hook that wraps usePingEvent and automatically adds complianceRole, path, and isComplianceManager.
 * Use this instead of usePingEvent in compliance module components.
 *
 * Requirements:
 * - All route loaders must include complianceRole (and path, isComplianceManager) in their return data
 * - Components must be rendered within routes that have loaders with this data
 */
export function useCompliancePingEvent() {
  const pingEvent = usePingEvent();
  const loaderData = useLoaderData() as ComplianceLoaderData | undefined;
  const location = useLocation();
  const complianceRole = loaderData?.complianceRole;
  const path = loaderData?.path ?? location.pathname;
  const isComplianceManager = loaderData?.isComplianceManager;

  return async (
    event: string,
    properties: Record<string, any> = {},
    opts: EventOptions = {},
  ): Promise<void> => {
    await pingEvent(
      event,
      {
        ...properties,
        complianceRole,
        path,
        isComplianceManager,
      },
      opts,
    );
  };
}

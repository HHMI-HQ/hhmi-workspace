import { usePingEvent, type EventOptions } from '@curvenote/scms-core';
import { useLoaderData } from 'react-router';

/**
 * Interface for loader data that includes complianceRole
 * All compliance route loaders should include this field
 */
export interface ComplianceLoaderData {
  complianceRole?: 'scientist' | 'lab-manager';
  [key: string]: any;
}

/**
 * Custom hook that wraps usePingEvent and automatically adds complianceRole from loader data
 * Use this instead of usePingEvent in compliance module components
 *
 * Requirements:
 * - All route loaders must include complianceRole in their return data
 * - Components must be rendered within routes that have loaders with complianceRole
 */
export function useCompliancePingEvent() {
  const pingEvent = usePingEvent();
  const loaderData = useLoaderData() as ComplianceLoaderData | undefined;
  const complianceRole = loaderData?.complianceRole;

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
      },
      opts,
    );
  };
}

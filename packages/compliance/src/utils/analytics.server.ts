import type { SecureContext } from '@curvenote/scms-server';
import type { ComplianceUserMetadataSection } from '../backend/types.js';

/**
 * Helper function to add complianceRole to analytics payloads on the server side
 */
export function addComplianceRoleToPayload(
  ctx: SecureContext,
  payload: Record<string, any>,
): Record<string, any> {
  const userData = (ctx.user.data as ComplianceUserMetadataSection) || { compliance: {} };
  const complianceRole = userData.compliance?.role;

  return {
    ...payload,
    complianceRole,
  };
}

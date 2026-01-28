import type { SecureContext } from '@curvenote/scms-server';
import type { ComplianceUserMetadataSection } from '../backend/types.js';

const COMPLIANCE_MANAGER_ROLE = 'compliance-manager';

/**
 * Returns true if the user has a role with name or id equal to 'compliance-manager' in ctx.user.roles.
 */
export function isUserComplianceManager(user: {
  roles?: Array<{ role?: { id?: string; name?: string } }>;
}): boolean {
  return user.roles?.some((r) => r.role?.name === COMPLIANCE_MANAGER_ROLE) ?? false;
}

/**
 * Helper function to add complianceRole, path, and isComplianceManager to analytics payloads on the server side.
 */
export function addComplianceRoleToPayload(
  ctx: SecureContext,
  payload: Record<string, any>,
): Record<string, any> {
  const userData = (ctx.user.data as ComplianceUserMetadataSection) || { compliance: {} };
  const complianceRole = userData.compliance?.role;
  const path = new URL(ctx.request.url).pathname;
  const isComplianceManager = isUserComplianceManager(ctx.user);

  return {
    ...payload,
    complianceRole,
    path,
    isComplianceManager,
  };
}

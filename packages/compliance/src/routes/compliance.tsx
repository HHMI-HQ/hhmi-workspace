import type { LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from 'react-router';
import { Outlet, redirect, useLoaderData } from 'react-router';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { ServerSideMenuContents } from '@curvenote/scms-core';
import { MainWrapper, SecondaryNav } from '@curvenote/scms-core';
import { userHasScopes, withAppScopedContext } from '@curvenote/scms-server';
import { buildComplianceMenu } from './menu.js';
import myComplianceIcon from '../assets/my-compliance-lock.svg';
import { getComplianceReportsSharedWith } from '../backend/access.server.js';
import { checkScientistExistsByOrcid } from '../backend/airtable.scientists.server.js';
import { hhmi } from '../backend/scopes.js';
import { extension } from '../client.js';
import type { ComplianceUserMetadataSection } from '../backend/types.js';
import type { ComplianceReportSharedWith } from '../backend/access.server.js';

interface LoaderData {
  menu: ServerSideMenuContents;
  shouldShowSecondaryNav: boolean;
  currentUserExistsInAirtable: Promise<boolean>;
  orcid?: string;
  isComplianceAdmin: boolean;
  userComplianceRole?: 'scientist' | 'lab-manager';
  sharedReports: Promise<ComplianceReportSharedWith[]>;
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData> {
  // ✅ MINIMAL: Get context (required for user data)
  const ctx = await withAppScopedContext(args, [hhmi.compliance.feature.dashboard]);
  const pathname = new URL(args.request.url).pathname;

  // ✅ MINIMAL: Extract only what's needed for redirects
  const orcidAccount = ctx.user.linkedAccounts.find(
    (account) => account.provider === 'orcid' && !account.pending,
  );
  const userData = (ctx.user.data as ComplianceUserMetadataSection) || { compliance: {} };
  const userComplianceRole = userData.compliance?.role;
  const isComplianceAdmin = userHasScopes(ctx.user, [hhmi.compliance.admin]);

  // ✅ STEP 1: Check redirects FIRST (immediate)
  // Redirect 1: No ORCID + scientist role → redirect to link page
  if (
    (pathname.endsWith('/compliance') ||
      pathname.endsWith('/compliance/reports') ||
      pathname.endsWith('/compliance/reports/me')) &&
    !orcidAccount &&
    userComplianceRole === 'scientist' &&
    !isComplianceAdmin
  ) {
    throw redirect('/app/compliance/reports/me/link');
  }

  // Redirect 2: Known role → redirect to appropriate page
  if (
    userComplianceRole !== undefined &&
    (pathname.endsWith('/compliance') || pathname.endsWith('/compliance/reports'))
  ) {
    if (userComplianceRole === 'lab-manager') {
      if (isComplianceAdmin) {
        throw redirect('/app/compliance/scientists');
      }
      throw redirect('/app/compliance/shared');
    } else {
      throw redirect('/app/compliance/reports/me');
    }
  }

  // Redirect 3: Unknown role → redirect to qualify page
  if (userComplianceRole === undefined && !pathname.endsWith('/compliance/qualify')) {
    throw redirect('/app/compliance/qualify');
  }

  // ✅ STEP 2: Only execute if NOT redirecting (sub-routes)
  // Defer all expensive operations
  const sharedReportsPromise = getComplianceReportsSharedWith(ctx.user.id);

  let currentUserExistsInAirtablePromise: Promise<boolean> | null = Promise.resolve(false);
  if (orcidAccount?.idAtProvider) {
    currentUserExistsInAirtablePromise = checkScientistExistsByOrcid(orcidAccount.idAtProvider);
  }

  // Build minimal menu immediately (will be enhanced when promises resolve)
  const initialMenu = buildComplianceMenu(
    '/app/compliance',
    isComplianceAdmin,
    !!orcidAccount,
    false, // Default, will update
    userComplianceRole,
    [], // Empty initially, will update
  );

  return {
    menu: initialMenu,
    shouldShowSecondaryNav: userComplianceRole !== undefined,
    currentUserExistsInAirtable: currentUserExistsInAirtablePromise || Promise.resolve(false),
    orcid: orcidAccount?.idAtProvider ?? undefined,
    isComplianceAdmin,
    userComplianceRole,
    sharedReports: sharedReportsPromise, // Return as promise
  };
}

/**
 * Ensure loader re-runs on navigation to keep menu state fresh.
 * This is critical for ensuring menu items like "Delegate Access" appear
 * after state changes (e.g., ORCID linking, Airtable sync).
 */
export function shouldRevalidate({
  defaultShouldRevalidate,
  currentUrl,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  // Always revalidate on navigation between compliance routes to ensure menu is up-to-date
  if (currentUrl && nextUrl) {
    const currentPath = new URL(currentUrl).pathname;
    const nextPath = new URL(nextUrl).pathname;

    // Revalidate when navigating between compliance routes
    if (
      currentPath.startsWith('/app/compliance') &&
      nextPath.startsWith('/app/compliance') &&
      currentPath !== nextPath
    ) {
      return true;
    }
  }

  // Use default behavior for other cases
  return defaultShouldRevalidate;
}

export default function ComplianceLayout() {
  // Use useLoaderData to get fresh data on each render/navigation
  const loaderData = useLoaderData<LoaderData>();
  const {
    menu: initialMenu,
    shouldShowSecondaryNav,
    currentUserExistsInAirtable,
    orcid,
    isComplianceAdmin,
    userComplianceRole,
    sharedReports,
  } = loaderData;

  // Track resolved values to detect when they change
  const [menu, setMenu] = useState(initialMenu);
  const [isResolving, setIsResolving] = useState(true);

  // Use refs to track the current promise values and prevent stale updates
  const promiseRef = useRef<{
    currentUserExistsInAirtable: Promise<boolean>;
    sharedReports: Promise<ComplianceReportSharedWith[]>;
    orcid?: string;
    isComplianceAdmin: boolean;
    userComplianceRole?: 'scientist' | 'lab-manager';
  }>({
    currentUserExistsInAirtable,
    sharedReports,
    orcid,
    isComplianceAdmin,
    userComplianceRole,
  });

  // Create a stable key from loader data to detect when it changes
  const loaderDataKey = useMemo(
    () => `${orcid || 'no-orcid'}-${isComplianceAdmin}-${userComplianceRole || 'no-role'}`,
    [orcid, isComplianceAdmin, userComplianceRole],
  );

  // Track the last resolved key to avoid unnecessary resets
  const lastResolvedKeyRef = useRef<string | null>(null);

  // Update refs when loader data changes, but only reset menu if key actually changed
  useEffect(() => {
    const keyChanged = lastResolvedKeyRef.current !== loaderDataKey;
    
    promiseRef.current = {
      currentUserExistsInAirtable,
      sharedReports,
      orcid,
      isComplianceAdmin,
      userComplianceRole,
    };
    
    // Only reset menu and resolving state if the key changed
    // This prevents flickering when promises are recreated but data is the same
    // On first mount, lastResolvedKeyRef.current is null, so keyChanged will be true
    if (keyChanged) {
      setIsResolving(true);
      setMenu(initialMenu);
      lastResolvedKeyRef.current = null; // Reset resolved key tracker
    }
    // Note: We don't include initialMenu in deps to avoid resetting on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUserExistsInAirtable,
    sharedReports,
    orcid,
    isComplianceAdmin,
    userComplianceRole,
    loaderDataKey,
  ]);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    // Capture current ref values to ensure we're using the latest promises
    const currentPromises = promiseRef.current;

    // Resolve both promises in parallel
    Promise.all([currentPromises.currentUserExistsInAirtable, currentPromises.sharedReports])
      .then(async ([exists, reports]) => {
        // Double-check: verify we're still using the same promises (not stale)
        if (
          currentPromises.currentUserExistsInAirtable !==
            promiseRef.current.currentUserExistsInAirtable ||
          currentPromises.sharedReports !== promiseRef.current.sharedReports
        ) {
          // Promises have changed, ignore this result
          return;
        }

        // Only update state if component is still mounted
        if (!isMounted) return;

        const elapsed = Date.now() - startTime;

        // Rebuild menu with actual values
        const updatedMenu = buildComplianceMenu(
          '/app/compliance',
          currentPromises.isComplianceAdmin,
          !!currentPromises.orcid,
          exists,
          currentPromises.userComplianceRole,
          reports,
        );

        setMenu(updatedMenu);
        setIsResolving(false);
        // Mark this key as resolved
        lastResolvedKeyRef.current = loaderDataKey;

        // Log if it took a while (for debugging)
        if (elapsed > 1000) {
          console.log(`Menu data resolved in ${elapsed}ms`);
        }
      })
      .catch((error) => {
        // Only update state if component is still mounted and promises haven't changed
        if (!isMounted) return;

        // Check if promises are still current
        if (
          currentPromises.currentUserExistsInAirtable !==
            promiseRef.current.currentUserExistsInAirtable ||
          currentPromises.sharedReports !== promiseRef.current.sharedReports
        ) {
          return;
        }

        console.error('Failed to resolve menu data:', error);
        setIsResolving(false);
        // Keep default menu on error
      });

    // Cleanup function: mark as unmounted to prevent stale state updates
    return () => {
      isMounted = false;
    };
  }, [loaderDataKey]); // Use the stable key instead of promise references

  // Create a stable key for SecondaryNav to force re-render when menu changes
  const menuKey = useMemo(() => {
    // Create a key based on menu structure to detect changes
    return JSON.stringify(
      menu.map((section) => ({
        sectionName: section.sectionName,
        menuCount: section.menus.length,
        menuNames: section.menus.map((m) => m.name).join(','),
      })),
    );
  }, [menu]);

  return (
    <>
      {shouldShowSecondaryNav && (
        <SecondaryNav
          key={menuKey}
          contents={menu}
          title={userComplianceRole === 'lab-manager' ? 'Dashboards' : 'My Dashboard'}
          extensions={[extension]}
          branding={{
            badge: (
              <div>
                <img src={myComplianceIcon} alt="My Compliance" className="h-10" />
              </div>
            ),
          }}
        />
      )}
      <MainWrapper hasSecondaryNav={shouldShowSecondaryNav}>
        <Outlet />
      </MainWrapper>
    </>
  );
}

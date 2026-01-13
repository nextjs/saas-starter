// C001 AppShell — unit tests for context and entitlements (CCP-00)
import { render, screen, waitFor } from '@testing-library/react';
import { AppShellProvider, useAppShell } from '@/lib/context/AppShellContext';
import type { Account } from '@/lib/contracts/account';
import type { Workspace } from '@/lib/contracts/workspace';

const mockAccount: Account = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  emailVerified: true,
  roles: ['member'],
  metadata: {
    displayName: 'Test User',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-06T00:00:00Z',
  },
};

const mockWorkspacePro: Workspace = {
  id: 'ws-123e4567-e89b-12d3-a456-426614174000',
  slug: 'test-workspace',
  name: 'Test Workspace',
  tier: 'pro',
  members: [
    {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'owner',
      joinedAt: '2026-01-01T00:00:00Z',
    },
  ],
  metadata: {
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-06T00:00:00Z',
  },
};

const mockWorkspaceFree: Workspace = {
  ...mockWorkspacePro,
  tier: 'free',
};

function TestComponent() {
  const appShell = useAppShell();
  return (
    <div>
      <div data-testid="account">{appShell.account?.email ?? 'null'}</div>
      <div data-testid="workspace">{appShell.workspace?.slug ?? 'null'}</div>
      <div data-testid="tier">{appShell.workspace?.tier ?? 'null'}</div>
      <div data-testid="can-report">
        {appShell.can('ccp-03:report-generation') ? 'yes' : 'no'}
      </div>
      <div data-testid="can-branded">
        {appShell.can('ccp-06:branded-reports') ? 'yes' : 'no'}
      </div>
      <div data-testid="can-crm">
        {appShell.can('ccp-09:crm-sync') ? 'yes' : 'no'}
      </div>
      <div data-testid="loading">{appShell.loading ? 'true' : 'false'}</div>
      <div data-testid="error">{appShell.error?.message ?? 'null'}</div>
      <button onClick={() => appShell.refresh()} data-testid="refresh-btn">
        Refresh
      </button>
    </div>
  );
}

describe('C001 AppShell — useAppShell hook', () => {
  describe('Initial state', () => {
    it('returns initial account and workspace', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('account')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('workspace')).toHaveTextContent('test-workspace');
    });

    it('handles null account (anonymous)', () => {
      render(
        <AppShellProvider
          initialAccount={null}
          initialWorkspace={mockWorkspaceFree}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('account')).toHaveTextContent('null');
    });

    it('handles null workspace', () => {
      render(
        <AppShellProvider initialAccount={mockAccount} initialWorkspace={null}>
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('workspace')).toHaveTextContent('null');
    });
  });

  describe('Entitlements — Pro tier', () => {
    it('allows report generation on pro tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-report')).toHaveTextContent('yes');
    });

    it('allows branded reports on pro tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-branded')).toHaveTextContent('yes');
    });

    it('denies CRM sync on pro tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-crm')).toHaveTextContent('no');
    });
  });

  describe('Entitlements — Free tier', () => {
    it('allows report generation on free tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspaceFree}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-report')).toHaveTextContent('yes');
    });

    it('denies branded reports on free tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspaceFree}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-branded')).toHaveTextContent('no');
    });

    it('denies CRM sync on free tier', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspaceFree}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-crm')).toHaveTextContent('no');
    });
  });

  describe('Anonymous access', () => {
    it('denies all features when account is null', () => {
      render(
        <AppShellProvider
          initialAccount={null}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-report')).toHaveTextContent('no');
      expect(screen.getByTestId('can-branded')).toHaveTextContent('no');
      expect(screen.getByTestId('can-crm')).toHaveTextContent('no');
    });

    it('denies all features when workspace is null', () => {
      render(
        <AppShellProvider initialAccount={mockAccount} initialWorkspace={null}>
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('can-report')).toHaveTextContent('no');
      expect(screen.getByTestId('can-branded')).toHaveTextContent('no');
      expect(screen.getByTestId('can-crm')).toHaveTextContent('no');
    });
  });

  describe('Hook error handling', () => {
    it('throws when used outside AppShellProvider', () => {
      function BadComponent() {
        useAppShell();
        return null;
      }

      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<BadComponent />);
      }).toThrow('useAppShell must be used within AppShellProvider');

      spy.mockRestore();
    });
  });

  describe('Refresh functionality', () => {
    // Note: requires mocking fetch; omitted here for brevity.
    // Full integration test in E2E suite.
    it('initializes loading as false', () => {
      render(
        <AppShellProvider
          initialAccount={mockAccount}
          initialWorkspace={mockWorkspacePro}
        >
          <TestComponent />
        </AppShellProvider>
      );
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });
});

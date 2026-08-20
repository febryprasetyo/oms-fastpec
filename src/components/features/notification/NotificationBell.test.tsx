import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import NotificationBell from './NotificationBell';
import * as notificationApi from '@/services/api/notification';
import { useAuthStore } from '@/services/store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/services/store', () => ({
  useAuthStore: vi.fn(),
}));

describe('NotificationBell Component', () => {
  const mockToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: {
          token: { access_token: mockToken },
          user_data: { role_name: 'Admin', role_id: 'adm' },
        },
      })
    );

    // Mock WebSocket
    (global as any).WebSocket = class MockWebSocket {
      send = vi.fn();
      close = vi.fn();
      readyState = 1;
      onopen = vi.fn();
      onmessage = vi.fn();
      onclose = vi.fn();
      onerror = vi.fn();
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders bell trigger button and fetches unread notifications', async () => {
    vi.spyOn(notificationApi, 'getNotifications').mockResolvedValueOnce({
      success: true,
      data: {
        notifications: [
          {
            id: 1,
            category: 'connectivity',
            type: 'station_offline',
            severity: 'critical',
            title: 'Stasiun Offline',
            message: 'Stasiun Citarum terputus',
            action_url: '/monitoring/ST-01',
            is_read: false,
            created_by: 'SYSTEM',
            created_at: new Date().toISOString(),
          },
        ],
        unread_count: 1,
        limit: 20,
        offset: 0,
      },
    });

    render(<NotificationBell />);

    // Check button exists
    const bellButton = screen.getByRole('button', { name: /Pusat Notifikasi/i });
    expect(bellButton).toBeDefined();

    // Check badge count
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined();
    });
  });

  it('opens popover and displays notification item details', async () => {
    vi.spyOn(notificationApi, 'getNotifications').mockResolvedValueOnce({
      success: true,
      data: {
        notifications: [
          {
            id: 10,
            category: 'calibration',
            type: 'calibration_submitted',
            severity: 'info',
            title: 'Pengajuan Kalibrasi Baru',
            message: 'Pengajuan #10 menunggu verifikasi',
            action_url: '/calibration/10',
            is_read: false,
            created_by: 'SYSTEM',
            created_at: new Date().toISOString(),
          },
        ],
        unread_count: 1,
        limit: 20,
        offset: 0,
      },
    });

    render(<NotificationBell />);

    const bellButton = screen.getByRole('button', { name: /Pusat Notifikasi/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Pengajuan Kalibrasi Baru')).toBeDefined();
      expect(screen.getByText('Pengajuan #10 menunggu verifikasi')).toBeDefined();
    });
  });
});

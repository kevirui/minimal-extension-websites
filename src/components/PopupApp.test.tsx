import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PopupApp } from './PopupApp';
import { defaultStorageBackend } from '../core/storage';
import { MemoryStorageBackend } from '../core/memoryStorage';

describe('PopupApp Component, Scope Badges & Recovery Actions', () => {
  let memoryBackend: MemoryStorageBackend;

  beforeEach(() => {
    memoryBackend = new MemoryStorageBackend();
    vi.spyOn(defaultStorageBackend, 'get').mockImplementation((key) => memoryBackend.get(key));
    vi.spyOn(defaultStorageBackend, 'set').mockImplementation((key, val) => memoryBackend.set(key, val));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders unsupported empty state when active tab is not a supported site', async () => {
    global.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([{ url: 'https://en.wikipedia.org/wiki/Main_Page', id: 101 }]),
        sendMessage: vi.fn(),
      },
    } as unknown as typeof chrome;

    render(<PopupApp />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('en.wikipedia.org')).toBeInTheDocument();
    expect(screen.getByText('Unsupported')).toBeInTheDocument();
    expect(screen.getByText('Site Not Supported Yet')).toBeInTheDocument();
  });

  it('renders YouTube rules with contextual page scope badges on watch page', async () => {
    global.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', id: 102 }]),
        sendMessage: vi.fn().mockResolvedValue({ type: 'CLEARFRAME_PONG', active: true }),
      },
    } as unknown as typeof chrome;

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    });

    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Supported')).toBeInTheDocument();

    // Verify all 4 YouTube rules are listed
    expect(screen.getByText('Hide Shorts')).toBeInTheDocument();
    expect(screen.getByText('Hide Home Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Hide Related Videos on Watch Page')).toBeInTheDocument();
    expect(screen.getByText('Hide Comments')).toBeInTheDocument();

    // Check scope badges: Home recommendations is "Homepage only" on a watch page
    expect(screen.getByText('Homepage only')).toBeInTheDocument();
    // Related videos and comments are "Watch page"
    const watchBadges = screen.getAllByText('Watch page');
    expect(watchBadges.length).toBe(2);

    // Check defaults: Hide Shorts is enabled by default
    const shortsSwitch = screen.getByRole('switch', { name: /Hide Shorts/i });
    expect(shortsSwitch).toHaveAttribute('aria-checked', 'true');

    // Hide Comments is disabled by default
    const commentsSwitch = screen.getByRole('switch', { name: /Hide Comments/i });
    expect(commentsSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('displays connectivity notice banner with refresh action when content script is not yet responding', async () => {
    const sendMessageMock = vi.fn().mockRejectedValue(new Error('Receiving end does not exist'));
    global.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([{ url: 'https://www.youtube.com/', id: 150 }]),
        sendMessage: sendMessageMock,
      },
    } as unknown as typeof chrome;

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByTestId('connectivity-notice')).toBeInTheDocument();
    });

    expect(screen.getByText(/Page script initializing or page reloaded/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh link/i })).toBeInTheDocument();
  });

  it('toggles switch state, persists to storage, and notifies tab with structured message', async () => {
    const sendMessageMock = vi.fn().mockResolvedValue({ type: 'CLEARFRAME_ACK', success: true });
    global.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([{ url: 'https://www.youtube.com/', id: 200 }]),
        sendMessage: sendMessageMock,
      },
    } as unknown as typeof chrome;

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    });

    const commentsSwitch = screen.getByRole('switch', { name: /Hide Comments/i });
    expect(commentsSwitch).toHaveAttribute('aria-checked', 'false');

    // Click toggle
    fireEvent.click(commentsSwitch);

    await waitFor(() => {
      expect(commentsSwitch).toHaveAttribute('aria-checked', 'true');
    });

    // Check message sent to tab
    expect(sendMessageMock).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        type: 'CLEARFRAME_SETTINGS_UPDATED',
        siteId: 'youtube',
        settings: expect.objectContaining({ 'yt-hide-comments': true }),
        source: 'popup',
      })
    );
  });

  it('reconciles state and displays error notification if storage persistence fails', async () => {
    memoryBackend.shouldFailSet = true;

    global.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([{ url: 'https://www.youtube.com/', id: 400 }]),
        sendMessage: vi.fn().mockResolvedValue({ type: 'CLEARFRAME_PONG', active: true }),
      },
    } as unknown as typeof chrome;

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByTestId('rules-list')).toBeInTheDocument();
    });

    const commentsSwitch = screen.getByRole('switch', { name: /Hide Comments/i });
    expect(commentsSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(commentsSwitch);

    await waitFor(() => {
      expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Could not save preference to local storage.')).toBeInTheDocument();
    expect(commentsSwitch).toHaveAttribute('aria-checked', 'false');
  });
});

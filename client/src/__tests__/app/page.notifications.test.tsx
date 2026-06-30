import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/app/page';
import { apiRequest } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/papers/PaperCard', () => ({
  PaperCard: ({ paper }: { paper: { title: string } }) => <div data-testid="paper-card">{paper.title}</div>,
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('Dashboard notifications', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', 'test-user');
    localStorage.setItem('userEmail', 'user@example.com');

    mockedApiRequest.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/papers') {
        return [
          {
            id: 1,
            arxivId: '1',
            title: 'AI Topic Paper',
            abstract: 'Paper about AI',
            authors: 'A',
            publishedDate: '2026-06-30T10:00:00.000Z',
            url: 'http://example.com/1',
            topics: [{ fkTopicId: 1, topic: { id: 1, name: 'AI Agents' } }],
          },
          {
            id: 2,
            arxivId: '2',
            title: 'Other Topic Paper',
            abstract: 'Paper about another topic',
            authors: 'B',
            publishedDate: '2026-06-30T09:00:00.000Z',
            url: 'http://example.com/2',
            topics: [{ fkTopicId: 2, topic: { id: 2, name: 'Stock Prediction' } }],
          },
        ];
      }
      if (endpoint === '/topics') return [];
      if (endpoint === '/user-topics') return [];
      if (endpoint === '/papers/my-favorites') return [];
      if (endpoint === '/notifications') {
        return [
          { id: 1, message: '1 new paper for AI Agents', createdAt: '2026-06-30T10:00:00.000Z', isRead: false, fkTopicId: 1, paperIds: [1] },
          { id: 2, message: '2 new papers for Stock Prediction', createdAt: '2026-06-30T09:00:00.000Z', isRead: false, fkTopicId: 2, paperIds: [2] },
        ];
      }
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('marks one notification read on click without removing it from the list', async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(await screen.findByRole('button', { name: /notifications/i }));

    const firstNotification = await screen.findByText('1 new paper for AI Agents');
    const firstNotificationButton = firstNotification.closest('button');

    expect(firstNotificationButton).toBeInTheDocument();

    await user.click(firstNotificationButton as HTMLButtonElement);

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/notifications/1/read', expect.objectContaining({
        method: 'PUT',
      }));
    });

    expect(screen.getByText('1 new paper for AI Agents')).toBeInTheDocument();
    expect(firstNotificationButton).toHaveClass('opacity-70');
    expect(screen.getByText('AI Topic Paper')).toBeInTheDocument();
    expect(screen.queryByText('Other Topic Paper')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 paper from notification')).toBeInTheDocument();
  });

  it('marks all notifications read from the dropdown button', async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await user.click(await screen.findByRole('button', { name: /notifications/i }));
    await user.click(screen.getByRole('button', { name: /mark as read/i }));

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/notifications/mark-read', expect.objectContaining({
        method: 'PUT',
      }));
    });

    expect(screen.getByText('1 new paper for AI Agents').closest('button')).toHaveClass('opacity-70');
    expect(screen.getByText('2 new papers for Stock Prediction').closest('button')).toHaveClass('opacity-70');
  });
});
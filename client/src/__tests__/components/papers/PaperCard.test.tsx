import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaperCard } from '@/components/papers/PaperCard';

describe('PaperCard', () => {
  const mockPaper = {
    id: 1,
    arxivId: '2101.00001v1',
    title: 'Test Paper Title',
    abstract: 'This is a very long abstract that should theoretically be truncated when initially rendered. It needs to be long enough to trigger any line-clamping logic we apply in the CSS. Let us add a few more sentences just to be absolutely sure it is a block of text.',
    authors: 'John Doe, Jane Smith',
    publishedDate: '2023-10-01T00:00:00.000Z',
    url: 'http://arxiv.org/abs/2101.00001v1',
  };

  it('renders paper information correctly', () => {
    render(<PaperCard paper={mockPaper} />);
    
    // Check Title
    expect(screen.getByText('Test Paper Title')).toBeInTheDocument();
    expect(screen.getByText('Test Paper Title').closest('a')).toHaveAttribute('href', mockPaper.url);
    
    // Check Authors
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument();
    
    // Check Date (Format: October 1, 2023)
    expect(screen.getByText('October 1, 2023')).toBeInTheDocument();
  });

  it('toggles abstract expansion when Read More is clicked', async () => {
    render(<PaperCard paper={mockPaper} />);
    
    const user = userEvent.setup();
    const abstractText = screen.getByText(/This is a very long abstract/);
    const button = screen.getByRole('button', { name: /Read More/i });

    // Initially, it should have the line-clamp class
    expect(abstractText).toHaveClass('line-clamp-3');

    // Click to expand
    await user.click(button);
    
    // The line-clamp class should be removed
    expect(abstractText).not.toHaveClass('line-clamp-3');
    expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();

    // Click to collapse again
    await user.click(screen.getByRole('button', { name: /Show Less/i }));
    
    expect(abstractText).toHaveClass('line-clamp-3');
    expect(screen.getByRole('button', { name: /Read More/i })).toBeInTheDocument();
  });
});

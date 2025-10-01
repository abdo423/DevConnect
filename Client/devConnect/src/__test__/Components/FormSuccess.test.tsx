// src/__test__/Components/FormSuccess.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test.util.tsx';
import FormSuccess from '@/components/FormSuccess';

// Mock radix icons
vi.mock('@radix-ui/react-icons', () => ({
  CheckCircledIcon: ({ className }: { className?: string }) => (
    <div data-testid="success-icon" className={className}>
      Success Icon
    </div>
  ),
}));

describe('FormSuccess', () => {
  it('renders success message when message prop is provided', () => {
    const successMessage = 'This is a success message';
    renderWithProviders(<FormSuccess message={successMessage} />);

    // Check that the success container is rendered
    const successContainer = screen.getByTestId('form-success');
    expect(successContainer).toBeInTheDocument();

    // Check that the success icon is rendered
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();

    // Check that the success message is rendered
    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it('does not render when message prop is undefined', () => {
    renderWithProviders(<FormSuccess />);

    expect(screen.queryByTestId('form-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('success-icon')).not.toBeInTheDocument();
  });

  it('does not render when message prop is empty string', () => {
    renderWithProviders(<FormSuccess message="" />);

    expect(screen.queryByTestId('form-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('success-icon')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes to success container', () => {
    renderWithProviders(<FormSuccess message="Success" />);

    const successContainer = screen.getByTestId('form-success');
    expect(successContainer).toHaveClass(
      'bg-emerald-500/15',
      'p-3',
      'rounded-md',
      'flex',
      'items-center',
      'gap-x-2',
      'text-sm',
      'text-emerald-500'
    );
  });

  it('applies correct CSS classes to success icon', () => {
    renderWithProviders(<FormSuccess message="Success" />);

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toHaveClass('w-4', 'h-4');
  });

  it('renders message within a span element', () => {
    const successMessage = 'Custom success message';
    renderWithProviders(<FormSuccess message={successMessage} />);

    const messageSpan = screen.getByText(successMessage);
    expect(messageSpan.tagName).toBe('SPAN');
  });

  it('handles long success messages', () => {
    const longSuccessMessage =
      'This is a very long success message that should still be rendered correctly without breaking the component layout or functionality';
    renderWithProviders(<FormSuccess message={longSuccessMessage} />);

    expect(screen.getByText(longSuccessMessage)).toBeInTheDocument();
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });

  it('handles special characters in success message', () => {
    const specialCharMessage = 'Success: <>&\'"123!@#$%^&*()';
    renderWithProviders(<FormSuccess message={specialCharMessage} />);

    expect(screen.getByText(specialCharMessage)).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    const successMessage = 'Test success';
    renderWithProviders(<FormSuccess message={successMessage} />);

    const successContainer = screen.getByTestId('form-success');
    const successIcon = screen.getByTestId('success-icon');
    const messageSpan = screen.getByText(successMessage);

    // Check that icon and message are children of the container
    expect(successContainer).toContainElement(successIcon);
    expect(successContainer).toContainElement(messageSpan);

    // Check that the div has exactly two children (icon and span)
    expect(successContainer.children).toHaveLength(2);
  });

  it('has different styling from FormError component', () => {
    renderWithProviders(<FormSuccess message="Success message" />);

    const successContainer = screen.getByTestId('form-success');

    // Should use emerald/green colors instead of destructive/red
    expect(successContainer).toHaveClass(
      'bg-emerald-500/15',
      'text-emerald-500'
    );
    expect(successContainer).not.toHaveClass(
      'bg-destructive/35',
      'text-destructive'
    );
  });

  describe('edge cases', () => {
    it('handles null message', () => {
      renderWithProviders(<FormSuccess message={null as any} />);

      expect(screen.queryByTestId('form-success')).not.toBeInTheDocument();
    });

    it('handles whitespace-only message', () => {
      renderWithProviders(<FormSuccess message="   " />);

      // Component should render for whitespace (truthy string)
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
      // Just check that the span element exists - whitespace normalization makes exact matching tricky
      expect(
        screen.getByTestId('form-success').querySelector('span')
      ).toBeInTheDocument();
    });

    it('handles numeric message (converted to string)', () => {
      renderWithProviders(<FormSuccess message={0 as any} />);

      // 0 is falsy, so should not render
      expect(screen.queryByTestId('form-success')).not.toBeInTheDocument();
    });

    it('handles boolean true message', () => {
      renderWithProviders(<FormSuccess message={true as any} />);

      // true is truthy but not a string, should still render
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
    });
  });
});

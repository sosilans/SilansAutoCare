import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('renders and calls onConfirm/onCancel', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal open={true} title="Delete" message="Are you sure?" confirmLabel="Yes" cancelLabel="No" onConfirm={onConfirm} onCancel={onCancel} />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalled();

    // Re-render closed and test cancel path
    render(
      <ConfirmModal open={true} title="Cancel" message="Cancel?" confirmLabel="Ok" cancelLabel="Back" onConfirm={onConfirm} onCancel={onCancel} />
    );
    await user.click(screen.getByText('Back'));
    expect(onCancel).toHaveBeenCalled();
  });
});

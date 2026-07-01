import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuantityStepper } from '@/components/QuantityStepper';

describe('QuantityStepper', () => {
  it('displays quantity', () => {
    const { getByText } = render(<QuantityStepper value={5} onChange={() => {}} />);
    expect(getByText('5')).toBeTruthy();
  });

  it('increment works', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<QuantityStepper value={5} onChange={onChange} />);
    const buttons = getAllByRole('button');
    // Second button is increment
    fireEvent.press(buttons[1]);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrement works', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<QuantityStepper value={5} onChange={onChange} />);
    const buttons = getAllByRole('button');
    // First button is decrement
    fireEvent.press(buttons[0]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('minimum check prevents decrement below min', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<QuantityStepper value={0} onChange={onChange} min={0} />);
    const buttons = getAllByRole('button');
    expect(buttons[0].props.accessibilityState.disabled).toBe(true);
  });

  it('maximum check prevents increment above max', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<QuantityStepper value={10} onChange={onChange} max={10} />);
    const buttons = getAllByRole('button');
    expect(buttons[1].props.accessibilityState.disabled).toBe(true);
  });

  it('custom step works', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<QuantityStepper value={5} onChange={onChange} step={3} />);
    fireEvent.press(getAllByRole('button')[1]);
    expect(onChange).toHaveBeenCalledWith(8);
  });
});

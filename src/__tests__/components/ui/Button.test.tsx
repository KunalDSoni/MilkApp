import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button label="Press me" />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Press" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Press" onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    const { getByRole } = render(<Button label="Loading" loading />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityState.busy).toBe(true);
  });

  it('renders with icon', () => {
    const { getByText } = render(<Button label="With Icon" icon={<></>} />);
    expect(getByText('With Icon')).toBeTruthy();
  });
});

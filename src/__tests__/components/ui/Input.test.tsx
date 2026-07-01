import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />);
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('displays label', () => {
    const { getByText } = render(<Input label="Name" placeholder="Enter name" />);
    expect(getByText('Name')).toBeTruthy();
  });

  it('shows error message', () => {
    const { getByText } = render(<Input error="Required" placeholder="Field" />);
    expect(getByText('Required')).toBeTruthy();
  });

  it('calls onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/FormInput';
import { ThemeProvider } from '@/providers/ThemeProvider';

function TestForm({ defaultValues = { name: '' }, ...props }: any) {
  const { control } = useForm({ defaultValues });
  return (
    <ThemeProvider>
      <FormInput control={control} name="name" label="Name" {...props} />
    </ThemeProvider>
  );
}

describe('FormInput', () => {
  it('renders with label', () => {
    const { getByText } = render(<TestForm />);
    expect(getByText('Name')).toBeOnTheScreen();
  });

  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<TestForm placeholder="Enter name" />);
    expect(getByPlaceholderText('Enter name')).toBeOnTheScreen();
  });

  it('displays default value', () => {
    const { getByDisplayValue } = render(<TestForm defaultValues={{ name: 'John' }} />);
    expect(getByDisplayValue('John')).toBeOnTheScreen();
  });

  it('updates value on change', () => {
    const { getByLabelText, getByDisplayValue } = render(<TestForm />);
    fireEvent.changeText(getByLabelText('Name'), 'Jane');
    expect(getByDisplayValue('Jane')).toBeOnTheScreen();
  });

  it('renders with helper text', () => {
    const { getByText } = render(<TestForm helper="Required field" />);
    expect(getByText('Required field')).toBeOnTheScreen();
  });

  it('renders with leftIcon', () => {
    const { getByLabelText } = render(<TestForm leftIcon="person" />);
    expect(getByLabelText('Name')).toBeOnTheScreen();
  });

  it('renders as password field', () => {
    const { getByLabelText } = render(<TestForm secureTextEntry />);
    expect(getByLabelText('Show password')).toBeOnTheScreen();
  });

  it('renders with filled variant', () => {
    const { getByLabelText } = render(<TestForm variant="filled" />);
    expect(getByLabelText('Name')).toBeOnTheScreen();
  });

  it('renders as multiline', () => {
    const { getByLabelText } = render(<TestForm multiline numberOfLines={4} />);
    expect(getByLabelText('Name')).toBeOnTheScreen();
  });

  it('renders as non-editable', () => {
    const { getByLabelText } = render(<TestForm editable={false} />);
    expect(getByLabelText('Name')).toBeOnTheScreen();
  });
});

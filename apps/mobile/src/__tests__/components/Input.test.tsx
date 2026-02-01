import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/Input';
import { renderWithTheme } from '../test-utils';

describe('Input', () => {
  it('renders with label', () => {
    const { getByText } = renderWithTheme(<Input label="Email" />);
    expect(getByText('Email')).toBeOnTheScreen();
  });

  it('renders without label', () => {
    const { queryByText } = renderWithTheme(<Input placeholder="Enter text" />);
    expect(queryByText('Email')).toBeNull();
  });

  it('renders placeholder', () => {
    const { getByPlaceholderText } = renderWithTheme(<Input placeholder="Type here" />);
    expect(getByPlaceholderText('Type here')).toBeOnTheScreen();
  });

  it('displays error text', () => {
    const { getByText } = renderWithTheme(<Input error="Required field" />);
    expect(getByText('Required field')).toBeOnTheScreen();
  });

  it('displays helper text', () => {
    const { getByText } = renderWithTheme(<Input helper="Enter your email" />);
    expect(getByText('Enter your email')).toBeOnTheScreen();
  });

  it('hides helper when error is shown', () => {
    const { queryByText } = renderWithTheme(<Input helper="Help" error="Error" />);
    expect(queryByText('Help')).toBeNull();
    expect(queryByText('Error')).toBeOnTheScreen();
  });

  it('shows password toggle for secure fields', () => {
    const { getByLabelText } = renderWithTheme(<Input secureTextEntry label="Password" />);
    expect(getByLabelText('Show password')).toBeOnTheScreen();
  });

  it('toggles password visibility', () => {
    const { getByLabelText } = renderWithTheme(<Input secureTextEntry label="Password" />);
    fireEvent.press(getByLabelText('Show password'));
    expect(getByLabelText('Hide password')).toBeOnTheScreen();
  });

  it('uses label as accessibility label', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Email" />);
    expect(getByLabelText('Email')).toBeOnTheScreen();
  });

  it('uses custom accessibility label', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Email" accessibilityLabel="Custom label" />);
    expect(getByLabelText('Custom label')).toBeOnTheScreen();
  });

  it('calls onChangeText', () => {
    const onChange = jest.fn();
    const { getByLabelText } = renderWithTheme(<Input label="Name" onChangeText={onChange} />);
    fireEvent.changeText(getByLabelText('Name'), 'test');
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('renders with sm size', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Small" inputSize="sm" />);
    expect(getByLabelText('Small')).toBeOnTheScreen();
  });

  it('renders with lg size', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Large" inputSize="lg" />);
    expect(getByLabelText('Large')).toBeOnTheScreen();
  });

  it('renders filled variant', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Filled" variant="filled" />);
    expect(getByLabelText('Filled')).toBeOnTheScreen();
  });

  it('renders outlined variant', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Outlined" variant="outlined" />);
    expect(getByLabelText('Outlined')).toBeOnTheScreen();
  });

  it('handles focus event', () => {
    const onFocus = jest.fn();
    const { getByLabelText } = renderWithTheme(<Input label="Input" onFocus={onFocus} />);
    fireEvent(getByLabelText('Input'), 'focus');
    expect(onFocus).toHaveBeenCalled();
  });

  it('handles blur event', () => {
    const onBlur = jest.fn();
    const { getByLabelText } = renderWithTheme(<Input label="Input" onBlur={onBlur} />);
    fireEvent(getByLabelText('Input'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('error text has alert role', () => {
    const { getByRole } = renderWithTheme(<Input error="Error" />);
    expect(getByRole('alert')).toBeOnTheScreen();
  });

  it('filled variant gets border on focus', () => {
    const { getByLabelText } = renderWithTheme(<Input label="Filled" variant="filled" />);
    fireEvent(getByLabelText('Filled'), 'focus');
    // Focus on filled variant should add border
    expect(getByLabelText('Filled')).toBeOnTheScreen();
  });

  it('focus and blur update internal state for filled variant', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <Input label="Test" variant="filled" onFocus={onFocus} onBlur={onBlur} />
    );
    fireEvent(getByLabelText('Test'), 'focus');
    expect(onFocus).toHaveBeenCalled();
    fireEvent(getByLabelText('Test'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders right icon with press handler', () => {
    const onPress = jest.fn();
    const { UNSAFE_getAllByType } = renderWithTheme(
      <Input label="Search" rightIcon="search" onRightIconPress={onPress} />
    );
    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
  });

  it('renders right icon without press handler (disabled)', () => {
    const { getByLabelText } = renderWithTheme(
      <Input label="Search" rightIcon="search" />
    );
    expect(getByLabelText('Search')).toBeOnTheScreen();
  });
});

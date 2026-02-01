import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { renderWithTheme } from '../test-utils';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<Card><Text>Content</Text></Card>);
    expect(getByText('Content')).toBeOnTheScreen();
  });

  it('renders default variant', () => {
    const { getByText } = renderWithTheme(<Card><Text>Default</Text></Card>);
    expect(getByText('Default')).toBeOnTheScreen();
  });

  it('renders elevated variant', () => {
    const { getByText } = renderWithTheme(<Card variant="elevated"><Text>Elevated</Text></Card>);
    expect(getByText('Elevated')).toBeOnTheScreen();
  });

  it('renders outlined variant', () => {
    const { getByText } = renderWithTheme(<Card variant="outlined"><Text>Outlined</Text></Card>);
    expect(getByText('Outlined')).toBeOnTheScreen();
  });

  it('renders filled variant', () => {
    const { getByText } = renderWithTheme(<Card variant="filled"><Text>Filled</Text></Card>);
    expect(getByText('Filled')).toBeOnTheScreen();
  });

  it('renders with none padding', () => {
    const { getByText } = renderWithTheme(<Card padding="none"><Text>No pad</Text></Card>);
    expect(getByText('No pad')).toBeOnTheScreen();
  });

  it('renders with sm padding', () => {
    const { getByText } = renderWithTheme(<Card padding="sm"><Text>Small</Text></Card>);
    expect(getByText('Small')).toBeOnTheScreen();
  });

  it('renders with lg padding', () => {
    const { getByText } = renderWithTheme(<Card padding="lg"><Text>Large</Text></Card>);
    expect(getByText('Large')).toBeOnTheScreen();
  });

  it('handles onPress', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(<Card onPress={onPress}><Text>Tap me</Text></Card>);
    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders as View without onPress', () => {
    const { getByText } = renderWithTheme(<Card><Text>Static</Text></Card>);
    expect(getByText('Static')).toBeOnTheScreen();
  });

  it('renders as TouchableOpacity with onPress', () => {
    const { getByText } = renderWithTheme(<Card onPress={() => {}}><Text>Touch</Text></Card>);
    expect(getByText('Touch')).toBeOnTheScreen();
  });

  it('applies custom style', () => {
    const { getByText } = renderWithTheme(
      <Card style={{ marginTop: 10 }}><Text>Styled</Text></Card>
    );
    expect(getByText('Styled')).toBeOnTheScreen();
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<CardHeader><Text>Header</Text></CardHeader>);
    expect(getByText('Header')).toBeOnTheScreen();
  });

  it('applies custom style', () => {
    const { getByText } = renderWithTheme(
      <CardHeader style={{ paddingTop: 5 }}><Text>Header</Text></CardHeader>
    );
    expect(getByText('Header')).toBeOnTheScreen();
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<CardBody><Text>Body</Text></CardBody>);
    expect(getByText('Body')).toBeOnTheScreen();
  });

  it('applies custom style', () => {
    const { getByText } = renderWithTheme(
      <CardBody style={{ padding: 10 }}><Text>Body</Text></CardBody>
    );
    expect(getByText('Body')).toBeOnTheScreen();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<CardFooter><Text>Footer</Text></CardFooter>);
    expect(getByText('Footer')).toBeOnTheScreen();
  });

  it('applies custom style', () => {
    const { getByText } = renderWithTheme(
      <CardFooter style={{ paddingBottom: 5 }}><Text>Footer</Text></CardFooter>
    );
    expect(getByText('Footer')).toBeOnTheScreen();
  });
});

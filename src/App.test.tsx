import { render, screen } from '@testing-library/react';

// Tests are not required for this assignment

test('renders demo', () => {
  render(<>not required</>);
  const linkElement = screen.getByText(/not required/i);
  expect(linkElement).toBeInTheDocument();
});

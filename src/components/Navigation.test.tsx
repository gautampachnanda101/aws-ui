import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('S3')).toBeInTheDocument();
    expect(screen.getByText('DynamoDB')).toBeInTheDocument();
    expect(screen.getByText('SQS')).toBeInTheDocument();
    expect(screen.getByText('SNS')).toBeInTheDocument();
    expect(screen.getByText('Lambda')).toBeInTheDocument();
    expect(screen.getByText('Config')).toBeInTheDocument();
  });

  it('renders logo and status indicator', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByAltText('Pachnanda Digital')).toBeInTheDocument();
    expect(screen.getByText('Local Development')).toBeInTheDocument();
  });
});

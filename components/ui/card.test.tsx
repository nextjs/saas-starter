import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly', () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>);

      const card = screen.getByText('Content');
      expect(card).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(
        <Card>
          <div data-testid="child">Child element</div>
        </Card>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('applies custom className', () => {
      render(<CardHeader className="header-class">Header</CardHeader>);

      const header = screen.getByText('Header');
      expect(header).toHaveClass('header-class');
    });
  });

  describe('CardTitle', () => {
    it('renders correctly', () => {
      render(<CardTitle>Title text</CardTitle>);

      const title = screen.getByText('Title text');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('applies custom className', () => {
      render(<CardTitle className="title-class">Title</CardTitle>);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('title-class');
    });
  });

  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(<CardDescription>Description text</CardDescription>);

      const description = screen.getByText('Description text');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('applies custom className', () => {
      render(<CardDescription className="desc-class">Description</CardDescription>);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('desc-class');
    });
  });

  describe('CardAction', () => {
    it('renders correctly', () => {
      render(<CardAction>Action</CardAction>);

      const action = screen.getByText('Action');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('applies custom className', () => {
      render(<CardAction className="action-class">Action</CardAction>);

      const action = screen.getByText('Action');
      expect(action).toHaveClass('action-class');
    });
  });

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(<CardContent>Content</CardContent>);

      const content = screen.getByText('Content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('applies custom className', () => {
      render(<CardContent className="content-class">Content</CardContent>);

      const content = screen.getByText('Content');
      expect(content).toHaveClass('content-class');
    });
  });

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(<CardFooter>Footer</CardFooter>);

      const footer = screen.getByText('Footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('applies custom className', () => {
      render(<CardFooter className="footer-class">Footer</CardFooter>);

      const footer = screen.getByText('Footer');
      expect(footer).toHaveClass('footer-class');
    });
  });

  describe('Composed Card', () => {
    it('renders a full card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
            <CardAction>
              <button>Header Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description text')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /header action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /footer action/i })).toBeInTheDocument();
    });
  });
});

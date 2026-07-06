import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownViewer from '@/components/MarkdownViewer';

describe('MarkdownViewer Component', () => {
  it('renders markdown text correctly', () => {
    render(<MarkdownViewer content="# Hello Onrivi" />);
    // ReactMarkdown parses # to h1
    expect(screen.getByText('Hello Onrivi')).toBeInTheDocument();
  });

  it('filters out malicious javascript URIs in links', () => {
    render(<MarkdownViewer content="[Click](javascript:alert(1))" />);
    const link = screen.getByText('Click');
    expect(link).toHaveAttribute('href', '');
  });
});

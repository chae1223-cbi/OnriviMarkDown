import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownViewer from '@/components/MarkdownViewer';

describe('MarkdownViewer Component', () => {
  let originalError: any;

  beforeAll(() => {
    originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('validateDOMNesting')) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

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

  it('renders image captions using figure and figcaption when alt text is provided', () => {
    const content = `![[그림 1-1] 테스트 캡션](test.png)`;
    render(<MarkdownViewer content={content} />);
    
    // figcaption should be present
    const figcaption = screen.getByText('[그림 1-1] 테스트 캡션');
    expect(figcaption).toBeInTheDocument();
    expect(figcaption.tagName.toLowerCase()).toBe('figcaption');
    
    // parent should be figure
    const figure = figcaption.closest('figure');
    expect(figure).toBeInTheDocument();
    expect(figure).toHaveClass('text-center');
    
    // image should be present with correct src and alt
    const img = screen.getByAltText('[그림 1-1] 테스트 캡션');
    expect(img).toBeInTheDocument();
  });
});

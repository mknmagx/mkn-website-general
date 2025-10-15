/**
 * Markdown to HTML converter for blog content
 * Converts AI-generated markdown content to HTML format
 */

/**
 * Convert HTML content to Markdown
 * @param {string} html - The HTML content to convert
 * @returns {string} Markdown content
 */
export function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let markdown = html;

  // Headers (H1-H6)
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');

  // Bold text
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  // Italic text
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1');

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```');
  
  // Inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');

  // Clean up extra newlines
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return markdown.trim();
}

export function markdownToHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  // Headers (H1-H6)
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
  html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.*$)/gm, '<li>$1</li>');
  // Note: This is a simplified approach, proper ordered list detection would be more complex

  // Line breaks - Convert double newlines to paragraphs
  html = html.split('\n\n').map(paragraph => {
    paragraph = paragraph.trim();
    if (!paragraph) return '';
    
    // Don't wrap if already has HTML tags
    if (paragraph.includes('<h') || paragraph.includes('<ul') || paragraph.includes('<ol') || paragraph.includes('<li')) {
      return paragraph;
    }
    
    return `<p>${paragraph}</p>`;
  }).join('\n');

  // Clean up extra newlines
  html = html.replace(/\n\s*\n/g, '\n');
  
  // Fix nested lists (basic cleanup)
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  return html.trim();
}

/**
 * Enhanced markdown to HTML converter with more features
 * Handles more complex markdown structures
 */
export function enhancedMarkdownToHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  // Code blocks (fenced)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Apply basic markdown conversion
  html = markdownToHtml(html);

  return html;
}

/**
 * Clean and sanitize HTML content
 * Removes potentially dangerous elements
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous protocols
  html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  
  return html;
}
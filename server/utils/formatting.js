/**
 * Formatting Utilities for Einayim LaTorah Newsletter
 *
 * This module contains helper functions for processing and formatting
 * article content from user input into properly formatted HTML.
 */

/**
 * Converts plain text with markdown-style formatting into HTML
 *
 * Supported formatting:
 * - **text** → <strong>text</strong> (bold)
 * - *text* → <em>text</em> (italic)
 * - __text__ → <u>text</u> (underline)
 * - ***text*** → <strong><em>text</em></strong> (bold + italic)
 * - Double line breaks → new paragraphs
 *
 * @param {string} text - Raw text input from user
 * @returns {string} Formatted HTML string
 */
function parseFormattedText(text) {
  if (!text) return '';

  // Handle HTML entities to prevent XSS
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert markdown-style formatting to HTML
  text = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
    .replace(/__(.+?)__/g, '<u>$1</u>') // Underline
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/\n/g, '<br>'); // Line breaks

  return `<p>${text}</p>`;
}

/**
 * Processes all articles and adds formatted HTML content
 *
 * Takes the raw article data from the form and adds a 'formattedContent'
 * property to each article containing the processed HTML.
 *
 * @param {Object} articles - Object containing all article data
 * @returns {Object} Articles with added formattedContent property
 */
function processArticles(articles) {
  const processed = {};

  Object.keys(articles).forEach(key => {
    const article = articles[key];
    processed[key] = {
      ...article,
      formattedContent: parseFormattedText(article.content),
      formattedBio: article.bio ? parseFormattedText(article.bio) : null
    };
  });

  return processed;
}

// Export functions for use in other modules
module.exports = {
  parseFormattedText,
  processArticles
};
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Serve the main form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate PDF endpoint
app.post('/generate-pdf', async (req, res) => {
  try {
    const { metadata, articles } = req.body;

    // Generate HTML from template
    const html = generateNewsletterHTML(metadata, articles);

    // Create PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.5in',
        right: '0.75in',
        bottom: '0.5in',
        left: '0.75in'
      },
      printBackground: true
    });

    await browser.close();

    // Save PDF to archives
    const filename = `ELT_${metadata.parsha}_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, 'archives', filename);
    await fs.writeFile(filepath, pdfBuffer);

    // Send PDF to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Helper function to convert Google Docs paste to formatted HTML
function parseFormattedText(text) {
  if (!text) return '';

  // Handle HTML entities
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert markdown-style formatting
  text = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
    .replace(/__(.+?)__/g, '<u>$1</u>') // Underline
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/\n/g, '<br>'); // Line breaks

  return `<p>${text}</p>`;
}

// Generate complete newsletter HTML
function generateNewsletterHTML(metadata, articles) {
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Open Sans', Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.5;
        color: #000;
      }

      .page {
        width: 100%;
        max-width: 8.5in;
        margin: 0 auto;
        background: white;
      }

      .header {
        background: linear-gradient(135deg, #0a4a6b 0%, #1a7a9b 100%);
        color: white;
        padding: 30px 20px;
        margin-bottom: 20px;
        border-bottom: 4px solid #0a9eb5;
      }

      .header-top {
        text-align: right;
        font-size: 9pt;
        margin-bottom: 10px;
        color: #b3e5f0;
      }

      .title {
        font-family: 'Libre Baskerville', serif;
        font-size: 42pt;
        font-weight: 700;
        text-align: center;
        margin: 10px 0;
        letter-spacing: 2px;
        color: white;
      }

      .subtitle {
        text-align: center;
        font-size: 12pt;
        font-style: italic;
        color: #b3e5f0;
      }

      .sidebar {
        float: right;
        width: 180px;
        background: #e8f4f8;
        border: 2px solid #0a9eb5;
        padding: 15px;
        margin: 0 0 20px 20px;
        border-radius: 5px;
      }

      .sidebar h3 {
        color: #0a4a6b;
        font-size: 11pt;
        text-align: center;
        margin-bottom: 10px;
        border-bottom: 2px solid #0a9eb5;
        padding-bottom: 5px;
      }

      .sidebar-item {
        font-size: 9pt;
        margin: 8px 0;
        padding: 5px 0;
        border-bottom: 1px solid #b3d9e5;
      }

      .content {
        column-count: 2;
        column-gap: 30px;
        column-rule: 1px solid #ddd;
        text-align: justify;
        padding: 0 20px;
      }

      .article {
        break-inside: avoid;
        margin-bottom: 20px;
      }

      .article-title {
        font-size: 14pt;
        font-weight: 700;
        color: #0a4a6b;
        margin-bottom: 5px;
        border-bottom: 2px solid #0a9eb5;
        padding-bottom: 5px;
      }

      .article-author {
        font-size: 12pt;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .article-content {
        font-size: 10pt;
        line-height: 1.6;
      }

      .article-content p {
        margin-bottom: 8px;
        text-indent: 15px;
      }

      .article-content p:first-child {
        text-indent: 0;
      }

      .author-image {
        width: 80px;
        height: 80px;
        float: right;
        margin: 0 0 10px 10px;
        border: 2px solid #0a9eb5;
      }

      .label {
        background: #0a9eb5;
        color: white;
        padding: 2px 8px;
        font-size: 8pt;
        font-weight: 600;
        text-transform: uppercase;
        display: inline-block;
        margin-bottom: 5px;
      }

      em {
        font-style: italic;
      }

      strong {
        font-weight: 700;
      }

      u {
        text-decoration: underline;
      }

      .continued {
        font-size: 9pt;
        font-style: italic;
        color: #666;
        margin-top: 5px;
      }

      .page-number {
        position: fixed;
        bottom: 20px;
        right: 40px;
        font-size: 9pt;
        color: #666;
      }
    </style>
  `;

  // Build table of contents for sidebar
  let tocItems = '';
  Object.keys(articles).forEach(key => {
    const article = articles[key];
    if (article.content && article.content.trim()) {
      tocItems += `<div class="sidebar-item">${article.title} | page ${article.page || '1'}</div>`;
    }
  });

  // Build article HTML
  let articlesHTML = '';

  // Order of articles as they appear in newsletter
  const articleOrder = [
    { key: 'roshei_yeshiva', title: 'From the Roshei Yeshiva:', defaultAuthor: 'Rabbi Daniel Stein' },
    { key: 'student_dvar', title: 'Student Dvar Torah:', defaultAuthor: '' },
    { key: 'sichos_mussar', title: 'Sichos Mussar:', defaultAuthor: 'Rabbi Yaakov Feit' },
    { key: 'halacha_corner', title: 'Halacha Corner:', defaultAuthor: 'Rabbi Aryeh Lebowitz' },
    { key: 'shiur_yomi', title: 'From the Shiur Yomi of:', defaultAuthor: 'Rabbi Elchanan Adler' },
    { key: 'min_hamesorah', title: 'Min HaMesorah:', defaultAuthor: 'Rabbi Dr. Samuel Belkin' }
  ];

  articleOrder.forEach(({ key, title, defaultAuthor }) => {
    const article = articles[key];
    if (article && article.content && article.content.trim()) {
      const author = article.author || defaultAuthor;
      const content = parseFormattedText(article.content);

      articlesHTML += `
        <div class="article">
          <div class="article-title">${title}</div>
          ${author ? `<div class="article-author">${author}</div>` : ''}
          <div class="article-content">
            ${content}
          </div>
        </div>
      `;
    }
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Einayim L'Torah - ${metadata.parsha}</title>
      ${styles}
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="header-top">Vol. ${metadata.volume || '1'} | Issue ${metadata.issue || '1'} | ${metadata.parsha} ${metadata.year || '5786'}</div>
          <h1 class="title">Einayim L'Torah</h1>
          <div class="subtitle">A weekly Torah publication by and for the talmidim of YU</div>
        </div>

        <div class="sidebar">
          <h3>In this publication you can expect:</h3>
          ${tocItems}
        </div>

        <div class="content">
          ${articlesHTML}
        </div>
      </div>
    </body>
    </html>
  `;
}

app.listen(PORT, () => {
  console.log(`Einayim L'Torah Newsletter Generator running on http://localhost:${PORT}`);
});

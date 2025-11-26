const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const ejs = require('ejs');

const app = express();
const PORT = 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Serve the main form
app.get('/', (req, res) => {
  res.render('index', { title: 'Einayim L\'Torah - Newsletter Generator' });
});

// Generate PDF endpoint
app.post('/generate-pdf', async (req, res) => {
  try {
    const { metadata, articles } = req.body;

    // Process articles and format content
    const processedArticles = processArticles(articles);

    // Render the newsletter template to HTML
    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'newsletter.ejs'),
      { metadata, articles: processedArticles }
    );

    // Create PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set the base URL so CSS can be loaded
    await page.goto(`data:text/html,${encodeURIComponent(html)}`, {
      waitUntil: 'networkidle0'
    });

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

// Process articles and add formatted content
function processArticles(articles) {
  const processed = {};

  Object.keys(articles).forEach(key => {
    const article = articles[key];
    processed[key] = {
      ...article,
      formattedContent: parseFormattedText(article.content)
    };
  });

  return processed;
}

app.listen(PORT, () => {
  console.log(`Einayim L'Torah Newsletter Generator running on http://localhost:${PORT}`);
});

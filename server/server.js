const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { processArticles, parseFormattedText } = require('./utils/formatting');
const { generateLatexNewsletter, compileLatex } = require('./utils/latexGenerator');

const app = express();
const PORT = 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure multer for file uploads (using memory storage for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Serve Bootstrap from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Serve the main form
app.get('/', (req, res) => {
  res.render('index', { title: 'Einayim LaTorah - Newsletter Generator' });
});

// serve my testing bootstrap page
app.get('/bootstrap-test', (req, res) => {
  res.render('bootstrap-test');
});

// Generate newsletter preview
app.post('/preview-newsletter', upload.any(), async (req, res) => {
  try {
    // Parse the JSON data from the form
    const data = JSON.parse(req.body.data);
    const { metadata, articles } = data;

    // Process uploaded photos and add them to articles
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Extract article key from field name (e.g., "roshei_yeshiva_photo" -> "roshei_yeshiva")
        const articleKey = file.fieldname.replace('_photo', '');

        if (articles[articleKey]) {
          // Convert buffer to base64
          const base64Image = file.buffer.toString('base64');
          const mimeType = file.mimetype;
          articles[articleKey].photoData = `data:${mimeType};base64,${base64Image}`;
        }
      });
    }

    // Process articles and format content
    const processedArticles = processArticles(articles);

    // Process metadata fields (dedication and ha'arah contact)
    const processedMetadata = {
      ...metadata,
      formattedDedication: parseFormattedText(metadata.dedication),
      formattedHaarahContact: parseFormattedText(metadata.haarahContact)
    };

    // Render the newsletter template
    res.render('newsletter', {
      metadata: processedMetadata,
      articles: processedArticles
    });

  } catch (error) {
    console.error('Error generating newsletter:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error generating newsletter</h1>
          <p>${error.message}</p>
          <a href="/">Go back</a>
        </body>
      </html>
    `);
  }
});

// Generate newsletter as PDF using LaTeX
app.post('/generate-pdf', upload.any(), async (req, res) => {
  try {
    // Parse the JSON data from the form
    const data = JSON.parse(req.body.data);
    const { metadata, articles } = data;

    // Process uploaded photos and add them to articles
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Extract article key from field name (e.g., "roshei_yeshiva_photo" -> "roshei_yeshiva")
        const articleKey = file.fieldname.replace('_photo', '');

        if (articles[articleKey]) {
          // Save photo to temp directory and store path
          const fs = require('fs');
          const photoPath = path.join(__dirname, 'latex/temp', `${articleKey}_photo.${file.mimetype.split('/')[1]}`);
          fs.writeFileSync(photoPath, file.buffer);
          articles[articleKey].photoData = photoPath;
        }
      });
    }

    // Process articles and format content
    const processedArticles = processArticles(articles);

    // Process metadata fields (dedication and ha'arah contact)
    const processedMetadata = {
      ...metadata,
      formattedDedication: parseFormattedText(metadata.dedication),
      formattedHaarahContact: parseFormattedText(metadata.haarahContact)
    };

    // Generate LaTeX content
    const latexContent = await generateLatexNewsletter({
      metadata: processedMetadata,
      articles: processedArticles
    });

    // Compile to PDF
    const pdfPath = await compileLatex(latexContent, 'newsletter');

    // Send PDF file
    res.download(pdfPath, 'newsletter.pdf', (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Error generating PDF');
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error generating PDF</h1>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
          <a href="/">Go back</a>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Einayim LaTorah Newsletter Generator running on http://localhost:${PORT}`);
});
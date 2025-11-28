const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text) {
  if (!text) return '';

  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

/**
 * Convert formatted content (with <em>, <strong>, <u>) to LaTeX
 */
function convertFormattedContent(html) {
  if (!html) return '';

  let latex = html
    .replace(/<em>(.*?)<\/em>/g, '\\textit{$1}')
    .replace(/<strong>(.*?)<\/strong>/g, '\\textbf{$1}')
    .replace(/<u>(.*?)<\/u>/g, '\\underline{$1}')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<br\s*\/?>/g, '\n\n');

  // Remove any remaining HTML tags
  latex = latex.replace(/<[^>]*>/g, '');

  return latex;
}

/**
 * Generate sidebar content from articles
 */
function generateSidebarContent(articles) {
  let sidebar = '';

  Object.keys(articles).forEach(key => {
    const article = articles[key];
    if (article.content && article.content.trim()) {
      sidebar += `${escapeLatex(article.title)} | page ${article.page || '1'}\n\n`;
      sidebar += '\\rule{\\textwidth}{0.5pt}\n\n';
    }
  });

  return sidebar;
}

/**
 * Generate other articles (non-roshei yeshiva)
 */
function generateOtherArticles(articles) {
  let content = '';

  const articleOrder = [
    { key: 'student_dvar', title: 'Student Dvar Torah:', defaultAuthor: 'Student Name' },
    { key: 'sichos_mussar', title: 'Sichos Mussar:', defaultAuthor: 'Rabbi 2' },
    { key: 'halacha_corner', title: 'Halacha Corner:', defaultAuthor: 'Rabbi 3' },
    { key: 'shiur_yomi', title: 'From the Shiur Yomi of:', defaultAuthor: 'Rabbi 4' },
    { key: 'min_hamesorah', title: 'Min HaMesorah:', defaultAuthor: 'Rabbi 5' }
  ];

  articleOrder.forEach(({ key, title, defaultAuthor }) => {
    const article = articles[key];
    if (article && article.content && article.content.trim()) {
      const author = article.author || defaultAuthor;
      const showPhoto = key !== 'student_dvar' && author;

      content += '\n\\vspace{0.5in}\n\n';

      if (showPhoto && article.photoData) {
        content += `\\begin{minipage}[t]{0.15\\textwidth}\n`;
        content += `  \\centering\n`;
        content += `  \\includegraphics[width=\\textwidth]{${article.photoData}}\n\n`;
        content += `  \\colorbox{eltblue}{\\parbox{\\textwidth}{\\centering\\color{white}\\bfseries\\small ${escapeLatex(author.toUpperCase())}}}\n`;
        content += `\\end{minipage}%\n`;
        content += `\\hfill\n`;
        content += `\\begin{minipage}[t]{0.8\\textwidth}\n`;
      } else {
        content += `\\begin{minipage}[t]{\\textwidth}\n`;
      }

      content += `  {\\Large\\bfseries\\color{eltblue} ${escapeLatex(title)}}\n\n`;

      if (!showPhoto && author) {
        content += `  {\\large\\bfseries ${escapeLatex(author)}}\n\n`;
      }

      content += `  \\vspace{0.2in}\n\n`;
      content += `  \\small\n`;
      content += `  ${convertFormattedContent(article.formattedContent)}\n`;

      if (key === 'min_hamesorah' && article.bio && article.bio.trim()) {
        content += `\n  \\vspace{0.2in}\n\n`;
        content += `  \\begin{quote}\n`;
        content += `  \\small\\textit{${convertFormattedContent(article.formattedBio)}}\n`;
        content += `  \\end{quote}\n`;
      }

      content += `\\end{minipage}\n\n`;
    }
  });

  return content;
}

/**
 * Generate LaTeX newsletter from template
 */
async function generateLatexNewsletter(data) {
  const { metadata, articles } = data;

  // Read template
  const templatePath = path.join(__dirname, '../latex/templates/newsletter.tex');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Get roshei yeshiva article
  const rosheiYeshivaArticle = articles.roshei_yeshiva || {};

  // Replace variables
  // Note: Image paths are now relative to the temp directory where compilation happens
  const replacements = {
    'BACKGROUND_IMAGE_PATH': 'background.png',
    'RIETS_LOGO_PATH': 'RIETSLogo.png',
    'VOLUME_VAR': escapeLatex(metadata.volume || '1'),
    'ISSUE_VAR': escapeLatex(metadata.issue || '1'),
    'PARSHA_VAR': escapeLatex(metadata.parsha || 'Parshas Test'),
    'YEAR_VAR': escapeLatex(metadata.year || '5786'),
    'ROSHEI_YESHIVA_AUTHOR_VAR': escapeLatex(rosheiYeshivaArticle.author || 'Rabbi'),
    'ROSHEI_YESHIVA_TRANSCRIBER_VAR': escapeLatex(rosheiYeshivaArticle.transcriber || ''),
    'ROSHEI_YESHIVA_CONTENT_VAR': convertFormattedContent(rosheiYeshivaArticle.formattedContent || ''),
    'ROSHEI_YESHIVA_PHOTO_PATH': rosheiYeshivaArticle.photoData || 'RabbiReiss.png',
    'SIDEBAR_CONTENT_VAR': generateSidebarContent(articles),
    'OTHER_ARTICLES_VAR': generateOtherArticles(articles),
    'DEDICATION_VAR': metadata.dedication ? `\\vspace{0.5in}\n\n\\fcolorbox{eltblue}{white}{\\parbox{\\textwidth}{\\centering\\textit{${convertFormattedContent(metadata.formattedDedication)}}}}\n` : '',
    'QR_CODE_SECTION_VAR': '', // QR code removed for now - SVG not supported easily
    'STAFF_LIST_VAR': escapeLatex(metadata.staffList || ''),
    'CONTACT_INFO_VAR': escapeLatex(metadata.haarahContact || '')
  };

  Object.keys(replacements).forEach(key => {
    template = template.replace(new RegExp(key, 'g'), replacements[key]);
  });

  return template;
}

/**
 * Compile LaTeX to PDF
 */
async function compileLatex(latexContent, outputName = 'newsletter') {
  const tempDir = path.join(__dirname, '../latex/temp');
  const outputDir = path.join(__dirname, '../latex/output');

  // Ensure directories exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy static images to temp directory for LaTeX to find them
  const imagesDir = path.join(__dirname, '../public/images');
  const staticImages = ['background.png', 'RIETSLogo.png', 'RabbiReiss.png'];

  staticImages.forEach(imageName => {
    const srcPath = path.join(imagesDir, imageName);
    const destPath = path.join(tempDir, imageName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  // Write LaTeX file to temp directory
  const texFile = path.join(tempDir, `${outputName}.tex`);
  fs.writeFileSync(texFile, latexContent);

  // Compile with pdflatex
  try {
    execSync(`pdflatex -output-directory="${tempDir}" -interaction=nonstopmode "${texFile}"`, {
      cwd: tempDir,
      stdio: 'pipe'
    });

    // Run twice to resolve references
    execSync(`pdflatex -output-directory="${tempDir}" -interaction=nonstopmode "${texFile}"`, {
      cwd: tempDir,
      stdio: 'pipe'
    });
  } catch (error) {
    // Check if PDF was still generated despite errors/warnings
    const pdfFile = path.join(tempDir, `${outputName}.pdf`);
    if (!fs.existsSync(pdfFile)) {
      // Real error - PDF not generated
      const logFile = path.join(tempDir, `${outputName}.log`);
      if (fs.existsSync(logFile)) {
        const log = fs.readFileSync(logFile, 'utf8');
        console.error('LaTeX compilation error:', log);
      }
      throw new Error(`LaTeX compilation failed: ${error.message}`);
    }
    // PDF exists, continue despite warnings
    console.log('LaTeX warnings occurred but PDF was generated successfully');
  }

  // Move PDF to output directory
  const pdfFile = path.join(tempDir, `${outputName}.pdf`);
  const outputFile = path.join(outputDir, `${outputName}.pdf`);

  if (!fs.existsSync(pdfFile)) {
    throw new Error('PDF file was not generated');
  }

  fs.copyFileSync(pdfFile, outputFile);

  // Clean up temp files (keep only .tex and .log for debugging)
  const filesToDelete = ['.aux', '.out', '.log', '.pdf'];
  filesToDelete.forEach(ext => {
    const file = path.join(tempDir, `${outputName}${ext}`);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });

  return outputFile;
}

module.exports = {
  generateLatexNewsletter,
  compileLatex,
  escapeLatex,
  convertFormattedContent
};

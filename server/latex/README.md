# LaTeX Newsletter Generator

This directory contains the LaTeX template system for generating professional PDF newsletters.

## Directory Structure

```
latex/
├── templates/     # LaTeX template files
│   └── newsletter.tex
├── temp/          # Temporary compilation files (auto-cleaned)
└── output/        # Generated PDF files
```

## Prerequisites

You need to have LaTeX installed on your system. The system uses **XeLaTeX** for compilation (needed for custom fonts and advanced typography).

### macOS Installation
```bash
brew install --cask mactex
# Or for a smaller installation:
brew install --cask basictex
```

### Ubuntu/Debian Installation
```bash
sudo apt-get install texlive-xetex texlive-latex-extra
```

### Windows Installation
Download and install [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)

## Required LaTeX Packages

The template uses these packages (most should be included with your LaTeX distribution):
- `inputenc` - UTF-8 support
- `geometry` - Page layout
- `graphicx` - Image handling
- `xcolor` - Color support
- `fancyhdr` - Headers and footers
- `multicol` - Multi-column text
- `tikz` - Graphics and overlays
- `eso-pic` - Background images
- `ragged2e` - Text justification
- `fontspec` - Custom fonts (XeLaTeX only)

## How It Works

1. **Template Processing**: The `newsletter.tex` template contains placeholders like `{{TITLE}}`, `{{AUTHOR}}`, etc.

2. **Variable Substitution**: The Node.js `latexGenerator.js` module:
   - Reads the template
   - Replaces placeholders with actual content
   - Escapes special LaTeX characters
   - Converts HTML formatting to LaTeX commands

3. **Compilation**: The processed LaTeX is compiled with XeLaTeX:
   - First pass: Generate document structure
   - Second pass: Resolve references and page numbers
   - Output: Clean PDF file

4. **Cleanup**: Temporary files (`.aux`, `.log`, etc.) are automatically removed

## API Usage

### Generate PDF from Form Data

```javascript
const { generateLatexNewsletter, compileLatex } = require('./utils/latexGenerator');

// Generate LaTeX content
const latexContent = await generateLatexNewsletter({
  metadata: {
    volume: '1',
    issue: '1',
    parsha: 'Vayeitzei',
    year: '5786',
    dedication: 'Dedicated to...'
  },
  articles: {
    roshei_yeshiva: {
      author: 'Rabbi Name',
      content: 'Article text...',
      photoData: '/path/to/photo.jpg'
    }
    // ... other articles
  }
});

// Compile to PDF
const pdfPath = await compileLatex(latexContent, 'newsletter');
```

## Customization

### Modifying the Template

Edit `templates/newsletter.tex` to change:
- Page layout and margins
- Fonts and typography
- Colors and styling
- Header/footer design

### Adding New Variables

1. Add placeholder in template: `{{NEW_VARIABLE}}`
2. Update `latexGenerator.js` replacements object
3. Pass data in newsletter generation call

## Troubleshooting

### "xelatex: command not found"
LaTeX is not installed or not in PATH. Install using instructions above.

### Compilation Errors
Check `latex/temp/*.log` for detailed error messages.

### Font Issues
If using custom fonts, ensure they're installed system-wide or update font paths in the template.

### Image Issues
Ensure all image paths are absolute and files exist. Supported formats: PNG, JPG, PDF.

## Benefits of LaTeX over HTML/CSS

1. **Professional Typography**: Superior text rendering and spacing
2. **Predictable Output**: Same PDF output every time, no browser differences
3. **Page Control**: Precise control over page breaks and headers/footers
4. **Print Quality**: Designed for print from the ground up
5. **Multi-column**: Native support for newspaper-style columns
6. **Mathematical Typesetting**: If you need Hebrew or complex layouts

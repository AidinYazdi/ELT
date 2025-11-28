# Einayim LaTorah Newsletter Generator

A web application for generating the Einayim LaTorah weekly newsletter in PDF format.

## Features

- Web-based form for submitting articles
- Support for 6 different article sections:
  - From the Roshei Yeshiva
  - Student Dvar Torah
  - Sichos Mussar
  - Halacha Corner
  - From the Shiur Yomi
  - Min HaMesorah
- Rich text formatting support (bold, italic, underline)
- Automatic PDF generation with professional layout
- Archives all generated PDFs

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

2. Open your browser and go to:
```
http://localhost:3000
```

3. Fill in the newsletter information:
   - Volume, Issue, Parsha, Year

4. Paste articles into the appropriate sections:
   - You can paste directly from Google Docs
   - Use formatting markers for styled text:
     - `**bold**` for bold text
     - `*italic*` for italic text
     - `__underline__` for underlined text
     - `***bold italic***` for bold and italic

5. Click "Generate PDF" to create and download your newsletter

## File Structure

```
server/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── public/
│   └── index.html     # Web interface
├── archives/          # Generated PDFs stored here
│   └── ELT_Lech_Lecha_Final.pdf  # Sample newsletter
└── README.md          # This file
```

## Text Formatting Guide

When pasting articles from Google Docs, you can add formatting markers:

- **Bold**: Wrap text with `**text**`
- *Italic*: Wrap text with `*text*`
- Underline: Wrap text with `__text__`
- Paragraphs: Use double line breaks

Example:
```
This is **bold text** and this is *italic text*.

This is a new paragraph with __underlined__ text.
```

## Technologies Used

- Node.js & Express - Server framework
- Puppeteer - PDF generation
- HTML/CSS - Frontend interface

## Notes

- All generated PDFs are automatically saved to the `archives/` directory
- The application runs on port 3000 by default
- PDF generation may take a few seconds depending on content length

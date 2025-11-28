# Einayim LaTorah Newsletter Generator

A web-based application for generating the Einayim LaTorah weekly Torah newsletter in PDF format.

## Overview

This application provides a simple web interface where contributors can paste their articles, apply text formatting, and generate a professionally formatted PDF newsletter that matches the Einayim LaTorah design.

## Features

- 🎨 Beautiful web interface for article submission
- 📝 Support for 6 different article sections (Roshei Yeshiva, Student Dvar Torah, Sichos Mussar, etc.)
- ✍️ Rich text formatting (bold, italic, underline)
- 📄 Professional PDF generation matching the newsletter design
- 💾 Automatic archiving of generated PDFs
- 🔄 Compatible with Google Docs paste

## Quick Start

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

For more detailed instructions, see [server/QUICKSTART.md](server/QUICKSTART.md)

## Project Structure

```
ELT/
├── server/
│   ├── server.js              # Express server with PDF generation
│   ├── package.json           # Dependencies
│   ├── public/
│   │   └── index.html        # Web interface
│   ├── archives/             # Generated PDFs
│   ├── README.md             # Detailed server documentation
│   └── QUICKSTART.md         # User guide
└── README.md                 # This file
```

## Text Formatting

When pasting articles, use these markers for formatting:

- `**Bold text**` for **bold**
- `*Italic text*` for *italic*
- `__Underlined text__` for underline
- `***Bold and Italic***` for both

## Technologies

- **Backend**: Node.js, Express
- **PDF Generation**: Puppeteer
- **Frontend**: HTML, CSS, JavaScript

## Contributing

This newsletter is by and for the talmidim of YU. Contributions are welcome!

## License

Created for Einayim LaTorah - A weekly Torah publication by and for the talmidim of YU

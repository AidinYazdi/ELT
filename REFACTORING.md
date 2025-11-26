# EJS Refactoring Documentation

## Overview
The application has been refactored to use EJS templating engine with a proper MVC-style structure, separating concerns between views, styles, and client-side JavaScript.

## What Changed

### 1. **Project Structure**
```
server/
├── server.js                 # Refactored to use EJS
├── package.json              # Added EJS dependency
├── views/                    # NEW: EJS templates
│   ├── index.ejs            # Main form view
│   ├── newsletter.ejs       # Newsletter PDF template
│   └── partials/            # Reusable components
│       ├── header.ejs       # Common header
│       └── footer.ejs       # Common footer
├── public/
│   ├── css/                 # NEW: Separated CSS
│   │   ├── styles.css       # Main application styles
│   │   └── newsletter.css   # PDF newsletter styles
│   └── js/                  # NEW: Separated JavaScript
│       └── app.js           # Client-side logic
└── archives/                # Generated PDFs
```

### 2. **Server.js Changes**

**Before:**
- HTML was inline in JavaScript
- CSS was embedded in template strings
- All logic in one function

**After:**
- Uses EJS templating engine
- Renders templates with `res.render()` and `ejs.renderFile()`
- Separates data processing from presentation
- Clean, maintainable code structure

Key improvements:
```javascript
// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Render main form
app.get('/', (req, res) => {
  res.render('index', { title: 'Einayim L\'Torah - Newsletter Generator' });
});

// Render newsletter for PDF
const html = await ejs.renderFile(
  path.join(__dirname, 'views', 'newsletter.ejs'),
  { metadata, articles: processedArticles }
);
```

### 3. **Templating with EJS**

**Views Structure:**

- **`index.ejs`**: Main form interface
  - Includes header and footer partials
  - Clean HTML without inline styles or scripts
  - Uses EJS syntax for dynamic content

- **`newsletter.ejs`**: PDF template
  - Renders submitted articles
  - Loops through articles dynamically
  - Applies formatting from processed data

- **Partials**:
  - `header.ejs`: Contains `<head>`, CSS links, opening tags
  - `footer.ejs`: Contains closing tags, script includes

**Benefits:**
- DRY (Don't Repeat Yourself) - reusable header/footer
- Easy to maintain and update
- Clear separation of concerns
- Template inheritance

### 4. **CSS Organization**

**Before:** All CSS inline in JavaScript template strings

**After:** Two separate CSS files

- **`styles.css`**: Application styles (form, buttons, layout)
- **`newsletter.css`**: PDF-specific styles (columns, print layout)

**Benefits:**
- Easier to edit and maintain
- Better browser caching
- Proper CSS syntax highlighting
- No escaping issues

### 5. **JavaScript Organization**

**Before:** JavaScript embedded in HTML

**After:** Separate `app.js` file

Contains:
- Form submission handler
- AJAX request to generate PDF
- Loading states and error handling
- PDF download logic

**Benefits:**
- Cleaner HTML templates
- Reusable JavaScript functions
- Better debugging
- Proper code organization

## How It Works

### Request Flow:

1. **GET `/`**:
   ```
   Browser → Server → Renders index.ejs → Returns HTML to client
   ```

2. **POST `/generate-pdf`**:
   ```
   Client form submission
   → Server receives data
   → Processes articles (formats text)
   → Renders newsletter.ejs with data
   → Puppeteer converts to PDF
   → Returns PDF to client
   ```

### Data Processing:

```javascript
// Articles submitted from form
const articles = { roshei_yeshiva: { content: "raw text..." } }

// Server processes formatting
const processedArticles = processArticles(articles)
// { roshei_yeshiva: { content: "raw text...", formattedContent: "<p>...</p>" } }

// EJS template receives processed data
<%- article.formattedContent %>  // Renders as HTML
```

## EJS Syntax Used

- `<%= variable %>` - Escapes HTML (safe for user input)
- `<%- variable %>` - Unescaped (for HTML content)
- `<% code %>` - JavaScript logic
- `<%- include('partial') %>` - Include partial templates

## Benefits of This Refactoring

1. **Maintainability**: Each concern is in its own file
2. **Scalability**: Easy to add new templates or styles
3. **Readability**: Clear separation makes code easier to understand
4. **Reusability**: Partials can be reused across views
5. **Testing**: Easier to test separate components
6. **Collaboration**: Multiple developers can work on different files
7. **Standards**: Follows Express.js best practices

## Migration Notes

- Removed `public/index.html` (replaced by `views/index.ejs`)
- All functionality remains the same
- No changes to API endpoints
- Backward compatible with existing workflows

## Development Workflow

1. **Edit Templates**: Modify `.ejs` files in `views/`
2. **Edit Styles**: Update CSS in `public/css/`
3. **Edit Client Logic**: Update `public/js/app.js`
4. **Server Logic**: Modify `server.js`

Changes are reflected immediately - just refresh the browser!

## Testing

The refactored application has been tested and confirmed working:
- ✅ Server starts successfully
- ✅ Main form renders correctly
- ✅ EJS templates compile
- ✅ CSS and JS files load properly
- ✅ Article submission flow intact
- ✅ PDF generation works with new structure

## Future Enhancements

With this new structure, it's now easier to add:
- Multiple page layouts
- Admin panel for managing templates
- User authentication views
- Email preview templates
- Custom themes/styles
- A/B testing different layouts

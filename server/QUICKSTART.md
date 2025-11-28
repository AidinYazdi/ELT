# Quick Start Guide - Einayim LaTorah Newsletter Generator

## Getting Started (First Time Setup)

1. **Open Terminal and navigate to the server folder:**
   ```bash
   cd /Users/aidinyazdi/Coding/ELT/server
   ```

2. **Install dependencies** (only needed once):
   ```bash
   npm install
   ```
   This may take a few minutes as it downloads necessary packages.

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your web browser and go to:**
   ```
   http://localhost:3000
   ```

## Using the Newsletter Generator

### Step 1: Fill in Newsletter Info
- **Volume**: Current volume number (e.g., 1)
- **Issue**: Current issue number (e.g., 6)
- **Parsha**: Name of the weekly parsha (e.g., "Lech Lecha")
- **Year**: Hebrew year (e.g., 5786)

### Step 2: Add Your Articles

For each section, paste your article and optionally add the author name:

- **From the Roshei Yeshiva** - Usually Rabbi Daniel Stein
- **Student Dvar Torah** - Add student's name
- **Sichos Mussar** - Usually Rabbi Yaakov Feit
- **Halacha Corner** - Usually Rabbi Aryeh Lebowitz
- **From the Shiur Yomi** - Usually Rabbi Elchanan Adler
- **Min HaMesorah** - Featured Rabbi of the week

### Step 3: Format Your Text

When pasting from Google Docs, add formatting using these markers:

- **Bold**: `**text**` → **text**
- **Italic**: `*text*` → *text*
- **Underline**: `__text__` → underlined text
- **Bold + Italic**: `***text***` → ***text***

**Example:**
```
The **Ramban** explains that *emunah* is the __foundation__ of our faith.
```

### Step 4: Generate PDF

1. Click the **"Generate PDF"** button at the bottom
2. Wait a few seconds while the PDF is created
3. The PDF will automatically download to your computer
4. A copy is also saved in the `archives` folder

## Tips

- You don't need to fill in ALL sections - only add the ones you have content for
- The formatting markers work anywhere in your text
- Use double line breaks to create new paragraphs
- Author names are optional if using the default authors
- Generated PDFs are automatically named with the parsha and timestamp

## Troubleshooting

**Server won't start?**
- Make sure you ran `npm install` first
- Check that port 3000 isn't already in use

**PDF generation fails?**
- Make sure at least one article section has content
- Check that the formatting markers are correct (`**` for bold, not `*`)

**Need help?**
- Check the main README.md for more detailed information
- Contact the technical team

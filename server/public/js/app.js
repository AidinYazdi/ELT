// Main Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newsletterForm');

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

async function handleFormSubmit(e) {
  e.preventDefault();

  const printBtn = document.getElementById('printBtn');
  const loading = document.getElementById('loading');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Hide previous messages
  successMessage.classList.remove('show');
  errorMessage.classList.remove('show');

  // Show loading
  printBtn.disabled = true;
  loading.classList.add('show');

  try {
    // Gather metadata
    const metadata = {
      volume: document.getElementById('volume').value,
      issue: document.getElementById('issue').value,
      parsha: document.getElementById('parsha').value,
      year: document.getElementById('year').value
    };

    // Gather articles
    const articles = {
      roshei_yeshiva: {
        title: 'From the Roshei Yeshiva:',
        author: document.getElementById('roshei_yeshiva_author').value,
        content: document.getElementById('roshei_yeshiva_content').value,
        page: '1'
      },
      student_dvar: {
        title: 'Student Dvar Torah',
        author: document.getElementById('student_dvar_author').value,
        content: document.getElementById('student_dvar_content').value,
        page: '2'
      },
      sichos_mussar: {
        title: 'Sichos Mussar',
        author: document.getElementById('sichos_mussar_author').value,
        content: document.getElementById('sichos_mussar_content').value,
        page: '4'
      },
      halacha_corner: {
        title: 'Halacha Corner',
        author: document.getElementById('halacha_corner_author').value,
        content: document.getElementById('halacha_corner_content').value,
        page: '4'
      },
      shiur_yomi: {
        title: 'From the Shiur Yomi of',
        author: document.getElementById('shiur_yomi_author').value,
        content: document.getElementById('shiur_yomi_content').value,
        page: '5'
      },
      min_hamesorah: {
        title: 'Min HaMesorah',
        author: document.getElementById('min_hamesorah_author').value,
        content: document.getElementById('min_hamesorah_content').value,
        page: '6'
      }
    };

    // Send to server
    const response = await fetch('/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metadata, articles })
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    // Download PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ELT_${metadata.parsha}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Show success
    loading.classList.remove('show');
    successMessage.classList.add('show');
    printBtn.disabled = false;

  } catch (error) {
    console.error('Error:', error);
    loading.classList.remove('show');
    errorMessage.classList.add('show');
    errorMessage.textContent = 'Error generating PDF: ' + error.message;
    printBtn.disabled = false;
  }
}

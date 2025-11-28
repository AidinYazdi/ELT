// Main Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newsletterForm');
  const pdfBtn = document.getElementById('pdfBtn');

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (pdfBtn) {
    pdfBtn.addEventListener('click', handlePdfGeneration);
  }
});

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('newsletterForm');

  // Create FormData to handle both files and JSON data
  const formData = new FormData();

  // Gather metadata
  const metadata = {
    volume: document.getElementById('volume').value,
    issue: document.getElementById('issue').value,
    parsha: document.getElementById('parsha').value,
    year: document.getElementById('year').value,
    dedication: document.getElementById('dedication_text').value,
    staffList: document.getElementById('staff_list').value,
    haarahContact: document.getElementById('haarah_contact').value
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
      bio: document.getElementById('min_hamesorah_bio').value,
      content: document.getElementById('min_hamesorah_content').value,
      page: '6'
    }
  };

  // Add JSON data
  formData.append('data', JSON.stringify({ metadata, articles }));

  // Add photo files
  const photoFields = [
    'roshei_yeshiva_photo',
    'sichos_mussar_photo',
    'halacha_corner_photo',
    'shiur_yomi_photo',
    'min_hamesorah_photo'
  ];

  photoFields.forEach(fieldName => {
    const fileInput = document.getElementById(fieldName);
    if (fileInput && fileInput.files[0]) {
      formData.append(fieldName, fileInput.files[0]);
    }
  });

  // Create a hidden form to submit FormData
  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = '/preview-newsletter';
  hiddenForm.target = '_blank';
  hiddenForm.enctype = 'multipart/form-data';

  // Convert FormData to form inputs
  for (let [key, value] of formData.entries()) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;

    if (value instanceof File) {
      // For files, we need to use a file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name = key;
      fileInput.style.display = 'none';

      // Create a DataTransfer to set the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(value);
      fileInput.files = dataTransfer.files;

      hiddenForm.appendChild(fileInput);
    } else {
      input.value = value;
      hiddenForm.appendChild(input);
    }
  }

  // Submit the form
  document.body.appendChild(hiddenForm);
  hiddenForm.submit();
  document.body.removeChild(hiddenForm);
}

async function handlePdfGeneration(e) {
  e.preventDefault();

  // Gather form data (same as handleFormSubmit)
  const metadata = {
    volume: document.getElementById('volume').value,
    issue: document.getElementById('issue').value,
    parsha: document.getElementById('parsha').value,
    year: document.getElementById('year').value,
    dedication: document.getElementById('dedication_text').value,
    staffList: document.getElementById('staff_list').value,
    haarahContact: document.getElementById('haarah_contact').value
  };

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
      bio: document.getElementById('min_hamesorah_bio').value,
      content: document.getElementById('min_hamesorah_content').value,
      page: '6'
    }
  };

  // Create FormData with files
  const formData = new FormData();
  formData.append('data', JSON.stringify({ metadata, articles }));

  // Add photo files
  const photoFields = [
    'roshei_yeshiva_photo',
    'sichos_mussar_photo',
    'halacha_corner_photo',
    'shiur_yomi_photo',
    'min_hamesorah_photo'
  ];

  photoFields.forEach(fieldName => {
    const fileInput = document.getElementById(fieldName);
    if (fileInput && fileInput.files[0]) {
      formData.append(fieldName, fileInput.files[0]);
    }
  });

  // Show loading message
  const btn = document.getElementById('pdfBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Generating PDF...';
  btn.disabled = true;

  try {
    // Send request to generate PDF
    const response = await fetch('/generate-pdf', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please check the console for details.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

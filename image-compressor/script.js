document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const imageUpload = document.getElementById('imageUpload');
  const previewImage = document.getElementById('previewImage');
  const downloadButton = document.getElementById('downloadButton');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityValue = document.getElementById('qualityValue');
  const resizeCheck = document.getElementById('resizeCheck');
  const resizeOptions = document.getElementById('resizeOptions');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const uploadError = document.getElementById('uploadError');
  const originalSize = document.getElementById('originalSize');
  const compressedSize = document.getElementById('compressedSize');
  const compressionRatio = document.getElementById('compressionRatio');

  // Variables
  let originalFile = null;
  let compressedBlob = null;

  // Event Listeners
  imageUpload.addEventListener('change', handleImageUpload);
  downloadButton.addEventListener('click', handleDownload);
  qualitySlider.addEventListener('input', updateQualityValue);
  resizeCheck.addEventListener('change', toggleResizeOptions);

  // Initialize
  updateQualityValue();

  // Functions
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      showError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      showError('File size exceeds 50MB limit');
      return;
    }

    originalFile = file;
    const reader = new FileReader();

    reader.onload = function(event) {
      previewImage.src = event.target.result;
      updateFileInfo(file.size, null);
      downloadButton.classList.remove('hidden');
    };

    reader.readAsDataURL(file);
  }

  function handleDownload() {
    if (!previewImage.src) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (resizeCheck.checked) {
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        
        if (newWidth && !newHeight) {
          width = newWidth;
          height = (img.height * newWidth) / img.width;
        } else if (!newWidth && newHeight) {
          height = newHeight;
          width = (img.width * newHeight) / img.height;
        } else if (newWidth && newHeight) {
          width = newWidth;
          height = newHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image with new dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Get quality value (0.1 - 1)
      const quality = parseFloat(qualitySlider.value);

      // Convert to blob with specified quality
      canvas.toBlob((blob) => {
        compressedBlob = blob;
        const compressedUrl = URL.createObjectURL(blob);
        
        // Update download link
        downloadButton.href = compressedUrl;
        downloadButton.download = `compressed_${originalFile.name}`;
        
        // Update file info
        updateFileInfo(originalFile.size, blob.size);
        
        // Force download
        downloadButton.click();
      }, 'image/jpeg', quality);
    };

    img.src = previewImage.src;
  }

  function updateFileInfo(originalSizeBytes, compressedSizeBytes) {
    // Format file sizes
    const formatSize = (bytes) => {
      if (!bytes) return '-';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    originalSize.textContent = `Original: ${formatSize(originalSizeBytes)}`;
    
    if (compressedSizeBytes) {
      compressedSize.textContent = `Compressed: ${formatSize(compressedSizeBytes)}`;
      const ratio = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(0);
      compressionRatio.textContent = `${ratio}% smaller`;
    } else {
      compressedSize.textContent = 'Compressed: -';
      compressionRatio.textContent = '';
    }
  }

  function updateQualityValue() {
    qualityValue.textContent = `${(qualitySlider.value * 100).toFixed(0)}%`;
  }

  function toggleResizeOptions() {
    resizeOptions.classList.toggle('hidden', !resizeCheck.checked);
  }

  function showError(message) {
    uploadError.textContent = message;
    uploadError.classList.remove('hidden');
    setTimeout(() => {
      uploadError.classList.add('hidden');
    }, 5000);
  }
});



const userName = document.getElementById("name");
const submitBtn = document.getElementById("submitBtn");

// Check if PDFLib is available
if (typeof PDFLib === 'undefined') {
    console.error('PDFLib is not loaded. Please check the CDN link.');
    alert('PDF library not loaded. Please refresh the page and try again.');
}

// Check if fontkit is available
if (typeof fontkit === 'undefined') {
    console.error('Fontkit is not loaded. Please check the CDN link.');
    alert('Font library not loaded. Please refresh the page and try again.');
}

const { PDFDocument, rgb, degrees } = PDFLib || {};

// Firebase Database Reference for Certificates
let certificateRef = firebase.database().ref('Certificates');

// Function to generate unique certificate code
const generateCertificateCode = () => {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomStr = Math.random().toString(36).substring(2, 8); // Random 6 characters
    const year = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
    return `CERT-${year}-${timestamp}-${randomStr}`.toUpperCase();
};

// Function to save certificate to Firebase
const saveCertificate = (code, name, email, phone, college) => {
    const certificateData = {
        name: name,
        email: email,
        phone: phone,
        college: college,
        generatedDate: new Date().toISOString(),
        verified: false,
        code: code
    };
    
    // Save to Firebase Database
    certificateRef.child(code).set(certificateData)
        .then(() => {
            console.log('Certificate saved to Firebase successfully');
        })
        .catch((error) => {
            console.error('Error saving certificate:', error);
        });
};

// Function to verify certificate from Firebase
const verifyCertificate = (code) => {
    return new Promise((resolve) => {
        certificateRef.child(code).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const certificate = snapshot.val();
                    // Update verification status
                    certificateRef.child(code).update({
                        verified: true,
                        verifiedDate: new Date().toISOString()
                    });
                    
                    resolve({
                        valid: true,
                        data: certificate
                    });
                } else {
                    resolve({ valid: false });
                }
            })
            .catch((error) => {
                console.error('Error verifying certificate:', error);
                resolve({ valid: false });
            });
    });
};

// Form validation functions with field tracking
let fieldTouched = {
    name: false,
    email: false,
    phone: false,
    college: false
};

const validateName = (name, showError = false) => {
    const nameInput = document.getElementById("name");
    const nameError = document.getElementById("nameError");
    
    if (name.length < 3) {
        nameInput.classList.add("input-error");
        nameInput.classList.remove("input-valid");
        if (showError && fieldTouched.name) {
            nameError.textContent = "Name must be at least 3 characters long";
            nameError.style.display = "block";
        }
        return false;
    } else if (name.length > 64) {
        nameInput.classList.add("input-error");
        nameInput.classList.remove("input-valid");
        if (showError && fieldTouched.name) {
            nameError.textContent = "Name cannot exceed 64 characters";
            nameError.style.display = "block";
        }
        return false;
    } else {
        nameInput.classList.remove("input-error");
        nameInput.classList.add("input-valid");
        nameError.style.display = "none";
        return true;
    }
};

const validateEmail = (email, showError = false) => {
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    // More strict email regex that prevents special characters in domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
        emailInput.classList.add("input-error");
        emailInput.classList.remove("input-valid");
        if (showError && fieldTouched.email) {
            emailError.textContent = "Please enter a valid email address";
            emailError.style.display = "block";
        }
        return false;
    } else {
        emailInput.classList.remove("input-error");
        emailInput.classList.add("input-valid");
        emailError.style.display = "none";
        return true;
    }
};

const validatePhone = (phone, showError = false) => {
    const phoneInput = document.getElementById("phone");
    const phoneError = document.getElementById("phoneError");
    // Remove all non-digit characters and check for exactly 10 digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
        phoneInput.classList.add("input-error");
        phoneInput.classList.remove("input-valid");
        if (showError && fieldTouched.phone) {
            phoneError.style.display = "block";
        }
        return false;
    } else {
        phoneInput.classList.remove("input-error");
        phoneInput.classList.add("input-valid");
        phoneError.style.display = "none";
        return true;
    }
};

const validateCollege = (college, showError = false) => {
    const collegeInput = document.getElementById("college");
    const collegeError = document.getElementById("collegeError");
    
    const trimmedCollege = college.trim();
    
    // Check minimum length
    if (trimmedCollege.length < 3) {
        collegeInput.classList.add("input-error");
        collegeInput.classList.remove("input-valid");
        if (showError && fieldTouched.college) {
            collegeError.textContent = "College name must be at least 3 characters long";
            collegeError.style.display = "block";
        }
        return false;
    }
    
    // Check if it's only digits
    if (/^\d+$/.test(trimmedCollege)) {
        collegeInput.classList.add("input-error");
        collegeInput.classList.remove("input-valid");
        if (showError && fieldTouched.college) {
            collegeError.textContent = "College name cannot contain only numbers";
            collegeError.style.display = "block";
        }
        return false;
    }
    
    // Check if it contains at least one letter
    if (!/[a-zA-Z]/.test(trimmedCollege)) {
        collegeInput.classList.add("input-error");
        collegeInput.classList.remove("input-valid");
        if (showError && fieldTouched.college) {
            collegeError.textContent = "College name must contain at least one letter";
            collegeError.style.display = "block";
        }
        return false;
    }
    
    // Check for common invalid patterns
    const invalidPatterns = [
        /^[0-9\s\-\(\)]+$/, // Only numbers, spaces, hyphens, parentheses
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Only special characters
        /^(test|demo|example|sample|xyz|abc|123)$/i, // Common test values
        /^[a-zA-Z]{1,2}$/, // Too short (1-2 letters only)
    ];
    
    for (let pattern of invalidPatterns) {
        if (pattern.test(trimmedCollege)) {
            collegeInput.classList.add("input-error");
            collegeInput.classList.remove("input-valid");
            if (showError && fieldTouched.college) {
                collegeError.textContent = "Please enter a valid college name";
                collegeError.style.display = "block";
            }
            return false;
        }
    }
    
    // Check for reasonable length (not too long)
    if (trimmedCollege.length > 100) {
        collegeInput.classList.add("input-error");
        collegeInput.classList.remove("input-valid");
        if (showError && fieldTouched.college) {
            collegeError.textContent = "College name is too long (maximum 100 characters)";
            collegeError.style.display = "block";
        }
        return false;
    }
    
    // If all validations pass
    collegeInput.classList.remove("input-error");
    collegeInput.classList.add("input-valid");
    collegeError.style.display = "none";
    return true;
};

const checkFormValidity = () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const college = document.getElementById("college").value;
    const submitBtn = document.getElementById("submitBtn");
    
    const isNameValid = validateName(name, true);
    const isEmailValid = validateEmail(email, true);
    const isPhoneValid = validatePhone(phone, true);
    const isCollegeValid = validateCollege(college, true);
    
    if (isNameValid && isEmailValid && isPhoneValid && isCollegeValid) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
};

// Add event listeners for form validation
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const collegeInput = document.getElementById("college");
    const form = document.getElementById("fo");
    
    // Prevent form submission on Enter key
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Don't do anything here - let the button click handler handle everything
        });
    }
    
    // Name validation - on blur and input
    nameInput.addEventListener('focus', () => {
        fieldTouched.name = true;
    });
    
    nameInput.addEventListener('blur', () => {
        fieldTouched.name = true;
        // Capitalize name properly
        const capitalizedName = nameInput.value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        nameInput.value = capitalizedName;
        validateName(capitalizedName, true);
        checkFormValidity();
    });
    
    nameInput.addEventListener('input', () => {
        validateName(nameInput.value, false);
        checkFormValidity();
    });
    
    // Email validation - on blur and input
    emailInput.addEventListener('focus', () => {
        fieldTouched.email = true;
    });
    
    emailInput.addEventListener('blur', () => {
        fieldTouched.email = true;
        validateEmail(emailInput.value, true);
        checkFormValidity();
    });
    
    emailInput.addEventListener('input', () => {
        validateEmail(emailInput.value, false);
        checkFormValidity();
    });
    
    // Phone validation - on blur and input
    phoneInput.addEventListener('focus', () => {
        fieldTouched.phone = true;
    });
    
    phoneInput.addEventListener('blur', () => {
        fieldTouched.phone = true;
        validatePhone(phoneInput.value, true);
        checkFormValidity();
    });
    
    phoneInput.addEventListener('input', () => {
        validatePhone(phoneInput.value, false);
        checkFormValidity();
    });
    
    // College validation - on blur and input
    collegeInput.addEventListener('focus', () => {
        fieldTouched.college = true;
    });
    
    collegeInput.addEventListener('blur', () => {
        fieldTouched.college = true;
        validateCollege(collegeInput.value, true);
        checkFormValidity();
    });
    
    collegeInput.addEventListener('input', () => {
        validateCollege(collegeInput.value, false);
        checkFormValidity();
    });
});

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Submit button clicked');
    
    // Prevent multiple clicks
    if (submitBtn.disabled) {
        console.log('Button already disabled, ignoring click');
        return;
    }
    
    const val = userName.value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const college = document.getElementById("college").value;
    
    console.log('Form values:', { name: val, email, phone, college });
    
    // Validate all fields before proceeding
    const isNameValid = validateName(val, true);
    const isEmailValid = validateEmail(email, true);
    const isPhoneValid = validatePhone(phone, true);
    const isCollegeValid = validateCollege(college, true);
    
    console.log('Validation results:', { isNameValid, isEmailValid, isPhoneValid, isCollegeValid });
    
    if (isNameValid && isEmailValid && isPhoneValid && isCollegeValid) {
        console.log('All validations passed, starting certificate generation...');
        
        // Set loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Generating Certificate...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Save to Firebase first
            if (typeof sendMessage === 'function') {
                sendMessage(val, email, phone, college);
            }
            
            // Generate PDF certificate
            await generatePDF(val, email, phone, college);
            
            // Show success alert
            const alertElement = document.querySelector('.alert');
            if (alertElement) {
                alertElement.style.display = 'block';
                setTimeout(function() {
                    alertElement.style.display = 'none';
                }, 7000);
            }
            
            // Reset form
            document.getElementById('fo').reset();
            
            // Reset validation states
            fieldTouched = {
                name: false,
                email: false,
                phone: false,
                college: false
            };
            
            // Reset input classes
            document.getElementById("name").classList.remove("input-error", "input-valid");
            document.getElementById("email").classList.remove("input-error", "input-valid");
            document.getElementById("phone").classList.remove("input-error", "input-valid");
            document.getElementById("college").classList.remove("input-error", "input-valid");
            
            // Show success state
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.textContent = 'Certificate Generated!';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('success');
                submitBtn.disabled = true; // Keep disabled until form is filled again
            }, 3000);
            
        } catch (error) {
            console.error('Error calling generatePDF:', error);
            alert('Error starting certificate generation: ' + error.message);
            
            // Reset button state on error
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('loading', 'success');
            submitBtn.disabled = false;
        }
    } else {
        console.log('Validation failed, focusing on first invalid field');
        // Focus on the first invalid field
        if (!isNameValid) {
            document.getElementById("name").focus();
        } else if (!isEmailValid) {
            document.getElementById("email").focus();
        } else if (!isPhoneValid) {
            document.getElementById("phone").focus();
        } else if (!isCollegeValid) {
            document.getElementById("college").focus();
        }
    }
});

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('verificationModal');
    const verifyBtn = document.getElementById('verifyCertificateBtn');
    const closeBtn = document.querySelector('.close');
    const closeModalBtn = document.querySelector('.close-modal');
    const verificationForm = document.getElementById('verificationForm');
    
    // Open modal
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
        });
    }
    
    // Close modal with X button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            resetVerificationForm();
        });
    }
    
    // Close modal with Cancel button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            resetVerificationForm();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetVerificationForm();
        }
    });
    
    // Handle form submission
    if (verificationForm) {
        verificationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const code = document.getElementById('certificateCode').value.trim();
            
            if (code) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Verifying...';
                submitBtn.disabled = true;
                
                try {
                    const result = await verifyCertificate(code);
                    const successAlert = document.getElementById('verificationSuccess');
                    const errorAlert = document.getElementById('verificationError');
                    const certificateDetails = document.getElementById('certificateDetails');
                    const verificationFormDiv = document.querySelector('.verification-form');
                    
                    if (result.valid) {
                        // Hide form and show certificate details
                        verificationFormDiv.classList.add('hidden');
                        certificateDetails.style.display = 'block';
                        successAlert.style.display = 'none';
                        errorAlert.style.display = 'none';
                        
                        // Populate certificate details
                        document.getElementById('certName').textContent = result.data.name;
                        document.getElementById('certEmail').textContent = result.data.email;
                        document.getElementById('certPhone').textContent = result.data.phone;
                        document.getElementById('certCollege').textContent = result.data.college;
                        document.getElementById('certGenerated').textContent = new Date(result.data.generatedDate).toLocaleDateString();
                        document.getElementById('certVerified').textContent = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
                    } else {
                        // Show error message
                        errorAlert.style.display = 'block';
                        successAlert.style.display = 'none';
                        certificateDetails.style.display = 'none';
                        verificationFormDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error('Verification error:', error);
                    const errorAlert = document.getElementById('verificationError');
                    errorAlert.style.display = 'block';
                    errorAlert.textContent = 'Error verifying certificate. Please try again.';
                } finally {
                    // Reset button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
    
    // Handle "Verify Another Certificate" button
    const verifyAnotherBtn = document.getElementById('verifyAnotherBtn');
    if (verifyAnotherBtn) {
        verifyAnotherBtn.addEventListener('click', function() {
            const certificateDetails = document.getElementById('certificateDetails');
            const verificationFormDiv = document.querySelector('.verification-form');
            const successAlert = document.getElementById('verificationSuccess');
            const errorAlert = document.getElementById('verificationError');
            
            // Hide certificate details and show form again
            certificateDetails.style.display = 'none';
            verificationFormDiv.classList.remove('hidden');
            successAlert.style.display = 'none';
            errorAlert.style.display = 'none';
            
            // Reset form
            if (verificationForm) {
                verificationForm.reset();
            }
        });
    }
    
    // Reset form function
    function resetVerificationForm() {
        if (verificationForm) {
            verificationForm.reset();
        }
        const successAlert = document.getElementById('verificationSuccess');
        const errorAlert = document.getElementById('verificationError');
        const certificateDetails = document.getElementById('certificateDetails');
        const verificationFormDiv = document.querySelector('.verification-form');
        
        if (successAlert) successAlert.style.display = 'none';
        if (errorAlert) errorAlert.style.display = 'none';
        if (certificateDetails) certificateDetails.style.display = 'none';
        if (verificationFormDiv) verificationFormDiv.classList.remove('hidden');
    }
});

const generatePDF = async (name, email, phone, college) => {
    try {
        console.log('Starting PDF generation...');
        console.log('Parameters:', { name, email, phone, college });
        
        // Check if required libraries are loaded
        if (typeof PDFDocument === 'undefined') {
            console.error('PDFLib is not loaded');
            throw new Error('PDFLib is not loaded. Please refresh the page and try again.');
        }
        
        if (typeof fontkit === 'undefined') {
            console.error('Fontkit is not loaded');
            throw new Error('Fontkit is not loaded. Please refresh the page and try again.');
        }
        
        console.log('Libraries loaded successfully');
        
        // Generate unique certificate code first
        const certificateCode = generateCertificateCode();
        console.log('Generated certificate code:', certificateCode);
        
        // Save certificate data to Firebase
        console.log('Saving certificate to Firebase...');
        saveCertificate(certificateCode, name, email, phone, college);
        
        console.log('Fetching PDF template...');
        let existingPdfBytes;
        let useFallback = false;
        
        try {
            const response = await fetch("Certificate_nagpur.pdf");
            console.log('PDF fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}`);
            }
            
            existingPdfBytes = await response.arrayBuffer();
            console.log('PDF template loaded successfully, size:', existingPdfBytes.byteLength);
        } catch (error) {
            console.warn('Could not fetch PDF template, creating fallback PDF...', error);
            useFallback = true;
        }
        
        let pdfDoc;
        let SanChezFont;
        
        if (useFallback) {
            console.log('Creating fallback PDF...');
            // Create a new PDF if template is not found
            pdfDoc = PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]); // Standard letter size
            
            // Add basic certificate content
            page.drawText('Certificate of Appreciation', {
                x: 150,
                y: 700,
                size: 24,
                color: rgb(0, 0, 0),
            });
            
            page.drawText('This is to certify that', {
                x: 200,
                y: 650,
                size: 16,
                color: rgb(0, 0, 0),
            });
            
            // Add name
            page.drawText(name, {
                x: 200,
                y: 600,
                size: 20,
                color: rgb(0, 0, 0),
            });
            
            // Add certificate code
            page.drawText(certificateCode, {
                x: 200,
                y: 100,
                size: 12,
                color: rgb(0.5, 0.5, 0.5),
            });
            
            console.log('Fallback PDF created successfully');
        } else {
            console.log('Loading PDF document from template...');
            // Load a PDFDocument from the existing PDF bytes
            pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            console.log('Registering fontkit...');
            pdfDoc.registerFontkit(fontkit);

            console.log('Fetching font...');
            //get font
            let fontBytes;
            
            try {
                const fontResponse = await fetch("Paul-le1V.ttf");
                console.log('Font fetch response status:', fontResponse.status);
                
                if (!fontResponse.ok) {
                    throw new Error(`Failed to fetch font: ${fontResponse.status} ${fontResponse.statusText}`);
                }
                
                fontBytes = await fontResponse.arrayBuffer();
                console.log('Font loaded successfully, size:', fontBytes.byteLength);
                
                console.log('Embedding font...');
                // Embed our custom font in the document
                SanChezFont = await pdfDoc.embedFont(fontBytes);
                console.log('Font embedded successfully');
            } catch (fontError) {
                console.warn('Font loading failed, using default font:', fontError);
                // Use default font if custom font fails
                SanChezFont = await pdfDoc.embedFont(await pdfDoc.getFont('Helvetica'));
                console.log('Using default Helvetica font');
            }
            
            // Get the first page of the document
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            console.log('Got first page, dimensions:', firstPage.getSize());
         
            // Calculate text width to center it
            const fontSize = 55;
            const textWidth = SanChezFont.widthOfTextAtSize(name, fontSize);
            console.log('Name text width:', textWidth);
            
            // Get page dimensions
            const { width: pageWidth } = firstPage.getSize();
            console.log('Page width:', pageWidth);
            
            // Calculate center position (page center - half of text width)
            const centerX = (pageWidth - textWidth) / 2;
            console.log('Calculated center X position:', centerX);
         
            // Draw a string of text centered on the first page
            firstPage.drawText(name, {
              x: centerX,
              y: 270,
              size: fontSize,
              font: SanChezFont,
              color: rgb(1.0, 0.84, 0.00),
            });
            console.log('Name drawn on PDF');

            // Add certificate code (smaller font, positioned at bottom)
            const codeFontSize = 12;
            const codeTextWidth = SanChezFont.widthOfTextAtSize(certificateCode, codeFontSize);
            const codeCenterX = (pageWidth - codeTextWidth) / 2;
            
            firstPage.drawText(certificateCode, {
              x: codeCenterX,
              y: 50, // Position at bottom of certificate
              size: codeFontSize,
              font: SanChezFont,
              color: rgb(0.5, 0.5, 0.5), // Gray color for subtle appearance
            });
            console.log('Certificate code drawn on PDF');
        }
     
        console.log('Serializing PDF...');
        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        console.log('PDF serialized successfully');

        console.log('Creating download link...');
        // Create a temporary link to download the PDF
        const link = document.createElement('a');
        link.href = pdfDataUri;
        link.download = "Certificate for Appreciation.pdf";
        
        console.log('Triggering download...');
        // Trigger download
        link.click();
        
        // Clean up
        link.remove();
        
        console.log('PDF generation completed successfully!');
        
        // Show certificate code notification
        showCertificateCodeNotification(certificateCode);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            fileName: error.fileName,
            lineNumber: error.lineNumber
        });
        
        // More specific error messages
        let errorMessage = 'Error generating certificate. ';
        if (error.message.includes('PDFLib')) {
            errorMessage += 'PDF library not loaded properly. Please refresh the page and try again.';
        } else if (error.message.includes('fetch')) {
            errorMessage += 'Could not load certificate template. Please check your internet connection.';
        } else if (error.message.includes('font')) {
            errorMessage += 'Font loading failed. Using fallback font.';
        } else {
            errorMessage += 'Please try again. Error: ' + error.message;
        }
        
        alert(errorMessage);
    }
};

// Function to show certificate code notification
const showCertificateCodeNotification = (certificateCode) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    font-family: Arial, sans-serif;
    animation: slideIn 0.5s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="margin-bottom: 15px;">
      <strong style="font-size: 16px;">Certificate Generated Successfully! 🎉</strong>
    </div>
    <div style="margin-bottom: 15px; font-size: 14px;">
      Your certificate code is: <strong>${certificateCode}</strong>
    </div>
    <div style="display: flex; gap: 10px;">
      <button id="copyCodeBtn" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      ">Copy Code</button>
      <button id="closeNotificationBtn" style="
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      ">Close</button>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Copy code functionality
  const copyBtn = notification.querySelector('#copyCodeBtn');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(certificateCode);
      copyBtn.textContent = 'Copied! ✓';
      copyBtn.style.background = '#45a049';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Code';
        copyBtn.style.background = '#4CAF50';
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = certificateCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      copyBtn.textContent = 'Copied! ✓';
      copyBtn.style.background = '#45a049';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Code';
        copyBtn.style.background = '#4CAF50';
      }, 2000);
    }
  });
  
  // Close notification
  const closeBtn = notification.querySelector('#closeNotificationBtn');
  closeBtn.addEventListener('click', () => {
    notification.remove();
    style.remove();
  });
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
      style.remove();
    }
  }, 10000);
};

// Function to check if required files are accessible
const checkRequiredFiles = async () => {
    const files = [
        { name: 'PDF Template', url: 'Certificate_nagpur.pdf' },
        { name: 'Font File', url: 'Paul-le1V.ttf' }
    ];
    
    const results = [];
    
    for (const file of files) {
        try {
            const response = await fetch(file.url, { method: 'HEAD' });
            results.push({
                name: file.name,
                accessible: response.ok,
                status: response.status,
                statusText: response.statusText
            });
        } catch (error) {
            results.push({
                name: file.name,
                accessible: false,
                error: error.message
            });
        }
    }
    
    console.log('File accessibility check results:', results);
    return results;
};

// Check files when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Secure Cypher Certificate System Initialization ===');
    console.log('Checking required files...');
    const fileCheck = await checkRequiredFiles();
    
    const inaccessibleFiles = fileCheck.filter(file => !file.accessible);
    if (inaccessibleFiles.length > 0) {
        console.warn('Some required files are not accessible:', inaccessibleFiles);
        console.warn('Certificate generation may use fallback mode');
    } else {
        console.log('All required files are accessible');
    }
    
    // Check if all required libraries are loaded
    console.log('Checking required libraries...');
    const libraries = {
        'PDFLib': typeof PDFDocument !== 'undefined',
        'Fontkit': typeof fontkit !== 'undefined',
        'Firebase': typeof firebase !== 'undefined',
        'jQuery': typeof $ !== 'undefined'
    };
    
    console.log('Library status:', libraries);
    
    const missingLibraries = Object.entries(libraries).filter(([name, loaded]) => !loaded);
    if (missingLibraries.length > 0) {
        console.error('Missing libraries:', missingLibraries.map(([name]) => name));
    } else {
        console.log('All required libraries are loaded');
    }
    
    // Check if form elements exist
    console.log('Checking form elements...');
    const formElements = {
        'Form': document.getElementById('fo'),
        'Name Input': document.getElementById('name'),
        'Email Input': document.getElementById('email'),
        'Phone Input': document.getElementById('phone'),
        'College Input': document.getElementById('college'),
        'Submit Button': document.getElementById('submitBtn')
    };
    
    console.log('Form elements status:', formElements);
    
    const missingElements = Object.entries(formElements).filter(([name, element]) => !element);
    if (missingElements.length > 0) {
        console.error('Missing form elements:', missingElements.map(([name]) => name));
    } else {
        console.log('All form elements are present');
    }
    
    console.log('=== Initialization Complete ===');
});

 
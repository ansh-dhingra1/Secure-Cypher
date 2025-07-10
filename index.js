

// Debug function to manually enable the submit button (for testing)
window.enableSubmitBtn = () => {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        // Fill in dummy data and trigger validation instead of manually enabling
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const collegeInput = document.getElementById("college");
        
        if (nameInput && emailInput && phoneInput && collegeInput) {
            nameInput.value = "Test User";
            emailInput.value = "test@example.com";
            phoneInput.value = "1234567890";
            collegeInput.value = "Test College";
            
            // Trigger validation to enable button naturally
            checkFormValidity();
            
            console.log('✅ Form filled with test data and validation triggered');
            alert('Form filled with test data! Button should now be enabled.');
        } else {
            console.error('❌ Form elements not found');
            alert('Form elements not found!');
        }
    } else {
        console.error('❌ Submit button not found');
        alert('Submit button not found!');
    }
};

// Debug function to check current form state
window.checkFormState = () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const collegeInput = document.getElementById("college");
    const submitBtn = document.getElementById("submitBtn");
    
    console.log('=== FORM STATE DEBUG ===');
    console.log('Name value:', nameInput?.value || 'NOT FOUND');
    console.log('Email value:', emailInput?.value || 'NOT FOUND');
    console.log('Phone value:', phoneInput?.value || 'NOT FOUND');
    console.log('College value:', collegeInput?.value || 'NOT FOUND');
    console.log('Submit button disabled:', submitBtn?.disabled || 'NOT FOUND');
    
    if (nameInput && emailInput && phoneInput && collegeInput) {
        alert(`Form State:\nName: ${nameInput.value || '(empty)'}\nEmail: ${emailInput.value || '(empty)'}\nPhone: ${phoneInput.value || '(empty)'}\nCollege: ${collegeInput.value || '(empty)'}\nButton Disabled: ${submitBtn.disabled}`);
    } else {
        alert('Some form elements are missing!');
    }
};

// Firebase Database Reference for Certificates
let certificateRef;

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

// Form validation functions with text formatting
const validateName = (name) => {
    return name.trim().length >= 3 && name.trim().length <= 64;
};

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
};

const validateCollege = (college) => {
    const trimmed = college.trim();
    return trimmed.length >= 3 && /[a-zA-Z]/.test(trimmed) && !/^\d+$/.test(trimmed);
};

// Text formatting functions
const capitalizeName = (name) => {
    return name.trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatPhone = (phone) => {
    // Remove all non-digits and limit to 10 digits
    const cleaned = phone.replace(/\D/g, '').slice(0, 10);
    return cleaned;
};

const formatEmail = (email) => {
    return email.trim().toLowerCase();
};

const formatCollege = (college) => {
    // Capitalize first letter of each word like a proper name
    return college.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const checkFormValidity = () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const collegeInput = document.getElementById("college");
    const submitBtn = document.getElementById("submitBtn");
    
    if (!nameInput || !emailInput || !phoneInput || !collegeInput || !submitBtn) {
        return;
    }
    
    const isNameValid = validateName(nameInput.value);
    const isEmailValid = validateEmail(emailInput.value);
    const isPhoneValid = validatePhone(phoneInput.value);
    const isCollegeValid = validateCollege(collegeInput.value);
    
    const allValid = isNameValid && isEmailValid && isPhoneValid && isCollegeValid;
    
    if (allValid) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.cursor = 'pointer';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.cursor = 'not-allowed';
    }
};

// Certificate form setup
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase reference with delay to ensure Firebase is loaded
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.database) {
            certificateRef = firebase.database().ref('Certificates');
            console.log('✅ Firebase initialized for certificates');
        } else {
            console.warn('⚠️ Firebase not available');
        }
    }, 100);
    
    console.log('PDFLib available:', typeof PDFLib !== 'undefined');
    console.log('fontkit available:', typeof fontkit !== 'undefined');
    
    const form = document.getElementById("fo");
    const submitBtn = document.getElementById("submitBtn");
    const userName = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const collegeInput = document.getElementById("college");
    
    // Check if we're on the certificate page
    if (submitBtn && userName && emailInput && phoneInput && collegeInput) {
        console.log('✅ Certificate page detected - setting up form with validation');
        
        // Start with button disabled until form is properly filled
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.cursor = 'not-allowed';
        
        // Add validation listeners to all form fields
        [userName, emailInput, phoneInput, collegeInput].forEach(input => {
            input.addEventListener('input', checkFormValidity);
            input.addEventListener('blur', checkFormValidity);
        });
        
        // Add text formatting listeners
        userName.addEventListener('input', function() {
            // Only format if the user isn't currently typing (avoid interfering with spaces)
            // We'll apply formatting on blur instead for names to avoid cursor issues
            checkFormValidity(); // Still check validity on input
        });
        
        // Apply name formatting when user finishes typing (blur event)
        userName.addEventListener('blur', function() {
            const originalValue = this.value;
            const formatted = capitalizeName(this.value);
            if (originalValue !== formatted) {
                this.value = formatted;
                // Add visual feedback
                this.classList.add('formatted');
                setTimeout(() => {
                    this.classList.remove('formatted');
                }, 600);
            }
        });
        
        emailInput.addEventListener('blur', function() {
            const originalValue = this.value;
            const formatted = formatEmail(this.value);
            if (originalValue !== formatted) {
                this.value = formatted;
                // Add visual feedback
                this.classList.add('formatted');
                setTimeout(() => {
                    this.classList.remove('formatted');
                }, 600);
            }
        });
        
        phoneInput.addEventListener('input', function() {
            const cursorPos = this.selectionStart;
            const originalValue = this.value;
            const formatted = formatPhone(this.value);
            
            if (originalValue !== formatted) {
                this.value = formatted;
                // Adjust cursor position for removed characters
                const removedChars = originalValue.length - formatted.length;
                const newPos = Math.max(0, cursorPos - removedChars);
                this.setSelectionRange(newPos, newPos);
            }
        });
        
        collegeInput.addEventListener('blur', function() {
            const originalValue = this.value;
            const formatted = formatCollege(this.value);
            if (originalValue !== formatted) {
                this.value = formatted;
                // Add visual feedback
                this.classList.add('formatted');
                setTimeout(() => {
                    this.classList.remove('formatted');
                }, 600);
            }
        });
        
        // Initial form validity check
        checkFormValidity();
        
        // Prevent form submission on Enter key
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        }
        
        // Add submit button click handler
        submitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log('Submit button clicked');
            
            // Prevent multiple clicks
            if (submitBtn.disabled) {
                console.log('Button already disabled, ignoring click');
                return;
            }
            
            // Get and format values properly
            const rawName = userName.value;
            const rawEmail = emailInput.value;
            const rawPhone = phoneInput.value;
            const rawCollege = collegeInput.value;
            
            // Apply final formatting before submission
            const formattedName = capitalizeName(rawName);
            const formattedEmail = formatEmail(rawEmail);
            const formattedPhone = formatPhone(rawPhone);
            const formattedCollege = formatCollege(rawCollege);
            
            console.log('Form values (formatted):', { 
                name: formattedName, 
                email: formattedEmail, 
                phone: formattedPhone, 
                college: formattedCollege 
            });
            
            // Basic checks - just make sure fields aren't completely empty after formatting
            if (!formattedName.trim() || !formattedEmail.trim() || !formattedPhone.trim() || !formattedCollege.trim()) {
                alert('Please fill in all fields before generating your certificate.');
                return;
            }
            
            console.log('Basic validation passed, starting certificate generation...');
            
            // Set loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Generating Certificate...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            try {
                // Save to Firebase first with formatted values
                if (typeof sendMessage === 'function') {
                    sendMessage(formattedName, formattedEmail, formattedPhone, formattedCollege);
                }
                
                // Generate PDF certificate with formatted values
                await generatePDF(formattedName, formattedEmail, formattedPhone, formattedCollege);
                
                // Show success alert
                const alertElement = document.querySelector('.alert');
                if (alertElement) {
                    alertElement.style.display = 'block';
                    setTimeout(function() {
                        alertElement.style.display = 'none';
                    }, 7000);
                }
                
                // Reset form
                form.reset();
                
                // Reset validation after form reset
                setTimeout(() => {
                    checkFormValidity(); // This will disable the button again until new form is filled
                }, 100);
                
                // Show success state
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');
                submitBtn.textContent = 'Certificate Generated!';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.classList.remove('success');
                    // Don't manually enable - let validation handle it
                }, 3000);
                
            } catch (error) {
                console.error('Error calling generatePDF:', error);
                alert('Error starting certificate generation: ' + error.message);
                
                // Reset button state on error
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading', 'success');
                // Use validation to determine button state instead of manually enabling
                checkFormValidity();
            }
        });
        
        console.log('✅ Certificate form ready - submit button enabled');
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
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
    }
    
    // Close modal with X button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                resetVerificationForm();
            }, 300);
        });
    }
    
    // Close modal with Cancel button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                resetVerificationForm();
            }, 300);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                resetVerificationForm();
            }, 300);
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
        
        // Check if libraries are available
        if (!PDFLib || !PDFLib.PDFDocument || !PDFLib.rgb) {
            throw new Error('PDFLib is not properly loaded. Please refresh the page and try again.');
        }
        
        if (typeof fontkit === 'undefined') {
            throw new Error('Fontkit is not properly loaded. Please refresh the page and try again.');
        }
        
        console.log('Libraries loaded successfully');
        console.log('PDFDocument available:', typeof PDFLib.PDFDocument);
        console.log('rgb available:', typeof PDFLib.rgb);
        console.log('fontkit available:', typeof fontkit);
        
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
            const response = await fetch("certificate_nagpur.pdf");
            console.log('PDF fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}`);
            }
            
            existingPdfBytes = await response.arrayBuffer();
            console.log('PDF template loaded successfully, size:', existingPdfBytes.byteLength);
            
            // Verify the PDF bytes are valid
            if (existingPdfBytes.byteLength === 0) {
                throw new Error('PDF template file is empty');
            }
        } catch (error) {
            console.warn('Could not fetch PDF template, creating fallback PDF...', error);
            useFallback = true;
        }
        
        let pdfDoc;
        let SanChezFont;
        
        if (useFallback) {
            console.log('Creating fallback PDF...');
            // Create a new PDF if template is not found
            if (!PDFLib.PDFDocument || typeof PDFLib.PDFDocument.create !== 'function') {
                throw new Error('PDFDocument.create is not available. PDFLib may not be properly loaded.');
            }
            
            pdfDoc = await PDFLib.PDFDocument.create();
            console.log('PDF document created successfully');
            
            if (!pdfDoc.addPage || typeof pdfDoc.addPage !== 'function') {
                throw new Error('pdfDoc.addPage is not a function. PDFLib may not be properly loaded.');
            }
            
            const page = pdfDoc.addPage([612, 792]); // Standard letter size
            console.log('Page added successfully');
            
            // Add basic certificate content
            page.drawText('Certificate of Appreciation', {
                x: 150,
                y: 700,
                size: 24,
                color: PDFLib.rgb(0, 0, 0),
            });
            
            page.drawText('This is to certify that', {
                x: 200,
                y: 650,
                size: 16,
                color: PDFLib.rgb(0, 0, 0),
            });
            
            // Add name
            page.drawText(name, {
                x: 200,
                y: 600,
                size: 20,
                color: PDFLib.rgb(0, 0, 0),
            });
            
            // Add certificate code
            page.drawText(certificateCode, {
                x: 200,
                y: 100,
                size: 12,
                color: PDFLib.rgb(0.5, 0.5, 0.5),
            });
            
            console.log('Fallback PDF created successfully');
        } else {
            console.log('Loading PDF document from template...');
            // Load a PDFDocument from the existing PDF bytes
            if (!PDFLib.PDFDocument || typeof PDFLib.PDFDocument.load !== 'function') {
                throw new Error('PDFDocument.load is not available. PDFLib may not be properly loaded.');
            }
            
            pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
            console.log('PDF document loaded from template');
            console.log('PDF has', pdfDoc.getPageCount(), 'pages');
            
            console.log('Registering fontkit...');
            if (!pdfDoc.registerFontkit || typeof pdfDoc.registerFontkit !== 'function') {
                throw new Error('pdfDoc.registerFontkit is not a function. Fontkit may not be properly loaded.');
            }
            
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
                if (!pdfDoc.embedFont || typeof pdfDoc.embedFont !== 'function') {
                    throw new Error('pdfDoc.embedFont is not a function. PDFLib may not be properly loaded.');
                }
                
                SanChezFont = await pdfDoc.embedFont(fontBytes);
                console.log('Font embedded successfully');
            } catch (fontError) {
                console.warn('Font loading failed, using default font:', fontError);
                // Use default font if custom font fails
                SanChezFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                console.log('Using default Helvetica font');
            }
            
   // Get the first page of the document
            if (!pdfDoc.getPages || typeof pdfDoc.getPages !== 'function') {
                throw new Error('pdfDoc.getPages is not a function. PDFLib may not be properly loaded.');
            }
            
               const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            console.log('Got first page, dimensions:', firstPage.getSize());
            
            // Check if the page has existing content
            console.log('Page has existing content objects:', firstPage.node.Resources ? 'Yes' : 'No');
         
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
              color: PDFLib.rgb(1.0, 0.84, 0.00),
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
              color: PDFLib.rgb(0.5, 0.5, 0.5), // Gray color for subtle appearance
            });
            console.log('Certificate code drawn on PDF');
        }
     
        console.log('Serializing PDF...');
  // Serialize the PDFDocument to bytes (a Uint8Array)
        if (!pdfDoc.saveAsBase64 || typeof pdfDoc.saveAsBase64 !== 'function') {
            throw new Error('pdfDoc.saveAsBase64 is not a function. PDFLib may not be properly loaded.');
        }
        
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
        if (error.message.includes('PDFLib') || error.message.includes('PDFDocument') || error.message.includes('addPage')) {
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
        { name: 'PDF Template', url: 'certificate_nagpur.pdf' },
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
    
    // Initialize certificate button state
    updateCertificateButtonState();
    console.log('Certificate system status:', isCertificateSystemEnabled() ? 'ENABLED' : 'DISABLED');
    
    // Simple library availability check
    console.log('PDFLib available:', typeof PDFLib !== 'undefined');
    console.log('fontkit available:', typeof fontkit !== 'undefined');
    
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
        'PDFLib': typeof PDFLib !== 'undefined' && PDFLib.PDFDocument,
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

 
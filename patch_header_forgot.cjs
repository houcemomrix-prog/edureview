const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => \{\s+if \(onSelectGuestView\) \{\s+onSelectGuestView\('forgot-password'\);\s+\}\s+setShowAdminLoginForm\(false\);\s+\}\}/,
  `onClick={() => {
                        if (onSelectGuestView) {
                          onSelectGuestView('forgot-password');
                        }
                        setShowAdminLoginForm(false);
                        
                        // Scroll down to the Guest Portal
                        setTimeout(() => {
                          const el = document.getElementById('login-form-element') || document.getElementById('guest-portal-container');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 100);
                      }}`
);

fs.writeFileSync('src/components/Header.tsx', code);

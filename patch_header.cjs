const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Update interface
code = code.replace("onAdminLogin: () => void;", "onAdminLogin: (email?: string, pass?: string) => void;");

// Update form submission
code = code.replace(
`                  onSubmit={(e) => {
                    e.preventDefault();
                    onAdminLogin();
                    setShowAdminLoginForm(false);
                  }}`,
`                  onSubmit={(e) => {
                    e.preventDefault();
                    onAdminLogin(adminEmail, adminPassword);
                    setShowAdminLoginForm(false);
                  }}`
);

// Also check the mobile drawer form
code = code.replace(
`                    onClick={() => {
                      setIsOpen(false);
                      if (onSelectGuestView) {
                        onSelectGuestView('admin-portal');
                      } else {
                        onAdminLogin();
                      }
                    }}`,
`                    onClick={() => {
                      setIsOpen(false);
                      if (onSelectGuestView) {
                        onSelectGuestView('admin-portal');
                      } else {
                        onAdminLogin(adminEmail, adminPassword); // Though usually they just navigate to the admin portal view here
                      }
                    }}`
);

fs.writeFileSync('src/components/Header.tsx', code);

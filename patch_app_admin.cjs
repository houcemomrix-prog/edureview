const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldAdminLogin = `  const handleAdminLogin = async () => {
    setDataLoading(true);
    setErrorMessage(null);
    try {
      // Automatically toggle sandbox to true for local testing and to bypass Firestore permissions
      setSandboxActive(true);
      setSandbox(true);
      setCurrentAssessment(null);
      setShowUploadForm(false);

      const adminProfile: UserProfile = {
        uid: 'demo-admin-1',
        name: 'حسام عمري',
        email: 'hossam9866@moe.om',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      await createUserProfile(adminProfile);
      
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
      const unsub = subscribeToUserProfile('demo-admin-1', (updatedProf) => {
        if (updatedProf) {
          setUserProfile(updatedProf);
        }
      });
      profileUnsubscribeRef.current = unsub;
      
      handleSuccess("Authenticated successfully as Portal Director Administrator (Sandbox mode active).");
    } catch (err: any) {
      console.error(err);
      handleError("Failed to initialize administrator role.");
    } finally {
      setDataLoading(false);
    }
  };`;

const newAdminLogin = `  const handleAdminLogin = async (email?: string, pass?: string) => {
    if (email && pass) {
      // If credentials were provided from the header form, route them through the real auth
      return handleAuthForCredentials(email, pass);
    }
    
    // Otherwise fallback to whatever GuestPortal handles
    setGuestView('admin-portal');
  };`;

code = code.replace(oldAdminLogin, newAdminLogin);

fs.writeFileSync('src/App.tsx', code);

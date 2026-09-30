const fs = require('fs');
let code = fs.readFileSync('src/components/UserDatabaseView.tsx', 'utf8');

const stateBlock = `  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetTargetEmail, setResetTargetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message: string}>({type: 'idle', message: ''});`;

code = code.replace("  const [isModalOpen, setIsModalOpen] = useState(false);", stateBlock);

const newFunction = `  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus({ type: 'loading', message: language === 'ar' ? 'جاري إعادة تعيين كلمة المرور...' : 'Resetting password...' });
    
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resetTargetEmail, newPassword: resetNewPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        setResetStatus({ type: 'success', message: language === 'ar' ? 'تم تعيين كلمة المرور الجديدة بنجاح!' : 'Password successfully updated!' });
        setResetTargetEmail('');
        setResetNewPassword('');
      } else {
        setResetStatus({ type: 'error', message: data.error || 'Failed to reset password' });
      }
    } catch (err: any) {
      setResetStatus({ type: 'error', message: err.message || 'Network error' });
    }
  };

  const handleOpenAdd = () => {`;

code = code.replace("  const handleOpenAdd = () => {", newFunction);

fs.writeFileSync('src/components/UserDatabaseView.tsx', code);

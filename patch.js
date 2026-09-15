const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /const unreadReports = myReports.filter\(r => r.id && !readReportIds.includes\(r.id\)\);\n  const unreadCount = unreadReports.length;/,
  `const unreadReports = myReports.filter(r => r.id && !readReportIds.includes(r.id));
  const unreadTeacherNotifications = myTeacherNotifications.filter(n => !n.read);
  const unreadCount = unreadReports.length + unreadTeacherNotifications.length;
  
  const handleTeacherNotificationClick = async (id) => {
    await markTeacherNotificationRead(id);
    setMyTeacherNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };`
);

fs.writeFileSync('src/components/Header.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /const unreadCount = unreadReports\.length \+ unreadTeacherNotifications\.length;/,
  `// Teacher check fix: If user is teacher, count teacher notifications. If user is school, count reports.
  const unreadCount = userProfile?.roleType === 'teacher' ? unreadTeacherNotifications.length : unreadReports.length;`
);

fs.writeFileSync('src/components/Header.tsx', code);

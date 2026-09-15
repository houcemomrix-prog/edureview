const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /guestView=\{guestView\}\n\s+onSelectGuestView=\{setGuestView\}/,
  `guestView={guestView}
        onSelectGuestView={(view) => {
          setGuestView(view);
          if (view === 'forgot-password') {
            setSelectedAuthRole('admin');
          }
        }}`
);

fs.writeFileSync('src/App.tsx', code);

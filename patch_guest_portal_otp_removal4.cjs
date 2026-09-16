const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// I will find the exact boundaries for the OTP step and replace them manually
const parts = code.split("{/* Step 2: Code verification */}");
if (parts.length === 2) {
    const endParts = parts[1].split("{/* End of forgot mode */}");
    if (endParts.length >= 2) {
        code = parts[0] + "{/* End of forgot mode */}" + endParts.slice(1).join("{/* End of forgot mode */}");
    }
}

// Remove the Sandbox Email simulator completely
const simParts = code.split("{/* Simulated Email / Notification Sandbox HUD */}");
if (simParts.length === 2) {
    const simEndParts = simParts[1].split("</div>\n    </div>\n  );\n}");
    if (simEndParts.length >= 2) {
        // Find the last closing div that matches the simulator
        // Actually, just remove everything between Sandbox HUD and the end of the file since it's the last element.
        code = simParts[0] + "</div>\n  );\n}";
    }
}

fs.writeFileSync('src/components/GuestPortal.tsx', code);

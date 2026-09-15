import uploadedStamp from '../../input-onlinepngtools (1).png';

// High-fidelity SVG of the official circular Ministry of Education stamp of Oman
// This matches the uploaded circular blue ink stamp precisely and scale beautifully on any display or PDF.

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- Outer thin circle -->
  <circle cx="200" cy="200" r="185" fill="none" stroke="#1c4e94" stroke-width="4.5" stroke-opacity="0.95" />
  
  <!-- Thicker middle circle -->
  <circle cx="200" cy="200" r="172" fill="none" stroke="#1c4e94" stroke-width="8.5" stroke-opacity="0.95" />
  
  <!-- Inner thin circle -->
  <circle cx="200" cy="200" r="154" fill="none" stroke="#1c4e94" stroke-width="2.5" stroke-opacity="0.95" />
  <circle cx="200" cy="200" r="145" fill="none" stroke="#1c4e94" stroke-width="1.8" stroke-opacity="0.95" stroke-dasharray="4,3" />

  <defs>
    <!-- Top-curved text path for Ministry of Education -->
    <path id="top-text-path" d="M 52,200 A 148,148 0 0,1 348,200" fill="none" />
    
    <!-- Bottom-curved text path for Undersecretary -->
    <path id="bottom-text-path" d="M 348,200 A 148,148 0 0,1 52,200" fill="none" />
  </defs>

  <!-- National emblem (Swords and Khanjar) in the center -->
  <g transform="translate(200, 160) scale(0.72)" stroke="#1c4e94" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Crossed Swords sheaths -->
    <!-- Sword 1: top-left to bottom-right -->
    <path d="M -90,-80 L 90,80" />
    <!-- Sword 1 hilt/handle -->
    <path d="M -90,-80 L -110,-100 M -105,-85 L -100,-90" stroke-width="5" />
    <circle cx="-110" cy="-100" r="5" fill="#1c4e94" />
    <!-- Sword 1 guard -->
    <path d="M -75,-75 L -95,-65 M -80,-80 L -70,-70" />

    <!-- Sword 2: top-right to bottom-left -->
    <path d="M 90,-80 L -90,80" />
    <!-- Sword 2 hilt/handle -->
    <path d="M 90,-80 L 110,-100 M 105,-85 L 100,-90" stroke-width="5" />
    <circle cx="110" cy="-100" r="5" fill="#1c4e94" />
    <!-- Sword 2 guard -->
    <path d="M 75,-75 L 95,-65 M 80,-80 L 70,-70" />

    <!-- Omani Khanjar in the middle, sitting vertically -->
    <g transform="translate(0, -5)" stroke-width="7">
      <!-- Handle/Hilt -->
      <path d="M -15,-70 L 15,-70 L 10,-35 L -10,-35 Z" fill="#1c4e94" />
      <path d="M -12,-70 L -10,-35 M 12,-70 L 10,-35" stroke-width="2" />
      <!-- Upper sheath mount/belt rings section -->
      <path d="M -25,-35 L 25,-35 L 20,-5 L -20,-5 Z" fill="none" />
      <circle cx="-11" cy="-20" r="6.5" />
      <circle cx="11" cy="-20" r="6.5" />
      <!-- Interlocking rings pattern/connections -->
      <path d="M -20,-20 L 20,-20" stroke-width="3" />
      <!-- Dagger Sheath curved blade part (bends sharply to the right) -->
      <path d="M -15,-5 L 15,-5 L 15,35 C 15,65 52,65 58,45 C 58,25 45,25 45,45" fill="none" />
      <path d="M -15,-5 L -15,35 C -15,55 5,55 5,35" fill="none" />
      <!-- Ornate pattern lines on the sheath sheath -->
      <path d="M -5,-5 L -5,25 M 5,-5 L 5,25" stroke-width="2.5" />
    </g>
  </g>

  <!-- Arabic Typography for 'وزارة التعليم' (Ministry of Education) -->
  <text fill="#1c4e94" font-family="'Cairo', 'Amiri', 'Tajawal', 'Noto Sans Arabic', 'Segoe UI', sans-serif" font-size="28" font-weight="900" letter-spacing="0.5">
    <textPath href="#top-text-path" startOffset="50%" text-anchor="middle">
      وزارة التعليم
    </textPath>
  </text>
  
  <!-- Arabic Typography for 'وكيل الوزارة للشؤون الإدارية والمالية' -->
  <text fill="#1c4e94" font-family="'Cairo', 'Amiri', 'Tajawal', 'Noto Sans Arabic', 'Segoe UI', sans-serif" font-size="19" font-weight="950" letter-spacing="0.2">
    <textPath href="#bottom-text-path" startOffset="50%" text-anchor="middle">
      وكيل الوزارة للشؤون الإدارية والمالية
    </textPath>
  </text>

  <!-- Separation dots between top and bottom wording -->
  <circle cx="53" cy="200" r="5" fill="#1c4e94" />
  <circle cx="347" cy="200" r="5" fill="#1c4e94" />
</svg>`;

// We encode it to base64 so it can be reliably used inside <img> src tags on all browsers
const b64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(svgString))) : Buffer.from(svgString).toString('base64');

export const principalStampUrl = uploadedStamp || `data:image/svg+xml;base64,${b64}`;

export function getActiveStamp(schoolIdOrName?: string): string {
  if (typeof window !== 'undefined') {
    if (schoolIdOrName) {
      const schoolStamp = window.localStorage.getItem(`oman_school_stamp_${schoolIdOrName}`);
      if (schoolStamp) return schoolStamp;
    }
    const custom = window.localStorage.getItem('oman_moe_custom_stamp');
    if (custom) return custom;
  }
  return principalStampUrl;
}

export function saveActiveStamp(dataUrl: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('oman_moe_custom_stamp', dataUrl);
  }
}

export default principalStampUrl;

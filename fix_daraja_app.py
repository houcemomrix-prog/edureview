import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<div className="text-center font-black text-\[13px\] text-slate-800 py-0\.5">',
    r'<div className="flex items-center justify-center w-full font-black text-[13px] text-slate-800 py-0.5">',
    content
)
content = re.sub(
    r'<div className="text-center font-black text-\[12px\] text-\[#821315\] py-0\.5">',
    r'<div className="flex items-center justify-center w-full font-black text-[12px] text-[#821315] py-0.5">',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)


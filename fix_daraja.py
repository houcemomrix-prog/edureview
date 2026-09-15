import re

with open('src/components/SchoolArchiveView.tsx', 'r') as f:
    content = f.read()

# Fix in SchoolArchiveView.tsx
content = re.sub(
    r'<div className="font-black text-\[15px\] text-\[#821315\] py-1\.5 border-b border-\[#821315\]\/45">',
    r'<div className="flex items-center justify-center w-full font-black text-[15px] text-[#821315] py-1.5 border-b border-[#821315]/45">',
    content
)

with open('src/components/SchoolArchiveView.tsx', 'w') as f:
    f.write(content)


with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<div className="font-black text-\[14px\] text-slate-800 py-1\.5 border-b-2 border-black">',
    r'<div className="flex items-center justify-center w-full font-black text-[14px] text-slate-800 py-1.5 border-b-2 border-black">',
    content
)
content = re.sub(
    r'<div className="font-black text-\[12px\] text-\[#821315\] py-0\.5 border-b border-\[#821315\]\/20">',
    r'<div className="flex items-center justify-center w-full font-black text-[12px] text-[#821315] py-0.5 border-b border-[#821315]/20">',
    content
)
content = re.sub(
    r'<div className="font-black text-\[12px\] text-black py-0\.5 border-b border-slate-300">',
    r'<div className="flex items-center justify-center w-full font-black text-[12px] text-black py-0.5 border-b border-slate-300">',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)


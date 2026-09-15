import re

with open('src/components/FormStyleController.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<div className="text-center font-black leading-tight mb-0\.5 text-\[10\.5px\] text-slate-800">',
    r'<div className="flex items-center justify-center w-full font-black leading-tight mb-0.5 text-[10.5px] text-slate-800">',
    content
)

with open('src/components/FormStyleController.tsx', 'w') as f:
    f.write(content)


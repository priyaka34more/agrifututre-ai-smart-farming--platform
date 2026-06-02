import os
import re

# 1. Fix Dashboard.jsx
dashboard_path = r'd:\my_personal\agrifuturep\frontend\src\pages\Dashboard.jsx'
with open(dashboard_path, 'r', encoding='utf-8-sig') as f:
    content = f.read()

# Remove unused from framer-motion
content = re.sub(r'motion,\s*AnimatePresence', 'motion', content)

# Remove unused lucide-react imports
lucide_imports = [
    'Cloud,', 'Sprout,', 'Compass,', 'Activity,', 'CheckCircle2,', 
    'ArrowUpRight,', 'BarChart3,', 'HelpCircle'
]
for imp in lucide_imports:
    content = content.replace(imp, '')
# Clean up multiple spaces or trailing commas in lucide import
content = re.sub(r',\s*,', ',', content)
content = re.sub(r',\s*\}', ' }', content)

# Remove unused states
content = re.sub(r'const \[toastMessage\], setToastMessage\] = useState\([^)]*\);\n?', '', content)
content = re.sub(r'const \[toastMessage\].*\n', '', content)
content = re.sub(r'const \[soilNPK\].*\n', '', content)
content = re.sub(r'const \[cropHealthIdx\].*\n', '', content)
content = re.sub(r'const \[ndviStatus\].*\n', '', content)

# Remove any setToastMessage calls
content = re.sub(r'setToastMessage\([^)]*\);?\n?', '', content)

with open(dashboard_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)


# 2. Fix AdminActivities.jsx
admin_path = r'd:\my_personal\agrifuturep\frontend\src\pages\admin\AdminActivities.jsx'
with open(admin_path, 'r', encoding='utf-8') as f:
    content = f.read()

admin_lucide_imports = [
    'Calendar,', 'Filter,', 'ArrowUpRight,', 'Award,', 'ShieldCheck,'
]
for imp in admin_lucide_imports:
    content = content.replace(imp, '')
content = re.sub(r',\s*,', ',', content)
content = re.sub(r',\s*\}', ' }', content)

with open(admin_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Done fixing lint warnings and BOM!")

import re

with open('/Users/surajmujumdar/Desktop/indigo/new/INDIGO/frontend/src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import DomainRiskAnalysis' not in content:
    content = content.replace("import LiveCyberThreatNews from './LiveCyberThreatNews'", "import LiveCyberThreatNews from './LiveCyberThreatNews'\nimport DomainRiskAnalysis from './DomainRiskAnalysis'")

# Add component right after <main ...>
old_main = '<main className="flex-1 overflow-auto p-4">'
new_main = '<main className="flex-1 overflow-auto p-4 space-y-6">\n          <DomainRiskAnalysis />'

content = content.replace(old_main, new_main)

with open('/Users/surajmujumdar/Desktop/indigo/new/INDIGO/frontend/src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

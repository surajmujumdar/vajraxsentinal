import re

with open('/Users/surajmujumdar/Desktop/indigo/new/INDIGO/frontend/src/app/companies/page.tsx', 'r') as f:
    content = f.read()

# Replace light mode classes with dark mode classes
replacements = {
    'bg-gray-50': 'bg-background',
    'bg-white': 'bg-card border border-border',
    'text-gray-900': 'text-foreground',
    'text-gray-600': 'text-muted-foreground',
    'text-gray-500': 'text-muted-foreground',
    'border-gray-300': 'border-border',
    'text-red-600 bg-red-100': 'text-red-400 bg-red-950/50',
    'text-yellow-600 bg-yellow-100': 'text-yellow-400 bg-yellow-950/50',
    'text-green-600 bg-green-100': 'text-green-400 bg-green-950/50',
    'text-gray-600 bg-gray-100': 'text-muted-foreground bg-muted',
    'bg-red-50': 'bg-red-950/20',
    'bg-yellow-50': 'bg-yellow-950/20',
    'bg-green-50': 'bg-green-950/20',
    'bg-blue-100 text-blue-800': 'bg-blue-950 text-blue-400 border border-blue-800/50',
    'bg-purple-100 text-purple-800': 'bg-purple-950 text-purple-400 border border-purple-800/50',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Update imports to include Sidebar and Navbar
imports = """'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
"""
content = re.sub(r"'use client';\s*import React, { useState } from 'react';", imports, content)

# Change export default function DomainRiskAnalysis() to include state for sidebar
content = content.replace(
    'export default function DomainRiskAnalysis() {',
    'export default function DomainRiskAnalysis() {\n  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);'
)

# Update main return block to include Sidebar and Navbar
old_return = '''  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">'''

new_return = '''  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} overflow-hidden`}>
        <div className="sticky top-0 z-40 bg-background">
          <Navbar />
        </div>
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">'''

content = content.replace(old_return, new_return)

# Close the new divs at the bottom of the file
old_bottom = '''          </div>
        )}
      </div>
    </div>
  );
}'''

new_bottom = '''          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}'''

content = content.replace(old_bottom, new_bottom)

with open('/Users/surajmujumdar/Desktop/indigo/new/INDIGO/frontend/src/app/companies/page.tsx', 'w') as f:
    f.write(content)

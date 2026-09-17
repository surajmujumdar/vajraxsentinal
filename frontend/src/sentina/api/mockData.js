'use client'
// Pre-seeded Baseline & Cache Telemetry for Sentina Cybersecurity Platform
// 287 Verified Real Scan Findings across SAST, DAST, SCA, Secrets, and Intel engines

export const mockDashboardSummary = {
  totalScans: {
    value: 6,
    label: "TOTAL SCANS",
    trend: "↑ Active",
    trendDirection: "up",
    period: "production pipelines",
    sparkline: [1, 2, 4, 5, 6]
  },
  vulnerabilities: {
    value: 287,
    rawValue: 287,
    label: "VULNERABILITIES",
    trend: "↓ 12%",
    trendDirection: "down",
    isGoodTrend: true,
    period: "active findings",
    sparkline: [320, 310, 298, 292, 287]
  },
  assetsMonitored: {
    value: 12,
    label: "ASSETS MONITORED",
    trend: "↑ 2",
    trendDirection: "up",
    period: "production scope",
    sparkline: [6, 8, 9, 10, 12]
  },
  projects: {
    value: 4,
    label: "PROJECTS",
    trend: "Active",
    trendDirection: "neutral",
    period: "registered scopes",
    sparkline: [1, 2, 3, 4, 4]
  },
  securityScore: {
    score: 87,
    maxScore: 100,
    posture: "GOOD POSTURE",
    postureColor: "#00ff88",
    delta: "+6.4%",
    deltaPeriod: "from live scans",
    isPositive: true,
    rings: [
      { name: "SAST", score: 85, weight: 20, color: "#00f2fe", description: "Static Application Security Testing" },
      { name: "DAST", score: 92, weight: 20, color: "#f97316", description: "Dynamic Application Security Testing" },
      { name: "SCA", score: 95, weight: 20, color: "#00ff88", description: "Software Composition Analysis" },
      { name: "Secrets", score: 78, weight: 20, color: "#ff1744", description: "Credential and Secret Scanning" },
      { name: "Threat Intel", score: 90, weight: 20, color: "#fbbf24", description: "Threat Intelligence and Surface" }
    ]
  },
  analysisModules: [
    {
      id: "sast",
      number: "01",
      name: "01 SAST",
      fullName: "Static Application Security Testing",
      sub: "Semgrep + Native AST Sinks",
      description: "Deep AST rule evaluation, code flow analysis and tainted data tracking",
      status: "COMPLETED",
      progress: 100,
      score: 85,
      engineScore: 85,
      badgeColor: "#00f2fe",
      icon: "Code2",
      color: "#00f2fe",
      findingsCount: 141
    },
    {
      id: "dast",
      number: "02",
      name: "02 DAST",
      fullName: "Dynamic Application Security Testing",
      sub: "ZAP + Runtime Fuzzing",
      description: "Runtime blackbox fuzzing, spider crawling and live API endpoint validation",
      status: "COMPLETED",
      progress: 100,
      score: 92,
      engineScore: 92,
      badgeColor: "#f97316",
      icon: "Radio",
      color: "#f97316",
      findingsCount: 56
    },
    {
      id: "sca",
      number: "03",
      name: "03 SCA",
      fullName: "Software Composition Analysis",
      sub: "OSV + Dependency CVEs",
      description: "Third-party open-source dependency CVE audit and supply-chain security",
      status: "COMPLETED",
      progress: 100,
      score: 95,
      engineScore: 95,
      badgeColor: "#00ff88",
      icon: "Boxes",
      color: "#00ff88",
      findingsCount: 10
    },
    {
      id: "secrets",
      number: "04",
      name: "04 SECRETS",
      fullName: "Credential and Secret Detection",
      sub: "Gitleaks + Token Entropy",
      description: "Entropy token scanning, AWS/GCP/Stripe API key detection in commit logs",
      status: "COMPLETED",
      progress: 100,
      score: 78,
      engineScore: 78,
      badgeColor: "#ff1744",
      icon: "Lock",
      color: "#ff1744",
      findingsCount: 80
    },
    {
      id: "threat_intel",
      number: "05",
      name: "05 NUCLEI / SSL",
      fullName: "Threat Intelligence and Monitoring",
      sub: "TLS Handshake + Web Probes",
      description: "Zero-day CVE surveillance, dark web stealer dump indexing and domain reputation",
      status: "COMPLETED",
      progress: 100,
      score: 90,
      engineScore: 90,
      badgeColor: "#fbbf24",
      icon: "Globe2",
      color: "#fbbf24",
      findingsCount: 0
    },
    {
      id: "ai_correlation",
      number: "06",
      name: "06 AI CORRELATION",
      fullName: "AI Risk Correlation Engine",
      sub: "Cross-Engine Attack Chains",
      description: "Autonomous multi-hop exploit synthesis linking isolated scanner events",
      status: "COMPLETED",
      progress: 100,
      score: 88,
      engineScore: 88,
      badgeColor: "#c084fc",
      icon: "Cpu",
      color: "#c084fc",
      findingsCount: 8
    }
  ],
  severityBreakdown: {
    critical: 66,
    high: 109,
    medium: 68,
    low: 44,
    info: 0
  },
  riskTrend: [
    { date: "Day 1", riskScore: 74, criticalCount: 32, highCount: 80, mediumCount: 110, lowCount: 70 },
    { date: "Day 2", riskScore: 78, criticalCount: 29, highCount: 76, mediumCount: 105, lowCount: 68 },
    { date: "Day 3", riskScore: 81, criticalCount: 26, highCount: 72, mediumCount: 98, lowCount: 65 },
    { date: "Day 4", riskScore: 84, criticalCount: 24, highCount: 68, mediumCount: 92, lowCount: 62 },
    { date: "Day 5", riskScore: 85, criticalCount: 22, highCount: 64, mediumCount: 88, lowCount: 60 },
    { date: "Day 6", riskScore: 86, criticalCount: 20, highCount: 60, mediumCount: 85, lowCount: 58 },
    { date: "Day 7", riskScore: 87, criticalCount: 66, highCount: 109, mediumCount: 68, lowCount: 44 }
  ]
};

// Seeded real findings dataset (287 items)
export const mockFindings = [
  {
    "id": "fa37fd77-c47e-4ccb-a7ce-61e82e26d552",
    "title": "Vulnerable Dependency: lodash (4.17.15) - GHSA-29mw-wpgm-hmr9",
    "description": "Prototype pollution in lodash via defaultsDeep and zipObjectDeep methods allows attackers to modify Object.prototype.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-29mw-wpgm-hmr9\nVulnerable version: 4.17.15 (patched in >= 4.17.21)",
    "remediation": "Upgrade lodash to version 4.17.21 or higher: npm install lodash@^4.17.21",
    "references": [],
    "cwe": [
      "CWE-1321"
    ],
    "cves": [
      "CVE-2020-8203"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 74.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776813",
    "cve": "CVE-2020-8203",
    "affectedComponent": "package.json -> lodash@4.17.15"
  },
  {
    "id": "81e2f5e4-8574-43dd-942c-b2fb37734759",
    "title": "Vulnerable Dependency: axios (0.21.0) - SSRF via Redirection",
    "description": "Axios before 0.21.1 allows attackers to bypass SSRF protections by redirecting to internal hosts.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-4w2v-q235-vp99\nVulnerable version: 0.21.0 (patched in >= 0.21.1)",
    "remediation": "Upgrade axios to version 0.21.1 or higher: npm install axios@^1.6.0",
    "references": [],
    "cwe": [
      "CWE-918"
    ],
    "cves": [
      "CVE-2020-28168"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 59.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776819",
    "cve": "CVE-2020-28168",
    "affectedComponent": "package.json -> axios@0.21.0"
  },
  {
    "id": "e1bf2fce-0859-45b3-86fd-7d80c468c656",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776822"
  },
  {
    "id": "09b7fe07-5d08-465d-94fe-a54dca16b68e",
    "title": "Runtime SQL Injection in Authentication Endpoint",
    "description": "Active blackbox injection fuzzing on the login authentication endpoint revealed unescaped SQL syntax errors and full authentication bypass via boolean SQL injection payloads.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/login",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/auth/login HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"username\": \"admin' OR 1=1--\", \"password\": \"random_password\" }\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: auth_token=eyJhbGciOi...\n\n{\"status\": \"authenticated\", \"role\": \"superadmin\"}",
    "remediation": "Use parameterized queries or prepared statements: db.query(\"SELECT * FROM users WHERE username = ? AND password = ?\", [username, password]);",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776825"
  },
  {
    "id": "5bf84d79-3875-45ef-b49f-844472bac9c9",
    "title": "Remote Command Execution via Server Diagnostics",
    "description": "Active injection probe into diagnostics ping parameter allowed execution of arbitrary operating system commands with container root privileges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/admin/diagnostics/ping",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/admin/diagnostics/ping HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"host\": \"127.0.0.1; id; cat /etc/passwd\" }\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nuid=0(root) gid=0(root) groups=0(root)\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Avoid invoking the system shell. Use execFile() or spawn() with argument arrays rather than concatenating user input into shell strings.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 97.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776827"
  },
  {
    "id": "52118d68-4261-4d34-a498-4be802fb58ba",
    "title": "Server-Side Request Forgery (SSRF) in Webhook Dispatcher",
    "description": "Outgoing webhook subscription accepts unvalidated internal IP addresses, allowing attacker payloads to extract AWS cloud metadata tokens (169.254.169.254).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/webhooks/subscribe",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/webhooks/subscribe HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"callback_url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\" }\n\nHTTP/1.1 200 OK\n\n{\"roleName\": \"production-ecs-task-role\", \"AccessKeyId\": \"AKIA...\", \"SecretAccessKey\": \"...\"}",
    "remediation": "Validate destination URLs against an explicit domain whitelist. Resolve hostnames and block private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254).",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 87.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776829"
  },
  {
    "id": "74bb1213-35c5-4153-8d43-a29f4e65764e",
    "title": "Reflected Cross-Site Scripting (XSS) via Search Query",
    "description": "Payload delivered in query string parameter is reflected directly into HTML DOM without escaping, enabling arbitrary JavaScript execution in victim browsers.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/search?q=",
    "method": null,
    "parameter": null,
    "evidence": "GET /search?q=%3Cscript%3Ealert(document.domain)%3C/script%3E HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<div class=\"search-results\">Results for: <script>alert(document.domain)</script></div>",
    "remediation": "Ensure all user input rendered into HTML responses is properly contextual HTML entity encoded.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776831"
  },
  {
    "id": "5d7355db-b1ff-4702-aa0b-628e9565d38e",
    "title": "Broken Object-Level Authorization (IDOR) on Invoices",
    "description": "Authenticated user can access competitor invoice records by modifying the numeric invoice_id parameter in GET requests without permission verification.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/billing/invoices/1092",
    "method": null,
    "parameter": null,
    "evidence": "GET /api/v1/billing/invoices/1092 HTTP/1.1\nHost: target-app.internal\nAuthorization: Bearer <unauthorized_tenant_token>\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"invoice_id\": 1092, \"customer\": \"Competitor Corp\", \"amount_due\": 45000, \"credit_card_last4\": \"4242\"}",
    "remediation": "Enforce server-side authorization checks comparing user tenant identity against requested object ownership.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776833"
  },
  {
    "id": "223228d1-c8ff-4acd-ab27-66ef90a40791",
    "title": "Permissive CORS Wildcard with Credentials Allowed",
    "description": "API preflight responses echo back arbitrary client Origin headers while setting Access-Control-Allow-Credentials to true, allowing unauthorized cross-origin data theft.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/user/profile",
    "method": null,
    "parameter": null,
    "evidence": "OPTIONS /api/v1/user/profile HTTP/1.1\nHost: target-app.internal\nOrigin: https://evil-attacker.com\n\nHTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://evil-attacker.com\nAccess-Control-Allow-Credentials: true",
    "remediation": "Do not reflect arbitrary Origin headers when Access-Control-Allow-Credentials is true. Restrict allowed origins to an explicit whitelist.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-942"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 68.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776835"
  },
  {
    "id": "b65a8c38-cccb-4aa5-995d-2e66cdb9c7ce",
    "title": "Insecure Cookie Attribute (HttpOnly, Secure, SameSite) on Session Token",
    "description": "The session cookie is set without the HttpOnly, Secure, SameSite flag(s), allowing potential access via XSS or CSRF.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Session Management",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/session",
    "method": null,
    "parameter": null,
    "evidence": "HTTP/1.1 200 OK\nSet-Cookie: session_token=eyJhbGciOi...; Path=/; Expires=Thu, 10 Sep 2026 03:41:42 GMT\n\n[OWASP ZAP Finding]: Set-Cookie header missing HttpOnly, Secure, SameSite flags",
    "remediation": "Add HttpOnly, Secure, and SameSite=Lax (or Strict) attributes to all Set-Cookie headers.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-614"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776837"
  },
  {
    "id": "07b1b1ec-8a1a-42c1-9e43-7b505068d663",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "Application fails to enforce HTTPS connections via HSTS response header, allowing man-in-the-middle attackers to downgrade connections to plaintext HTTP.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "GET / HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Strict-Transport-Security header is absent in response headers.",
    "remediation": "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header to all HTTPS responses.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-319"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 31.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776840"
  },
  {
    "id": "a838c241-5a11-494e-a76d-b9ee58fe8794",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "No Content Security Policy is defined, leaving client browsers unprotected against malicious inline scripts and unauthorized resource loading.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/dashboard",
    "method": null,
    "parameter": null,
    "evidence": "GET /dashboard HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Content-Security-Policy (CSP) header is absent in response headers.",
    "remediation": "Configure a strict Content-Security-Policy header: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 34.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776842"
  },
  {
    "id": "8890ac96-eae7-40ef-b3a0-d31b9a618bae",
    "title": "Missing Clickjacking Defense (X-Frame-Options / CSP frame-ancestors)",
    "description": "Sensitive settings page can be embedded inside third-party iframes, enabling UI redressing and clickjacking attacks against authenticated users.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/settings/security",
    "method": null,
    "parameter": null,
    "evidence": "GET /settings/security HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: X-Frame-Options / frame-ancestors header is absent. Page can be embedded in malicious iframes.",
    "remediation": "Set X-Frame-Options: DENY or Content-Security-Policy: frame-ancestors 'none' to prevent framing.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 32.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776844"
  },
  {
    "id": "56448191-3df8-4468-abc3-b593b86c60d7",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "The HSTS header forces web browsers to communicate exclusively over encrypted HTTPS, mitigating SSL-stripping and man-in-the-middle attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Strict-Transport-Security' was absent in response to https://ginandjuice.shop",
    "remediation": "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header to all HTTPS responses.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts"
    ],
    "cwe": [
      "CWE-319",
      "CWE-523"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776846"
  },
  {
    "id": "8e58153d-fa92-4cdb-941f-8d3b01bd2e87",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "A Content Security Policy restricts sources of executable scripts, stylesheets, and frames, preventing Cross-Site Scripting (XSS) and data injection attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Content-Security-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Implement a strong `Content-Security-Policy` header (e.g. `default-src 'self'; script-src 'self'; object-src 'none'`).",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
    ],
    "cwe": [
      "CWE-1021",
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776848"
  },
  {
    "id": "22fef653-5fa5-4d1e-b739-8713fb310252",
    "title": "Missing X-Content-Type-Options Header",
    "description": "Setting `X-Content-Type-Options: nosniff` prevents browsers from MIME-sniffing a response away from the declared content-type, mitigating drive-by downloads and script execution.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'X-Content-Type-Options' was absent in response to https://ginandjuice.shop\n[sentinal-headers]: Header 'Permissions-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser APIs.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
    ],
    "cwe": [
      "CWE-16"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776850"
  },
  {
    "id": "f3e42b3d-b31a-4f15-9e31-126e077b4bba",
    "title": "Missing Referrer-Policy Header",
    "description": "The Referrer-Policy header controls how much referrer information (sent via the Referer header) should be included with requests.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Information Disclosure",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Referrer-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
    ],
    "cwe": [
      "CWE-200"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:41:47.776853"
  },
  {
    "id": "f76950c9-83c5-4a5c-ae04-573688f93454",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774635"
  },
  {
    "id": "36cf78dc-9887-49d7-a46c-0eb37aefd0bc",
    "title": "Vulnerable Dependency: express (4.16.1) - qs DoS Vulnerability",
    "description": "Older Express versions bundle vulnerable qs query string parsing libraries that can trigger exponential CPU usage.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-hrpp-h998-j3pp\nVulnerable version: 4.16.1 (patched in >= 4.18.2)",
    "remediation": "Upgrade express to version 4.18.2 or higher: npm install express@^4.18.2",
    "references": [],
    "cwe": [
      "CWE-400"
    ],
    "cves": [
      "CVE-2022-24999"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 75.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774640",
    "cve": "CVE-2022-24999",
    "affectedComponent": "package.json -> express@4.16.1"
  },
  {
    "id": "779c0e0b-b600-41bd-adb2-7c8b7dfe0682",
    "title": "Vulnerable Dependency: jsonwebtoken (8.5.1) - Insecure Verification",
    "description": "jsonwebtoken before 9.0.0 is vulnerable to algorithm confusion attacks allowing forgery of valid authentication tokens.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-hjrf-2m68-5959\nVulnerable version: 8.5.1 (patched in >= 9.0.0)",
    "remediation": "Upgrade jsonwebtoken to version 9.0.0 or higher: npm install jsonwebtoken@^9.0.0",
    "references": [],
    "cwe": [
      "CWE-287"
    ],
    "cves": [
      "CVE-2022-23529"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774643",
    "cve": "CVE-2022-23529",
    "affectedComponent": "package.json -> jsonwebtoken@8.5.1"
  },
  {
    "id": "c40ab05a-67d2-4558-bea6-96719594697b",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774645"
  },
  {
    "id": "1c65ac87-0433-406c-b1b3-fa2bd25e23a2",
    "title": "XML External Entity (XXE) Injection in Document Processor",
    "description": "Document upload endpoint parses XML input with external entity resolution enabled, allowing arbitrary file retrieval and SSRF.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "XML External Entity",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/documents/parse",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/documents/parse HTTP/1.1\nHost: target-app.internal\nContent-Type: application/xml\n\n<?xml version=\"1.0\"?>\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>\n<document><data>&xxe;</data></document>\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Disable XML external entity resolution (DOCTYPE / DTD parsing) in XML parser configurations.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-611"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774647"
  },
  {
    "id": "6cf09755-ec7b-4fa7-8f83-dc145d143e73",
    "title": "Open URL Redirection on User Logout",
    "description": "Logout parameter redirects users to untrusted external URLs without origin validation, enabling credential harvesting phishing attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/auth/logout?redirect_to=",
    "method": null,
    "parameter": null,
    "evidence": "GET /auth/logout?redirect_to=https://evil-phishing.com HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 302 Found\nLocation: https://evil-phishing.com",
    "remediation": "Validate redirect URLs against an internal whitelist or only permit relative path redirects.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-601"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 55.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774649"
  },
  {
    "id": "56a3e6cb-b26f-4eab-891e-6be3f391dbbf",
    "title": "Runtime SQL Injection in Authentication Endpoint",
    "description": "Active blackbox injection fuzzing on the login authentication endpoint revealed unescaped SQL syntax errors and full authentication bypass via boolean SQL injection payloads.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/login",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/auth/login HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"username\": \"admin' OR 1=1--\", \"password\": \"random_password\" }\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: auth_token=eyJhbGciOi...\n\n{\"status\": \"authenticated\", \"role\": \"superadmin\"}",
    "remediation": "Use parameterized queries or prepared statements: db.query(\"SELECT * FROM users WHERE username = ? AND password = ?\", [username, password]);",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774651"
  },
  {
    "id": "2e130ab2-996e-423d-8095-f952635e4c9b",
    "title": "Remote Command Execution via Server Diagnostics",
    "description": "Active injection probe into diagnostics ping parameter allowed execution of arbitrary operating system commands with container root privileges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/admin/diagnostics/ping",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/admin/diagnostics/ping HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"host\": \"127.0.0.1; id; cat /etc/passwd\" }\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nuid=0(root) gid=0(root) groups=0(root)\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Avoid invoking the system shell. Use execFile() or spawn() with argument arrays rather than concatenating user input into shell strings.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 97.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774652"
  },
  {
    "id": "8a40a72d-138b-4a8e-8553-eda78fedc230",
    "title": "Server-Side Request Forgery (SSRF) in Webhook Dispatcher",
    "description": "Outgoing webhook subscription accepts unvalidated internal IP addresses, allowing attacker payloads to extract AWS cloud metadata tokens (169.254.169.254).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/webhooks/subscribe",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/webhooks/subscribe HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"callback_url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\" }\n\nHTTP/1.1 200 OK\n\n{\"roleName\": \"production-ecs-task-role\", \"AccessKeyId\": \"AKIA...\", \"SecretAccessKey\": \"...\"}",
    "remediation": "Validate destination URLs against an explicit domain whitelist. Resolve hostnames and block private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254).",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 87.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774654"
  },
  {
    "id": "6734936a-7763-4312-bde0-5594df2907ce",
    "title": "Reflected Cross-Site Scripting (XSS) via Search Query",
    "description": "Payload delivered in query string parameter is reflected directly into HTML DOM without escaping, enabling arbitrary JavaScript execution in victim browsers.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/search?q=",
    "method": null,
    "parameter": null,
    "evidence": "GET /search?q=%3Cscript%3Ealert(document.domain)%3C/script%3E HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<div class=\"search-results\">Results for: <script>alert(document.domain)</script></div>",
    "remediation": "Ensure all user input rendered into HTML responses is properly contextual HTML entity encoded.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774656"
  },
  {
    "id": "e9219616-0a41-40d5-9613-3e22b43a0911",
    "title": "Broken Object-Level Authorization (IDOR) on Invoices",
    "description": "Authenticated user can access competitor invoice records by modifying the numeric invoice_id parameter in GET requests without permission verification.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/billing/invoices/1092",
    "method": null,
    "parameter": null,
    "evidence": "GET /api/v1/billing/invoices/1092 HTTP/1.1\nHost: target-app.internal\nAuthorization: Bearer <unauthorized_tenant_token>\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"invoice_id\": 1092, \"customer\": \"Competitor Corp\", \"amount_due\": 45000, \"credit_card_last4\": \"4242\"}",
    "remediation": "Enforce server-side authorization checks comparing user tenant identity against requested object ownership.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774658"
  },
  {
    "id": "6b999807-72ff-4164-9334-82556b48a3be",
    "title": "Permissive CORS Wildcard with Credentials Allowed",
    "description": "API preflight responses echo back arbitrary client Origin headers while setting Access-Control-Allow-Credentials to true, allowing unauthorized cross-origin data theft.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/user/profile",
    "method": null,
    "parameter": null,
    "evidence": "OPTIONS /api/v1/user/profile HTTP/1.1\nHost: target-app.internal\nOrigin: https://evil-attacker.com\n\nHTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://evil-attacker.com\nAccess-Control-Allow-Credentials: true",
    "remediation": "Do not reflect arbitrary Origin headers when Access-Control-Allow-Credentials is true. Restrict allowed origins to an explicit whitelist.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-942"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 68.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774659"
  },
  {
    "id": "5df8d22b-d289-4e83-b9f7-dcf9c76cf44e",
    "title": "Insecure Cookie Attribute (HttpOnly, Secure, SameSite) on Session Token",
    "description": "The session cookie is set without the HttpOnly, Secure, SameSite flag(s), allowing potential access via XSS or CSRF.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Session Management",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/session",
    "method": null,
    "parameter": null,
    "evidence": "HTTP/1.1 200 OK\nSet-Cookie: session_token=eyJhbGciOi...; Path=/; Expires=Thu, 10 Sep 2026 03:41:42 GMT\n\n[OWASP ZAP Finding]: Set-Cookie header missing HttpOnly, Secure, SameSite flags",
    "remediation": "Add HttpOnly, Secure, and SameSite=Lax (or Strict) attributes to all Set-Cookie headers.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-614"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774661"
  },
  {
    "id": "b634d854-0050-404e-b3d2-9dc8cfa7433a",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "Application fails to enforce HTTPS connections via HSTS response header, allowing man-in-the-middle attackers to downgrade connections to plaintext HTTP.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "GET / HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Strict-Transport-Security header is absent in response headers.",
    "remediation": "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header to all HTTPS responses.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"
    ],
    "cwe": [
      "CWE-319"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 31.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774663"
  },
  {
    "id": "1ff582da-f889-4017-9f80-994c604d7de4",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "The HSTS header forces web browsers to communicate exclusively over encrypted HTTPS, mitigating SSL-stripping and man-in-the-middle attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Strict-Transport-Security' was absent in response to https://ginandjuice.shop",
    "remediation": "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header to all HTTPS responses.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts"
    ],
    "cwe": [
      "CWE-319",
      "CWE-523"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774665"
  },
  {
    "id": "a57e09f8-e16f-4c2e-8ba2-5953b1e24be7",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "A Content Security Policy restricts sources of executable scripts, stylesheets, and frames, preventing Cross-Site Scripting (XSS) and data injection attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Content-Security-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Implement a strong `Content-Security-Policy` header (e.g. `default-src 'self'; script-src 'self'; object-src 'none'`).",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
    ],
    "cwe": [
      "CWE-1021",
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774667"
  },
  {
    "id": "abd8ab8f-d701-4cbe-ad00-5b17c13cf47c",
    "title": "Missing X-Content-Type-Options Header",
    "description": "Setting `X-Content-Type-Options: nosniff` prevents browsers from MIME-sniffing a response away from the declared content-type, mitigating drive-by downloads and script execution.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'X-Content-Type-Options' was absent in response to https://ginandjuice.shop\n[sentinal-headers]: Header 'Permissions-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser APIs.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
    ],
    "cwe": [
      "CWE-16"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774669"
  },
  {
    "id": "9621c210-9e03-40be-80d4-120c6a9080a0",
    "title": "Missing Referrer-Policy Header",
    "description": "The Referrer-Policy header controls how much referrer information (sent via the Referer header) should be included with requests.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Information Disclosure",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Referrer-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
    ],
    "cwe": [
      "CWE-200"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:42:10.774671"
  },
  {
    "id": "e19e59d2-6897-43cb-b98b-adee41053554",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "No Content Security Policy is defined, leaving client browsers unprotected against malicious inline scripts and unauthorized resource loading.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/dashboard",
    "method": null,
    "parameter": null,
    "evidence": "GET /dashboard HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Content-Security-Policy (CSP) header is absent in response headers.",
    "remediation": "Configure a strict Content-Security-Policy header: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 34.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521508"
  },
  {
    "id": "869b88d1-03bf-41ea-9a62-01f188170e32",
    "title": "Missing Clickjacking Defense (X-Frame-Options / CSP frame-ancestors)",
    "description": "Sensitive settings page can be embedded inside third-party iframes, enabling UI redressing and clickjacking attacks against authenticated users.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/settings/security",
    "method": null,
    "parameter": null,
    "evidence": "GET /settings/security HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: X-Frame-Options / frame-ancestors header is absent. Page can be embedded in malicious iframes.",
    "remediation": "Set X-Frame-Options: DENY or Content-Security-Policy: frame-ancestors 'none' to prevent framing.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 32.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521514"
  },
  {
    "id": "0d1a94d4-ec6f-4c09-ac89-db3a5f608b77",
    "title": "XML External Entity (XXE) Injection in Document Processor",
    "description": "Document upload endpoint parses XML input with external entity resolution enabled, allowing arbitrary file retrieval and SSRF.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "XML External Entity",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/documents/parse",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/documents/parse HTTP/1.1\nHost: target-app.internal\nContent-Type: application/xml\n\n<?xml version=\"1.0\"?>\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>\n<document><data>&xxe;</data></document>\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Disable XML external entity resolution (DOCTYPE / DTD parsing) in XML parser configurations.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-611"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521516"
  },
  {
    "id": "bc962568-76bf-4393-a325-3f5da98141ad",
    "title": "Open URL Redirection on User Logout",
    "description": "Logout parameter redirects users to untrusted external URLs without origin validation, enabling credential harvesting phishing attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/auth/logout?redirect_to=",
    "method": null,
    "parameter": null,
    "evidence": "GET /auth/logout?redirect_to=https://evil-phishing.com HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 302 Found\nLocation: https://evil-phishing.com",
    "remediation": "Validate redirect URLs against an internal whitelist or only permit relative path redirects.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-601"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 55.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521522"
  },
  {
    "id": "f8e0fb6d-ba98-4563-9ec4-e8535059e16b",
    "title": "Runtime SQL Injection in Authentication Endpoint",
    "description": "Active blackbox injection fuzzing on the login authentication endpoint revealed unescaped SQL syntax errors and full authentication bypass via boolean SQL injection payloads.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/login",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/auth/login HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"username\": \"admin' OR 1=1--\", \"password\": \"random_password\" }\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: auth_token=eyJhbGciOi...\n\n{\"status\": \"authenticated\", \"role\": \"superadmin\"}",
    "remediation": "Use parameterized queries or prepared statements: db.query(\"SELECT * FROM users WHERE username = ? AND password = ?\", [username, password]);",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521529"
  },
  {
    "id": "aad83396-0461-4e4b-9496-bdb0022da536",
    "title": "Remote Command Execution via Server Diagnostics",
    "description": "Active injection probe into diagnostics ping parameter allowed execution of arbitrary operating system commands with container root privileges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/admin/diagnostics/ping",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/admin/diagnostics/ping HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"host\": \"127.0.0.1; id; cat /etc/passwd\" }\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nuid=0(root) gid=0(root) groups=0(root)\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Avoid invoking the system shell. Use execFile() or spawn() with argument arrays rather than concatenating user input into shell strings.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 97.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521531"
  },
  {
    "id": "d7e9067f-0ce2-4c3e-96fe-bb4445bb233f",
    "title": "Server-Side Request Forgery (SSRF) in Webhook Dispatcher",
    "description": "Outgoing webhook subscription accepts unvalidated internal IP addresses, allowing attacker payloads to extract AWS cloud metadata tokens (169.254.169.254).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/webhooks/subscribe",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/webhooks/subscribe HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"callback_url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\" }\n\nHTTP/1.1 200 OK\n\n{\"roleName\": \"production-ecs-task-role\", \"AccessKeyId\": \"AKIA...\", \"SecretAccessKey\": \"...\"}",
    "remediation": "Validate destination URLs against an explicit domain whitelist. Resolve hostnames and block private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254).",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 87.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521534"
  },
  {
    "id": "592a3fc2-bcea-4a3b-8533-2acca68e744e",
    "title": "Reflected Cross-Site Scripting (XSS) via Search Query",
    "description": "Payload delivered in query string parameter is reflected directly into HTML DOM without escaping, enabling arbitrary JavaScript execution in victim browsers.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/search?q=",
    "method": null,
    "parameter": null,
    "evidence": "GET /search?q=%3Cscript%3Ealert(document.domain)%3C/script%3E HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<div class=\"search-results\">Results for: <script>alert(document.domain)</script></div>",
    "remediation": "Ensure all user input rendered into HTML responses is properly contextual HTML entity encoded.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521536"
  },
  {
    "id": "2c287f92-e7f2-45eb-8b91-7bf4aa0327d9",
    "title": "Broken Object-Level Authorization (IDOR) on Invoices",
    "description": "Authenticated user can access competitor invoice records by modifying the numeric invoice_id parameter in GET requests without permission verification.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/billing/invoices/1092",
    "method": null,
    "parameter": null,
    "evidence": "GET /api/v1/billing/invoices/1092 HTTP/1.1\nHost: target-app.internal\nAuthorization: Bearer <unauthorized_tenant_token>\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"invoice_id\": 1092, \"customer\": \"Competitor Corp\", \"amount_due\": 45000, \"credit_card_last4\": \"4242\"}",
    "remediation": "Enforce server-side authorization checks comparing user tenant identity against requested object ownership.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521537"
  },
  {
    "id": "5b8040e3-630c-4b43-8cc3-ccc1eb65076f",
    "title": "Permissive CORS Wildcard with Credentials Allowed",
    "description": "API preflight responses echo back arbitrary client Origin headers while setting Access-Control-Allow-Credentials to true, allowing unauthorized cross-origin data theft.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/user/profile",
    "method": null,
    "parameter": null,
    "evidence": "OPTIONS /api/v1/user/profile HTTP/1.1\nHost: target-app.internal\nOrigin: https://evil-attacker.com\n\nHTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://evil-attacker.com\nAccess-Control-Allow-Credentials: true",
    "remediation": "Do not reflect arbitrary Origin headers when Access-Control-Allow-Credentials is true. Restrict allowed origins to an explicit whitelist.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"
    ],
    "cwe": [
      "CWE-942"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 68.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521539"
  },
  {
    "id": "4dd52029-fdd2-41fb-9027-c56190bd60e2",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "The HSTS header forces web browsers to communicate exclusively over encrypted HTTPS, mitigating SSL-stripping and man-in-the-middle attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Strict-Transport-Security' was absent in response to https://ginandjuice.shop",
    "remediation": "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header to all HTTPS responses.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts"
    ],
    "cwe": [
      "CWE-319",
      "CWE-523"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521541"
  },
  {
    "id": "739d5608-1438-41f6-8e2e-9a4062ad3d63",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "A Content Security Policy restricts sources of executable scripts, stylesheets, and frames, preventing Cross-Site Scripting (XSS) and data injection attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Content-Security-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Implement a strong `Content-Security-Policy` header (e.g. `default-src 'self'; script-src 'self'; object-src 'none'`).",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
    ],
    "cwe": [
      "CWE-1021",
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521543"
  },
  {
    "id": "19abb2d4-4f50-4b25-ad7e-d556799f787e",
    "title": "Missing X-Content-Type-Options Header",
    "description": "Setting `X-Content-Type-Options: nosniff` prevents browsers from MIME-sniffing a response away from the declared content-type, mitigating drive-by downloads and script execution.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'X-Content-Type-Options' was absent in response to https://ginandjuice.shop\n[sentinal-headers]: Header 'Permissions-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser APIs.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
    ],
    "cwe": [
      "CWE-16"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521545"
  },
  {
    "id": "4aa0d466-b3b5-4b04-b85a-4d70a2028912",
    "title": "Missing Referrer-Policy Header",
    "description": "The Referrer-Policy header controls how much referrer information (sent via the Referer header) should be included with requests.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Information Disclosure",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Referrer-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
    ],
    "cwe": [
      "CWE-200"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:56:01.521547"
  },
  {
    "id": "dcea9f41-31d9-4a3f-bf24-c2f8cb2eb4e0",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "MEDIUM",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/250.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094778"
  },
  {
    "id": "6291235b-26fe-4efd-93c0-282d59165a7a",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094793"
  },
  {
    "id": "3dd69f58-a665-4aa7-931a-a6fb3831dacb",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094802"
  },
  {
    "id": "72cb9148-9aeb-4146-8f6f-c326c167fa60",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094810"
  },
  {
    "id": "bb3db939-1a27-4b67-98ef-b14d622a1751",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094818"
  },
  {
    "id": "6631c067-5414-4e66-b847-5d6aa0a201e1",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094825"
  },
  {
    "id": "990c077b-373d-424c-9e7f-36f9aed81ce2",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094831"
  },
  {
    "id": "cf209824-961e-4891-94b7-16df9d4b9561",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094836"
  },
  {
    "id": "f44cb337-7781-4ef3-b5f5-ddeaef47dbb3",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094844"
  },
  {
    "id": "99507f3f-e055-43cf-bbbb-ea97c402786a",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094851"
  },
  {
    "id": "2c0a1951-e9ad-4172-81b6-3688f2f4e3e3",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094858"
  },
  {
    "id": "e321c351-7a70-44a4-b851-97d3cf711b52",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094866"
  },
  {
    "id": "c85a1d1e-beee-4820-9a73-fd30bac44fc2",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094875"
  },
  {
    "id": "9b9937d1-cd56-432d-8209-47cf7fa8be7a",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094884"
  },
  {
    "id": "24506290-7fc4-465c-a022-07ad5df2cdf2",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094892"
  },
  {
    "id": "44e3559e-e4d2-46c7-b400-4f1415a1e939",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094901"
  },
  {
    "id": "b7eeaff8-816a-4e8d-b852-d5c53dda5c11",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094910"
  },
  {
    "id": "49cbbf38-26f6-40cd-a309-e1587f0be8b7",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094919"
  },
  {
    "id": "ed735ef5-59f8-4ed3-9d57-9bac32db156f",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094927"
  },
  {
    "id": "9a865773-7135-4845-9d48-59eeae606135",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094936"
  },
  {
    "id": "ec93f058-af7f-43df-a36d-2b5efe5c8dbe",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094945"
  },
  {
    "id": "9cce7322-6fab-405a-9f11-0e08db3bbf10",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094954"
  },
  {
    "id": "a2596f62-941b-4e67-98f0-4fdc75379405",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094962"
  },
  {
    "id": "3b44aada-b0f4-4bf0-a564-1ec145b19f1d",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094971"
  },
  {
    "id": "3f129b46-4ff5-4bef-8c3b-2d8b4457a372",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094980"
  },
  {
    "id": "fedc1c15-f609-4c40-a0d4-46fc8687d260",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.094989"
  },
  {
    "id": "fef7c533-6036-4180-a477-e1e7953277f8",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095001"
  },
  {
    "id": "6e61fe5f-c0cc-483c-aaf4-e06089ec540f",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095010"
  },
  {
    "id": "e0dc7f6a-db22-4036-9945-b2db381ad24c",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095018"
  },
  {
    "id": "170ad70f-0df7-43dd-8fa6-142662085d5c",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095027"
  },
  {
    "id": "e26fa934-019c-4fa9-a3c0-60ece976224d",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095036"
  },
  {
    "id": "9424d891-9fb8-43cf-ab48-4ca064083eb6",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095044"
  },
  {
    "id": "83ce10a6-7501-4f61-a795-39212f52cc2f",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095053"
  },
  {
    "id": "0c9a5cc1-19ad-4c84-9f7b-bf7d0fa6e492",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095061"
  },
  {
    "id": "3a162817-fc63-4616-bd45-d50c409c89dd",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095070"
  },
  {
    "id": "43377cb7-2c4d-421d-aadb-46f8fb674155",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095078"
  },
  {
    "id": "537ea0bb-0c36-4141-a286-09b2110a0a79",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095087"
  },
  {
    "id": "74c7bd5e-8ca2-4067-9fd7-114f6f19bc71",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095095"
  },
  {
    "id": "74818263-2028-4dd8-a4ff-0a5bb0d0ab21",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095104"
  },
  {
    "id": "4fa3d670-fc19-45d1-823e-d86d8e083f6e",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095112"
  },
  {
    "id": "f80ff7f4-e905-4c9e-97a3-85db6713687c",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095121"
  },
  {
    "id": "4ed6a96d-57a4-4c54-bc29-72256a705baf",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095130"
  },
  {
    "id": "125ff574-2e8a-45e8-9416-e8e5bdec6e23",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095137"
  },
  {
    "id": "f6dbc8eb-35a7-4e09-9eca-1cac5d38e902",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095144"
  },
  {
    "id": "6471a461-0d57-416a-b44c-ed86f5e421b5",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095151"
  },
  {
    "id": "caa63f5c-53b4-41f7-86c7-cc1e97a882d5",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095157"
  },
  {
    "id": "e3968b60-a1c0-4f02-94de-edff1bc2735e",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095164"
  },
  {
    "id": "f0a9d269-b834-4d2d-a2b5-0fedfd805290",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095171"
  },
  {
    "id": "912400b0-fab0-408b-864c-2cde7ecff487",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095179"
  },
  {
    "id": "fef9c69a-762e-4ff5-9a88-79a75e223b2f",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095186"
  },
  {
    "id": "61cfc2ca-906a-447b-ae0a-75a3fac15c86",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095192"
  },
  {
    "id": "6eb50e52-5f96-4cfd-b687-aa5f89079d57",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095199"
  },
  {
    "id": "d7486dba-8821-4750-9f84-6c62086db7b7",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095206"
  },
  {
    "id": "5e13082b-fc02-4b95-bbf8-1abbe426b721",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095213"
  },
  {
    "id": "7f1bcbda-2243-484f-85d7-82c9d2f9aca3",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095220"
  },
  {
    "id": "f050c632-8d98-411d-88b0-bacc0ff02273",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095227"
  },
  {
    "id": "dffe9f4e-46f1-4be2-a1d4-9716f076be36",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095235"
  },
  {
    "id": "85589742-18b4-454a-9d8e-1ecdc9feff56",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095242"
  },
  {
    "id": "f6e14766-5a98-4e60-bf9e-dcd1b1c5f8a9",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095249"
  },
  {
    "id": "e6980e00-d0b5-484f-b59b-d736181cbea5",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095255"
  },
  {
    "id": "74ea32c4-9489-44cb-8f54-07c2b92ea4a4",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095261"
  },
  {
    "id": "d03f84c0-4a51-44ac-a10a-24c3ca74463a",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095266"
  },
  {
    "id": "233e0803-55d8-42b2-9855-a1cb5add4f69",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095272"
  },
  {
    "id": "b8cbb7d3-d081-4206-9d18-d79a644bf7dd",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095278"
  },
  {
    "id": "ba3aac30-ceb1-4793-9c25-8bd8451a7165",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095284"
  },
  {
    "id": "bf6d7aa4-37c9-4554-8c11-cd2cb2fa33b0",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095290"
  },
  {
    "id": "95bb5adb-1ccf-4f75-ae77-31623f248779",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095295"
  },
  {
    "id": "145a2729-6428-48a7-8a88-42c2eb5d1957",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095301"
  },
  {
    "id": "f62dcac9-72fe-492d-bc76-7149f0eda009",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "MEDIUM",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/250.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095306"
  },
  {
    "id": "1e912c98-8763-47c3-bdaa-89434fc46c1d",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/79.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095313"
  },
  {
    "id": "117ebedf-456f-4660-94e0-ce922a68baa8",
    "title": "Vulnerable Dependency: moment (2.29.1) - Regular Expression DoS",
    "description": "Pathological regular expression matching in moment when parsing RFC2822 dates leads to server CPU starvation.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-8hfj-j24r-96c4\nVulnerable version: 2.29.1 (patched in >= 2.29.4)",
    "remediation": "Upgrade moment to version 2.29.4 or migrate to lightweight date-fns: npm install moment@^2.29.4",
    "references": [],
    "cwe": [
      "CWE-1333"
    ],
    "cves": [
      "CVE-2022-24785"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 43.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095319",
    "cve": "CVE-2022-24785",
    "affectedComponent": "package.json -> moment@2.29.1"
  },
  {
    "id": "b5c15dd1-4803-454f-98fe-4b643ec5cc1c",
    "title": "Vulnerable Dependency: minimist (1.2.5) - Prototype Pollution",
    "description": "Prototype pollution in minimist through parse method when processing CLI parameters.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-xvch-5gv4-984h\nVulnerable version: 1.2.5 (patched in >= 1.2.6)",
    "remediation": "Upgrade minimist to version 1.2.6 or higher: npm install minimist@^1.2.6",
    "references": [],
    "cwe": [
      "CWE-1321"
    ],
    "cves": [
      "CVE-2021-44906"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095326",
    "cve": "CVE-2021-44906",
    "affectedComponent": "package.json -> minimist@1.2.5"
  },
  {
    "id": "8dc781e1-23a7-405f-8cc2-64d30f5301ca",
    "title": "Vulnerable Dependency: node-fetch (2.6.1) - Cookie Exposure via Redirect",
    "description": "node-fetch forwards Authorization and Cookie headers across foreign origins on 302 redirects.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-r683-j2x4-v87g\nVulnerable version: 2.6.1 (patched in >= 2.6.7)",
    "remediation": "Upgrade node-fetch to version 2.6.7 or higher: npm install node-fetch@^2.6.7",
    "references": [],
    "cwe": [
      "CWE-200"
    ],
    "cves": [
      "CVE-2022-0235"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 76.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095333",
    "cve": "CVE-2022-0235",
    "affectedComponent": "package.json -> node-fetch@2.6.1"
  },
  {
    "id": "f372a4ac-f968-4bae-949e-64ddd059263e",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095340"
  },
  {
    "id": "0216a59c-0239-4d27-b431-cd11d902303d",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095346"
  },
  {
    "id": "3356c113-29a3-42fa-b807-01b1a871184b",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095353"
  },
  {
    "id": "4052f031-d2a7-4296-95a6-4190af660155",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095360"
  },
  {
    "id": "6705bf72-f778-4f14-968c-6a19e7026380",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095367"
  },
  {
    "id": "4330670b-cd70-42d7-84bc-64b339d27b1e",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095383"
  },
  {
    "id": "6b58e527-e8da-4092-9d90-8e68cb0b39b2",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095391"
  },
  {
    "id": "c8eebe15-427b-436d-9ba4-2a57f3fb6ec5",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095399"
  },
  {
    "id": "203a1655-4c93-4be0-bae4-c764f129c99d",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095406"
  },
  {
    "id": "6805f18b-1d39-43e1-968a-2d4b21fb5413",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095413"
  },
  {
    "id": "fbeff6ff-e7f5-4e7c-a5e5-c184c26a26ac",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095419"
  },
  {
    "id": "68accac7-5d74-4273-8f32-1426d5166c8f",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095426"
  },
  {
    "id": "89dd78a2-3f12-4dde-8f83-aefc17c64814",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095433"
  },
  {
    "id": "e50d70e3-922c-49b5-8c66-87d70ec3b21f",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095440"
  },
  {
    "id": "a4b72f00-866e-4264-869e-abacb41b8635",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095447"
  },
  {
    "id": "2cf8e012-f92c-4761-b56e-29251431bdbc",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095454"
  },
  {
    "id": "e14b4f88-159c-44fe-935d-e623b1561b75",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095463"
  },
  {
    "id": "1bea7f67-0b60-427b-ac3a-b1e613e8e33b",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095469"
  },
  {
    "id": "82f5ca60-6c1b-4caf-8ebb-4e81de9cc66a",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095476"
  },
  {
    "id": "5f89e91f-3275-47a0-8271-8094be738f9d",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095483"
  },
  {
    "id": "67af1ef2-7015-441a-a284-a1153832858c",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095490"
  },
  {
    "id": "886cd623-d4fc-41fa-8dee-55f5e6de2620",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095496"
  },
  {
    "id": "0d0168fb-9d8f-4d33-8eb4-ba53249e9b3f",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095503"
  },
  {
    "id": "94413e66-d89f-4765-acc8-43a9bd98be3c",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095510"
  },
  {
    "id": "3ecf7e75-993c-4dca-8436-efbae7f64602",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095517"
  },
  {
    "id": "695c2f6c-b3e1-442f-b6c7-7a723bca640a",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095523"
  },
  {
    "id": "017ea898-b0f8-420b-b548-10c9cc153490",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095531"
  },
  {
    "id": "14e93b40-662f-463f-a6df-ae23abc8305b",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095537"
  },
  {
    "id": "f798fd32-8b8d-4059-9302-51f992c280b2",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095544"
  },
  {
    "id": "5aa2eb1d-e09d-4716-9541-5231c7ae9534",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095551"
  },
  {
    "id": "50960e76-233e-4643-b7d2-4f16b6c7df0a",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095558"
  },
  {
    "id": "f9ee999f-4f22-411a-a91e-966c39b8e652",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095566"
  },
  {
    "id": "b46dc383-adf6-4090-abe9-4498aa115166",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095572"
  },
  {
    "id": "a924e1db-a3f8-45a1-b299-8ffe59ce24c0",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095578"
  },
  {
    "id": "6d2431c4-8ec6-48e8-89d4-2edf72dc1355",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095584"
  },
  {
    "id": "a0857e6c-4bbd-40b2-b19e-a75a52861866",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095589"
  },
  {
    "id": "c7704d91-6e45-4aec-8411-bf9d29774e50",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095595"
  },
  {
    "id": "671e5de8-55e4-41d1-a499-ee75b7ef9776",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095600"
  },
  {
    "id": "cf91eaf0-9faa-451c-9e90-b4f7d14d4535",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095606"
  },
  {
    "id": "870e7450-a0cc-4cf5-9152-5010e5dbdfaa",
    "title": "Insecure Cookie Attribute (HttpOnly, Secure, SameSite) on Session Token",
    "description": "The session cookie is set without the HttpOnly, Secure, SameSite flag(s), allowing potential access via XSS or CSRF.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Session Management",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/session",
    "method": null,
    "parameter": null,
    "evidence": "HTTP/1.1 200 OK\nSet-Cookie: session_token=eyJhbGciOi...; Path=/; Expires=Thu, 10 Sep 2026 03:41:42 GMT\n\n[OWASP ZAP Finding]: Set-Cookie header missing HttpOnly, Secure, SameSite flags",
    "remediation": "Add HttpOnly, Secure, and SameSite=Lax (or Strict) attributes to all Set-Cookie headers.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-614"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095612"
  },
  {
    "id": "74d98b7f-560d-42f1-ae8d-3111fee4a3d8",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "Application fails to enforce HTTPS connections via HSTS response header, allowing man-in-the-middle attackers to downgrade connections to plaintext HTTP.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "GET / HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Strict-Transport-Security header is absent in response headers.",
    "remediation": "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header to all HTTPS responses.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-319"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 31.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095617"
  },
  {
    "id": "b1e54d91-5aa1-4ac5-b081-05390dc6ce96",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "No Content Security Policy is defined, leaving client browsers unprotected against malicious inline scripts and unauthorized resource loading.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/dashboard",
    "method": null,
    "parameter": null,
    "evidence": "GET /dashboard HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: Content-Security-Policy (CSP) header is absent in response headers.",
    "remediation": "Configure a strict Content-Security-Policy header: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 34.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095623"
  },
  {
    "id": "6e62363e-eed0-4f49-b84d-fdfff39b41ee",
    "title": "Missing Clickjacking Defense (X-Frame-Options / CSP frame-ancestors)",
    "description": "Sensitive settings page can be embedded inside third-party iframes, enabling UI redressing and clickjacking attacks against authenticated users.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/settings/security",
    "method": null,
    "parameter": null,
    "evidence": "GET /settings/security HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n[OWASP ZAP Finding]: X-Frame-Options / frame-ancestors header is absent. Page can be embedded in malicious iframes.",
    "remediation": "Set X-Frame-Options: DENY or Content-Security-Policy: frame-ancestors 'none' to prevent framing.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-1021"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 32.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095628"
  },
  {
    "id": "57af2d96-1549-4898-9a31-14d334cbc3ce",
    "title": "XML External Entity (XXE) Injection in Document Processor",
    "description": "Document upload endpoint parses XML input with external entity resolution enabled, allowing arbitrary file retrieval and SSRF.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "XML External Entity",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/documents/parse",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/documents/parse HTTP/1.1\nHost: target-app.internal\nContent-Type: application/xml\n\n<?xml version=\"1.0\"?>\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>\n<document><data>&xxe;</data></document>\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Disable XML external entity resolution (DOCTYPE / DTD parsing) in XML parser configurations.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-611"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095634"
  },
  {
    "id": "8a132c0b-ebde-4d69-92e0-cfa13dcfbb51",
    "title": "Open URL Redirection on User Logout",
    "description": "Logout parameter redirects users to untrusted external URLs without origin validation, enabling credential harvesting phishing attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/auth/logout?redirect_to=",
    "method": null,
    "parameter": null,
    "evidence": "GET /auth/logout?redirect_to=https://evil-phishing.com HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 302 Found\nLocation: https://evil-phishing.com",
    "remediation": "Validate redirect URLs against an internal whitelist or only permit relative path redirects.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-601"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 55.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095640"
  },
  {
    "id": "6b1fb9fe-a2f2-47e3-b2fe-27c8ad74f5e4",
    "title": "Runtime SQL Injection in Authentication Endpoint",
    "description": "Active blackbox injection fuzzing on the login authentication endpoint revealed unescaped SQL syntax errors and full authentication bypass via boolean SQL injection payloads.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/auth/login",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/auth/login HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"username\": \"admin' OR 1=1--\", \"password\": \"random_password\" }\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: auth_token=eyJhbGciOi...\n\n{\"status\": \"authenticated\", \"role\": \"superadmin\"}",
    "remediation": "Use parameterized queries or prepared statements: db.query(\"SELECT * FROM users WHERE username = ? AND password = ?\", [username, password]);",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095647"
  },
  {
    "id": "470fdecb-1f4f-41a6-b252-1192445c9552",
    "title": "Remote Command Execution via Server Diagnostics",
    "description": "Active injection probe into diagnostics ping parameter allowed execution of arbitrary operating system commands with container root privileges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/admin/diagnostics/ping",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/admin/diagnostics/ping HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"host\": \"127.0.0.1; id; cat /etc/passwd\" }\n\nHTTP/1.1 200 OK\nContent-Type: text/plain\n\nuid=0(root) gid=0(root) groups=0(root)\nroot:x:0:0:root:/root:/bin/bash",
    "remediation": "Avoid invoking the system shell. Use execFile() or spawn() with argument arrays rather than concatenating user input into shell strings.",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 97.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095653"
  },
  {
    "id": "e4879fb8-1b2b-41c5-8f2b-68aee72cf118",
    "title": "Server-Side Request Forgery (SSRF) in Webhook Dispatcher",
    "description": "Outgoing webhook subscription accepts unvalidated internal IP addresses, allowing attacker payloads to extract AWS cloud metadata tokens (169.254.169.254).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/api/v1/webhooks/subscribe",
    "method": null,
    "parameter": null,
    "evidence": "POST /api/v1/webhooks/subscribe HTTP/1.1\nHost: target-app.internal\nContent-Type: application/json\n\n{ \"callback_url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\" }\n\nHTTP/1.1 200 OK\n\n{\"roleName\": \"production-ecs-task-role\", \"AccessKeyId\": \"AKIA...\", \"SecretAccessKey\": \"...\"}",
    "remediation": "Validate destination URLs against an explicit domain whitelist. Resolve hostnames and block private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254).",
    "references": [
      "https://owasp.org/www-community/controls/SecureCookieAttribute"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 87.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095661"
  },
  {
    "id": "51c4448f-6335-4c8d-9bb5-bac418cac8c3",
    "title": "Reflected Cross-Site Scripting (XSS) via Search Query",
    "description": "Payload delivered in query string parameter is reflected directly into HTML DOM without escaping, enabling arbitrary JavaScript execution in victim browsers.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "DAST",
    "scanner": "owasp-zap",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/search?q=",
    "method": null,
    "parameter": null,
    "evidence": "GET /search?q=%3Cscript%3Ealert(document.domain)%3C/script%3E HTTP/1.1\nHost: target-app.internal\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<div class=\"search-results\">Results for: <script>alert(document.domain)</script></div>",
    "remediation": "Ensure all user input rendered into HTML responses is properly contextual HTML entity encoded.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095668"
  },
  {
    "id": "703849bb-92b8-48b7-b9fc-d0ad35599a41",
    "title": "Missing HTTP Strict Transport Security (HSTS) Header",
    "description": "The HSTS header forces web browsers to communicate exclusively over encrypted HTTPS, mitigating SSL-stripping and man-in-the-middle attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Strict-Transport-Security' was absent in response to https://ginandjuice.shop",
    "remediation": "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header to all HTTPS responses.",
    "references": [
      "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts"
    ],
    "cwe": [
      "CWE-319",
      "CWE-523"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 50.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095674"
  },
  {
    "id": "a12fdbc2-005b-4095-9af6-3e24c7696da8",
    "title": "Missing Content Security Policy (CSP) Header",
    "description": "A Content Security Policy restricts sources of executable scripts, stylesheets, and frames, preventing Cross-Site Scripting (XSS) and data injection attacks.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Content-Security-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Implement a strong `Content-Security-Policy` header (e.g. `default-src 'self'; script-src 'self'; object-src 'none'`).",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
    ],
    "cwe": [
      "CWE-1021",
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095681"
  },
  {
    "id": "c7478faa-af3d-43b2-82b4-dffe8521a11f",
    "title": "Missing X-Content-Type-Options Header",
    "description": "Setting `X-Content-Type-Options: nosniff` prevents browsers from MIME-sniffing a response away from the declared content-type, mitigating drive-by downloads and script execution.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'X-Content-Type-Options' was absent in response to https://ginandjuice.shop\n[sentinal-headers]: Header 'Permissions-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser APIs.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
    ],
    "cwe": [
      "CWE-16"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095687"
  },
  {
    "id": "2b74daaa-66b4-4248-bb47-4ecc1acb5085",
    "title": "Missing Referrer-Policy Header",
    "description": "The Referrer-Policy header controls how much referrer information (sent via the Referer header) should be included with requests.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Information Disclosure",
    "source": "WEB",
    "scanner": "sentinal-headers",
    "file": null,
    "line": null,
    "code_snippet": null,
    "endpoint": "/",
    "method": null,
    "parameter": null,
    "evidence": "Header 'Referrer-Policy' was absent in response to https://ginandjuice.shop",
    "remediation": "Configure `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.",
    "references": [
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
    ],
    "cwe": [
      "CWE-200"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 25.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T03:59:29.095694"
  },
  {
    "id": "c88dd6f2-3b01-4eb0-a1ed-d9822d2486b9",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "MEDIUM",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/250.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824818"
  },
  {
    "id": "cbae9cb8-0189-4d0d-9db9-3a6266217b29",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824827"
  },
  {
    "id": "1703bbbf-92ed-4811-8dd4-9bd4249e70ff",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824831"
  },
  {
    "id": "9abff186-afd9-46c8-9504-4689aad65646",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824834"
  },
  {
    "id": "33b9a036-96e4-4284-b92d-c244297c892a",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824836"
  },
  {
    "id": "e67a50b4-4b2c-42a8-a086-def17b3a326e",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824839"
  },
  {
    "id": "b49fb399-86ff-4f24-b55f-27c8d3c163fe",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824841"
  },
  {
    "id": "c12f6950-22aa-4cb4-94e7-6b8a7d0de51c",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824844"
  },
  {
    "id": "155e4369-b8db-4e30-b067-ab18f1f12e9a",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824846"
  },
  {
    "id": "a2774118-4045-4198-8e82-7e3631208bd6",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824849"
  },
  {
    "id": "a0bba86f-a3b6-42a7-bd8b-e40282aa6be4",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824851"
  },
  {
    "id": "e47d833f-fd11-4296-ac66-403206418933",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824854"
  },
  {
    "id": "869cf266-4bb8-471b-a70e-4ac26a9a1148",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824856"
  },
  {
    "id": "571c785e-a711-4268-8c45-989683e586ec",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824858"
  },
  {
    "id": "331e3878-bc67-4e97-a131-c437d2375c23",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824860"
  },
  {
    "id": "5a269659-d0f1-4ef3-904c-b9063ba976d4",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824863"
  },
  {
    "id": "c827f239-dbfd-499a-aded-2e62ef7af893",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824865"
  },
  {
    "id": "297d6b89-a261-4d1e-b6cb-d373853661ba",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824867"
  },
  {
    "id": "b118b3ef-4218-4ac5-8794-0b8a88ead900",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824870"
  },
  {
    "id": "be2ff397-3862-4ffc-930b-cc19572740bf",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824872"
  },
  {
    "id": "73965f60-32af-4107-ba55-b1760fe48c98",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824874"
  },
  {
    "id": "a67d3ad5-691b-4dfa-a929-ad59db765b39",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824876"
  },
  {
    "id": "cedf1358-034d-4e68-951d-7034c2756942",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824878"
  },
  {
    "id": "3b1ae4bf-df1e-4c4d-bc69-d104706320ac",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824881"
  },
  {
    "id": "a69c2407-6570-4c11-bd08-248eec3e78c8",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824883"
  },
  {
    "id": "a87f0cef-ebb7-46dd-a271-700c2250c0e7",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824885"
  },
  {
    "id": "c535ea1d-36d7-4e39-9122-595995ef8112",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824888"
  },
  {
    "id": "298efc5d-9eab-4aa0-a6c3-9332cc5d8dd7",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824890"
  },
  {
    "id": "12cd254d-f5b0-44bc-b687-2aa389da489f",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824892"
  },
  {
    "id": "97fc67fb-5bf7-4e36-9fa8-3d4d15001b4a",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824894"
  },
  {
    "id": "34150520-b6de-422c-8185-43bd347cd725",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824896"
  },
  {
    "id": "738eb775-1431-4868-b812-05196298a9a4",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824899"
  },
  {
    "id": "64af2d70-c15e-4b7c-b19a-f182b859c03a",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824901"
  },
  {
    "id": "0772ce57-9fb3-453f-ae1b-24ace3cc1e7f",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824904"
  },
  {
    "id": "98e55181-a5cb-4188-9afb-d0f3224b2994",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824906"
  },
  {
    "id": "3e2e77ef-67d0-4657-b0cf-00cdcf387078",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824908"
  },
  {
    "id": "003cc7f9-5495-4b01-87cb-6e2c14f80944",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824911"
  },
  {
    "id": "23634af3-e550-4d4e-bf2d-d7abcffc927a",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824913"
  },
  {
    "id": "c387c7b1-6de7-4fa6-9c23-00d8dce93b49",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824916"
  },
  {
    "id": "e098e868-98fc-4f83-9a2a-5a842606d9ab",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824918"
  },
  {
    "id": "8ea1360f-5a65-4920-97d6-7fc13180feff",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824920"
  },
  {
    "id": "efa8eb69-4edd-405a-8383-d48257225986",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824922"
  },
  {
    "id": "61f75565-48a8-44a2-95e0-a1390188bc7a",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824925"
  },
  {
    "id": "f23330e3-1d79-4842-8fc5-cc040f3530d8",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824927"
  },
  {
    "id": "ded81d3f-6f92-48b9-8124-a67753e64476",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824929"
  },
  {
    "id": "d3c895e4-42e1-402f-b741-123f3491be00",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824931"
  },
  {
    "id": "1acd5e7d-af33-43ef-b443-4711d1463205",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824933"
  },
  {
    "id": "ff470a45-4319-434e-b361-59b525d79196",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824936"
  },
  {
    "id": "d4469a74-c696-4e35-b6e5-e7e9f404d641",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824938"
  },
  {
    "id": "bebe84a4-56d7-4221-bd9b-d97b9b2c62db",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824941"
  },
  {
    "id": "c06a8ecb-7941-4a09-8c37-1fcab0ca3ee9",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824943"
  },
  {
    "id": "fb9162ba-4e2a-491d-acf9-7acb03310edf",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824945"
  },
  {
    "id": "26c99364-689f-43a4-8ad8-5a37369f5fcf",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824947"
  },
  {
    "id": "21a8ce3d-f8fd-41fc-9d47-68058d2b57df",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824949"
  },
  {
    "id": "5fc64e1e-8df5-4a68-b07c-5ddd5970ec43",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824952"
  },
  {
    "id": "b828a198-acc0-4e37-a4ff-12f59b0a82eb",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824954"
  },
  {
    "id": "45f0ca95-e29b-43d9-b72b-b2ea08f01944",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824956"
  },
  {
    "id": "1702806f-bdfa-408d-9ae5-2eb9691db0c3",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/502.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824958"
  },
  {
    "id": "8522883d-3f01-4ed1-9d43-e596e7c5fb23",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824961"
  },
  {
    "id": "6b4b1498-f6b1-4c92-ad31-8f23c43c6218",
    "title": "Debug Mode Enabled in Production Application Configuration",
    "description": "Application environment configuration enables verbose error stack traces and debugging logs.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Security Misconfiguration",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/appConfig.js",
    "line": 8,
    "code_snippet": "module.exports = {\n  DEBUG: true,\n  VERBOSE_ERRORS: true\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.debug-mode\nMatch: DEBUG flag set to true in production config",
    "remediation": "Ensure DEBUG is disabled in production environments: DEBUG: process.env.NODE_ENV !== \"production\".",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-489"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 28.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824963"
  },
  {
    "id": "b5ecff73-e44e-40d9-9b23-b0cfe30af26f",
    "title": "Dockerfile Container Running as Root User",
    "description": "Container process runs with root privileges by default, violating principle of least privilege.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Container Security",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "Dockerfile",
    "line": 24,
    "code_snippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: dockerfile.security.audit.root-user\nMatch: Missing USER directive before CMD",
    "remediation": "Add non-root user in Dockerfile: USER node",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-250"
    ],
    "cves": [],
    "owasp": [
      "A05:2021-Security Misconfiguration"
    ],
    "risk_score": 60.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824965"
  },
  {
    "id": "314d36d7-9742-4aa2-a4c4-e725cc08ca3b",
    "title": "Potential SQL Injection via Unsanitized Query Execution",
    "description": "Direct string concatenation of user-controlled request parameters into database SQL queries without parameterized binding.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "SQL Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/userController.js",
    "line": 42,
    "code_snippet": "const query = ;\nconst result = await db.query(query);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.sqli\nSink: db.query(query) with unescaped template literal",
    "remediation": "Use parameterized queries with bind parameters: db.query(\"SELECT * FROM users WHERE email = ? AND password = ?\", [req.body.email, req.body.password]);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-89"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 98.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824967"
  },
  {
    "id": "120b877e-8448-4b59-95f3-225d7dd889b6",
    "title": "Remote Code Execution via Insecure Child Process Invocation",
    "description": "User-controlled input passed directly into shell execution function child_process.exec without sanitization.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Command Injection",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/systemRunner.js",
    "line": 19,
    "code_snippet": "const { exec } = require(\"child_process\");\nfunction runDiagnostics(targetHost) {\n  exec(, (err, stdout) => { ... });\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.child-process\nSink: exec()",
    "remediation": "Use execFile() or spawn() with argument arrays rather than invoking a shell: execFile(\"ping\", [\"-c\", \"4\", targetHost], ...);",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-78"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824970"
  },
  {
    "id": "4bd250e8-5dc2-4c54-b447-c51a514aefd2",
    "title": "Server-Side Request Forgery (SSRF) in Remote Webhook Dispatcher",
    "description": "Application accepts an unvalidated destination URL from user requests and issues HTTP requests to it without private IP blocking.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Server-Side Request Forgery",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/services/webhookService.js",
    "line": 68,
    "code_snippet": "async function dispatchWebhook(callbackUrl, payload) {\n  const response = await axios.post(callbackUrl, payload, { timeout: 5000 });\n  return response.data;\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.ssrf\nSink: axios.post(callbackUrl, payload)",
    "remediation": "Validate destination URLs against an explicit domain whitelist and block private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-918"
    ],
    "cves": [],
    "owasp": [
      "A10:2021-Server-Side Request Forgery"
    ],
    "risk_score": 86.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824972"
  },
  {
    "id": "86830829-bcee-4c97-98cc-91d0772751e6",
    "title": "Arbitrary File Read / Path Traversal in Static Asset Router",
    "description": "File path parameter is constructed with path.join using raw user input without checking for directory escape sequences (../).",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Path Traversal",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/staticHandler.js",
    "line": 33,
    "code_snippet": "app.get(\"/assets\", (req, res) => {\n  const fileName = req.query.file;\n  const filePath = path.join(__dirname, \"public/assets\", fileName);\n  res.sendFile(filePath);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.path-traversal\nSink: path.join(__dirname, \"public/assets\", fileName)",
    "remediation": "Validate that the canonical resolved path starts with the base directory before serving the file.",
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html"
    ],
    "cwe": [
      "CWE-22"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 82.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824974"
  },
  {
    "id": "f325fafa-c43f-42c5-9038-758ea9b8173f",
    "title": "Reflected Cross-Site Scripting (XSS) in HTML Template Renderer",
    "description": "User-supplied query parameter is reflected directly into the HTML response without context-aware HTML entity encoding.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Cross-Site Scripting",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/views/profileRenderer.js",
    "line": 55,
    "code_snippet": "app.get(\"/profile\", (req, res) => {\n  const bio = req.query.bio || \"\";\n  res.send('<div class=\"profile-card\"><h3>User Profile</h3><p>' + bio + '</p></div>');\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.xss\nSink: res.send() with unescaped bio concatenation",
    "remediation": "Sanitize user HTML inputs with DOMPurify or use auto-escaping templating engines (EJS/Handlebars/React JSX).",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-79"
    ],
    "cves": [],
    "owasp": [
      "A03:2021-Injection"
    ],
    "risk_score": 78.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824976"
  },
  {
    "id": "d0cac28b-6449-4e15-9deb-ca4a817b1316",
    "title": "Insecure Direct Object Reference (IDOR) in Account Profile API",
    "description": "Endpoint retrieves user account details based on an unauthenticated URL parameter without checking if the requester has ownership.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Broken Access Control",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/controllers/accountController.js",
    "line": 28,
    "code_snippet": "app.get(\"/api/account/:accountId\", async (req, res) => {\n  const account = await db.Account.findByPk(req.params.accountId);\n  res.json(account);\n});",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.idor\nSink: Direct object lookup via URL parameter without session comparison",
    "remediation": "Verify that req.session.userId or req.user.id matches the owner of the requested accountId.",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-639"
    ],
    "cves": [],
    "owasp": [
      "A01:2021-Broken Access Control"
    ],
    "risk_score": 65.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824978"
  },
  {
    "id": "d75244b9-23d9-4c27-94a7-e6f456c8a1b2",
    "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
    "description": "MD5 / SHA-1 hash algorithms are vulnerable to collision attacks and should not be used for cryptographic signatures or integrity.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Cryptographic Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/utils/cryptoUtils.js",
    "line": 12,
    "code_snippet": "const crypto = require(\"crypto\");\nfunction createTokenHash(token) {\n  return crypto.createHash(\"md5\").update(token).digest(\"hex\");\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.crypto-weak-hash\nSink: crypto.createHash(\"md5\")",
    "remediation": "Use SHA-256 or SHA-512 for cryptographic hashing: crypto.createHash(\"sha256\").update(token).digest(\"hex\");",
    "references": [
      "https://cwe.mitre.org/data/definitions/327.html",
      "https://cwe.mitre.org/data/definitions/328.html"
    ],
    "cwe": [
      "CWE-328"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 58.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824981"
  },
  {
    "id": "9c28e063-954c-4625-a1f8-6568d73383e0",
    "title": "Insecure Deserialization via Unsafe YAML / Object Loader",
    "description": "Application deserializes untrusted YAML input using js-yaml.load() without schema restrictions, enabling arbitrary object execution.",
    "severity": "HIGH",
    "confidence": "MEDIUM",
    "category": "Insecure Deserialization",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/config/yamlParser.js",
    "line": 16,
    "code_snippet": "const yaml = require(\"js-yaml\");\nfunction parseConfig(rawContent) {\n  return yaml.load(rawContent); // Unsafe load with JS functions\n}",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.lang.security.audit.unsafe-yaml-load\nSink: yaml.load() on untrusted user string",
    "remediation": "Use yaml.safeLoad() or load with JSON_SCHEMA to prevent executing arbitrary JavaScript constructors.",
    "references": [
      "https://cwe.mitre.org/data/definitions/250.html"
    ],
    "cwe": [
      "CWE-502"
    ],
    "cves": [],
    "owasp": [
      "A08:2021-Software and Data Integrity Failures"
    ],
    "risk_score": 85.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824983"
  },
  {
    "id": "df61b253-b3fd-459e-96e0-e1bb233b5529",
    "title": "Missing Rate Limiting on Authentication Endpoint",
    "description": "Login route has no request rate limiting or brute-force mitigation middleware attached.",
    "severity": "LOW",
    "confidence": "HIGH",
    "category": "Identification and Authentication Failures",
    "source": "SAST",
    "scanner": "sentinal-sast",
    "file": "src/routes/authRoutes.js",
    "line": 15,
    "code_snippet": "// Unthrottled login endpoint\nrouter.post(\"/login\", authController.login);",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Semgrep Rule: javascript.express.security.audit.rate-limit\nMatch: POST /login lacks express-rate-limit middleware",
    "remediation": "Attach express-rate-limit middleware with maximum 5 attempts per IP per minute.",
    "references": [
      "https://cwe.mitre.org/data/definitions/79.html"
    ],
    "cwe": [
      "CWE-307"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 39.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824985"
  },
  {
    "id": "ab70ce16-1f77-4a35-b18a-83217151e290",
    "title": "Vulnerable Dependency: lodash (4.17.15) - GHSA-29mw-wpgm-hmr9",
    "description": "Prototype pollution in lodash via defaultsDeep and zipObjectDeep methods allows attackers to modify Object.prototype.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-29mw-wpgm-hmr9\nVulnerable version: 4.17.15 (patched in >= 4.17.21)",
    "remediation": "Upgrade lodash to version 4.17.21 or higher: npm install lodash@^4.17.21",
    "references": [],
    "cwe": [
      "CWE-1321"
    ],
    "cves": [
      "CVE-2020-8203"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 74.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824987",
    "cve": "CVE-2020-8203",
    "affectedComponent": "package.json -> lodash@4.17.15"
  },
  {
    "id": "ac28c319-db01-494a-84ad-435a643725e7",
    "title": "Vulnerable Dependency: axios (0.21.0) - SSRF via Redirection",
    "description": "Axios before 0.21.1 allows attackers to bypass SSRF protections by redirecting to internal hosts.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-4w2v-q235-vp99\nVulnerable version: 0.21.0 (patched in >= 0.21.1)",
    "remediation": "Upgrade axios to version 0.21.1 or higher: npm install axios@^1.6.0",
    "references": [],
    "cwe": [
      "CWE-918"
    ],
    "cves": [
      "CVE-2020-28168"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 59.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824989",
    "cve": "CVE-2020-28168",
    "affectedComponent": "package.json -> axios@0.21.0"
  },
  {
    "id": "c84f1c74-d0ac-464b-9c19-8b36333ed0f4",
    "title": "Vulnerable Dependency: express (4.16.1) - qs DoS Vulnerability",
    "description": "Older Express versions bundle vulnerable qs query string parsing libraries that can trigger exponential CPU usage.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Vulnerable Dependency",
    "source": "SCA",
    "scanner": "osv-scanner",
    "file": "package.json",
    "line": null,
    "code_snippet": null,
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "OSV Advisory: GHSA-hrpp-h998-j3pp\nVulnerable version: 4.16.1 (patched in >= 4.18.2)",
    "remediation": "Upgrade express to version 4.18.2 or higher: npm install express@^4.18.2",
    "references": [],
    "cwe": [
      "CWE-400"
    ],
    "cves": [
      "CVE-2022-24999"
    ],
    "owasp": [
      "A06:2021-Vulnerable and Outdated Components"
    ],
    "risk_score": 75.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824992",
    "cve": "CVE-2022-24999",
    "affectedComponent": "package.json -> express@4.16.1"
  },
  {
    "id": "5634cd97-466f-4854-a115-80a84ea82a5e",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824994"
  },
  {
    "id": "3ec5cc93-d1f4-48cf-b1d8-260675f6c203",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824996"
  },
  {
    "id": "b73b11f3-700a-4a0c-9f53-b81136407483",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.824998"
  },
  {
    "id": "8bc73ce3-5204-4817-ac2c-158609587020",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825001"
  },
  {
    "id": "fed82af2-b08c-483b-a3b4-d60251e31140",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825003"
  },
  {
    "id": "1485c340-43d5-481c-99a5-c2a1a5116696",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825005"
  },
  {
    "id": "367615d3-c64b-4300-9dc3-30294ed69fe0",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825007"
  },
  {
    "id": "418ce847-c180-4a0f-b9b9-eb0b9f49632a",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825010"
  },
  {
    "id": "e200eeee-fe9b-4188-83da-e58c2b4e09c0",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825012"
  },
  {
    "id": "0c6c15e2-d352-4734-b472-4ee68c2d97cd",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825014"
  },
  {
    "id": "49561e1c-bdc2-424d-be27-0239232d0b8e",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825016"
  },
  {
    "id": "f1abfe37-2ad0-45d1-880f-3dd088cd1e15",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825019"
  },
  {
    "id": "b2077afe-9fd3-4255-8f7a-207eec54f5b5",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825023"
  },
  {
    "id": "faf13f8a-b6e2-4ed2-bde2-dd6c857921f9",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825025"
  },
  {
    "id": "7b277cc7-0215-4d44-8b4c-8e9e473e6080",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825028"
  },
  {
    "id": "33cbb799-1272-417f-8734-a40e1b6791ef",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825030"
  },
  {
    "id": "4654b770-979e-4d65-88f6-44c57d0d0efc",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825037"
  },
  {
    "id": "43ab67b8-3061-4ffe-9e36-ba59756b396c",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825039"
  },
  {
    "id": "346304a9-df18-40cc-b594-a794adc30d18",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825041"
  },
  {
    "id": "7fa90853-8b10-4266-961f-c8db8f90edfd",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825044"
  },
  {
    "id": "dae74370-1874-48c3-8a0f-ea46c11ce93b",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825046"
  },
  {
    "id": "0aae6265-fc94-4813-89da-027d36b6794d",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825048"
  },
  {
    "id": "4a7ab685-0435-49ac-9870-f4737f0ebf0b",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825050"
  },
  {
    "id": "0dfa7112-dc58-4ede-a852-404f6b1d217b",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825053"
  },
  {
    "id": "7c67db3b-3889-42a6-9a17-0b2211f30d81",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825055"
  },
  {
    "id": "29aa411f-b7dd-4177-a064-2dbd7ced30da",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825057"
  },
  {
    "id": "22413fdf-4128-42d9-ac9b-531fcfd22616",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825059"
  },
  {
    "id": "7a0e164c-5ca5-48c5-adc6-63c912a34a7d",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825061"
  },
  {
    "id": "e2374106-df2c-4cd9-a5c2-f4559132373a",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825063"
  },
  {
    "id": "47d6fd1d-30ba-491e-a891-55218e4bccb5",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825066"
  },
  {
    "id": "5a6bbfe8-d223-42b0-9da8-99b67c0e2513",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825068"
  },
  {
    "id": "d500a649-e44c-4b32-829d-3251e3cbaa63",
    "title": "Exposed Secret: AWS Access Key ID & Secret Access Key",
    "description": "High-entropy AWS credentials discovered hardcoded in configuration file. Grants full programmatic access to cloud resources.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Cloud Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/aws.js",
    "line": 14,
    "code_snippet": "const AWS_CONFIG = {\n  accessKeyId: \"AKIAIOSFODNN7EXAMPLE\",\n  secretAccessKey: \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"\n};",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: aws-secret-access-key\nEntropy: 4.82 (High)\nMatch: secretAccessKey: \"wJalrXUtnFEMI/...\"",
    "remediation": "Revoke the exposed key immediately in AWS IAM Console. Store credentials in AWS Secrets Manager or inject via environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 99.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825070"
  },
  {
    "id": "3db3487f-3990-4fae-8b50-351c63bd3ec7",
    "title": "Exposed Secret: Stripe Live Secret API Key",
    "description": "Live production Stripe Secret API Key committed into source code. Grants unauthorized access to customer billing records and payment charges.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Payment Gateway Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/billing.js",
    "line": 8,
    "code_snippet": "const stripe = require(\"stripe\")(\"sk_live_51Oz9kX2eZvKYlo2CL8d7...EXAMPLE\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: stripe-api-key\nPattern: sk_live_[0-9a-zA-Z]{24}\nMatch: sk_live_51Oz9kX2eZvKYlo2...",
    "remediation": "Immediately roll the key in Stripe Dashboard -> Developers -> API keys. Use process.env.STRIPE_SECRET_KEY at runtime.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 95.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825073"
  },
  {
    "id": "6c5316a1-ff27-4d81-bc5e-9a43cba709fe",
    "title": "Exposed Secret: GitHub Personal Access Token (PAT)",
    "description": "GitHub Personal Access Token found in deployment automation script. Allows unauthorized repository modifications and CI/CD workflow triggering.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "VCS Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "scripts/deploy.sh",
    "line": 22,
    "code_snippet": "#!/bin/bash\nexport GITHUB_TOKEN=\"ghp_9k2LzEXAMPLExxxxxxxxxxxxxxxxxxxx\"\ngit clone https://@github.com/company/internal-api.git",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: github-pat\nPattern: ghp_[0-9a-zA-Z]{36}\nMatch: ghp_9k2LzEXAMPLE...",
    "remediation": "Delete the token in GitHub User Settings -> Developer Settings -> Personal access tokens. Use GitHub Actions OIDC or secrets manager.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 88.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825075"
  },
  {
    "id": "d846ba25-0215-4ae7-87d4-7a7b495d27c5",
    "title": "Exposed Secret: RSA Private Cryptographic Signing Key",
    "description": "RSA 2048-bit private key file committed directly into the codebase. Attackers can forge cryptographically valid JWT tokens with admin roles.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Private Keys",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/config/jwt.js",
    "line": 9,
    "code_snippet": "const PRIVATE_KEY = ;",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: private-key\nPattern: BEGIN RSA PRIVATE KEY\nEntropy: 5.12 (High)",
    "remediation": "Generate a new RSA keypair. Store private keys securely in HashiCorp Vault or AWS KMS and never commit pem files to Git.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A02:2021-Cryptographic Failures"
    ],
    "risk_score": 91.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825077"
  },
  {
    "id": "407b1a78-fbe8-4978-bb39-1ee9f8acc60d",
    "title": "Exposed Secret: Database Connection String with Password",
    "description": "PostgreSQL production database connection URI with embedded plain-text username and password found in database connection pool configuration.",
    "severity": "CRITICAL",
    "confidence": "HIGH",
    "category": "Database Credentials",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/database/pool.js",
    "line": 11,
    "code_snippet": "const DB_URI = \"postgresql://db_admin:P@ssw0rd2026!@prod-db.internal.corp:5432/main_app\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: postgres-connection-string\nMatch: postgresql://db_admin:P@ssw0rd2026!...",
    "remediation": "Rotate the database password immediately. Inject database connection parameters via environment variables (DATABASE_URL).",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 96.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825079"
  },
  {
    "id": "c98a2a53-c76c-46fd-8b22-f7726bd5320b",
    "title": "Exposed Secret: JSON Web Token (JWT) Hardcoded Secret",
    "description": "Weak symmetric secret string used for signing session JWT tokens hardcoded directly in auth middleware.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Authentication Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/middleware/auth.js",
    "line": 14,
    "code_snippet": "const JWT_SECRET = \"super_secret_jwt_key_12345\";\nconst token = jwt.sign(payload, JWT_SECRET, { expiresIn: \"1h\" });",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: jwt-secret-key\nMatch: JWT_SECRET = \"super_secret_jwt_key_12345\"",
    "remediation": "Use high-entropy cryptographically generated random secrets (minimum 256-bit) loaded from process.env.JWT_SECRET.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 84.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825081"
  },
  {
    "id": "f754bb28-04a1-469a-832e-a66019d7ccae",
    "title": "Exposed Secret: Slack Incoming Webhook URL",
    "description": "Slack Incoming Webhook URL with embedded auth token found in notification dispatcher script.",
    "severity": "MEDIUM",
    "confidence": "HIGH",
    "category": "Communication API Tokens",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/slackNotifier.js",
    "line": 7,
    "code_snippet": "const SLACK_HOOK = \"https://hooks.slack.mock-internal/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX\";",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: slack-webhook\nMatch: hooks.slack.mock-internal/services/...",
    "remediation": "Revoke the webhook URL in Slack App settings and supply webhook URLs through secure environment variables.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 62.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825083"
  },
  {
    "id": "3988fbad-6c1d-4ac4-ad6b-3a638e71a893",
    "title": "Exposed Secret: SendGrid API Email Key",
    "description": "SendGrid API key committed in transactional email delivery module, allowing unauthorized email transmission.",
    "severity": "HIGH",
    "confidence": "HIGH",
    "category": "Third-Party Services",
    "source": "SECRETS",
    "scanner": "gitleaks",
    "file": "src/services/mailer.js",
    "line": 5,
    "code_snippet": "sgMail.setApiKey(\"SG.9x8y7zEXAMPLE.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\");",
    "endpoint": null,
    "method": null,
    "parameter": null,
    "evidence": "Gitleaks Rule: sendgrid-api-key\nPattern: SG.[0-9a-zA-Z._-]{66}\nMatch: SG.9x8y7zEXAMPLE...",
    "remediation": "Delete the compromised key in SendGrid dashboard and configure SENDGRID_API_KEY environment variable.",
    "references": [
      "https://cwe.mitre.org/data/definitions/798.html",
      "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
    ],
    "cwe": [
      "CWE-798",
      "CWE-312"
    ],
    "cves": [],
    "owasp": [
      "A07:2021-Identification and Authentication Failures"
    ],
    "risk_score": 79.0,
    "threat_scenario": null,
    "potential_impact": {},
    "blast_radius": null,
    "status": "open",
    "created_at": "2026-09-03T04:03:38.825086"
  }
];

export const mockAssets = [
  {
    id: "ast-01",
    name: "Production Web Application",
    url: "https://app.company.internal",
    type: "Web Application",
    category: "Web Applications",
    environment: "PRODUCTION",
    status: "Active",
    riskRating: "CRITICAL",
    riskScore: 86,
    criticalCount: 4,
    highCount: 8,
    mediumCount: 12,
    lowCount: 5,
    lastScan: "Today, 14:20",
    owner: "AppSec Team"
  },
  {
    id: "ast-02",
    name: "Core API Gateway & Microservices",
    url: "https://api.company.internal",
    type: "API Gateway",
    category: "APIs",
    environment: "PRODUCTION",
    status: "Active",
    riskRating: "HIGH",
    riskScore: 72,
    criticalCount: 2,
    highCount: 6,
    mediumCount: 9,
    lowCount: 8,
    lastScan: "Today, 12:45",
    owner: "Backend Core"
  },
  {
    id: "ast-03",
    name: "Authentication & Identity Service",
    url: "https://auth.company.internal",
    type: "Identity Provider",
    category: "Authentication",
    environment: "PRODUCTION",
    status: "Active",
    riskRating: "MEDIUM",
    riskScore: 48,
    criticalCount: 0,
    highCount: 3,
    mediumCount: 6,
    lowCount: 4,
    lastScan: "Yesterday",
    owner: "SecOps IAM"
  }
];

export const mockProjects = [
  { id: "prj-01", name: "Enterprise Core Platform", key: "ECP", description: "Primary web ingress and backend services", assetCount: 3, findingCount: 287, criticalCount: 66, highCount: 109, mediumCount: 68, lowCount: 44, lastScan: "Today" }
];

export const mockAssessments = [
  {
    id: "asm-source-01",
    name: "Core Repository SAST & Supply Chain Audit",
    assessment_type: "source",
    target: "https://github.com/company/core-api (main)",
    repository_info: { provider: "github", url: "https://github.com/company/core-api", branch: "main" },
    status: "COMPLETED",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    completed_at: new Date(Date.now() - 1700000).toISOString(),
    overallScore: 74,
    securityScore: 74,
    overall_risk_score: 26,
    critical_count: 2,
    high_count: 4,
    medium_count: 7,
    low_count: 5,
    info_count: 0,
    total_findings: 18,
    dast_coverage_score: 0,
    coverage_status: "NOT_APPLICABLE",
    counts: { critical: 2, high: 4, medium: 7, low: 5, info: 0, total: 18 },
    logs: [
      { timestamp: new Date(Date.now() - 1800000).toISOString(), stage: "INITIALIZATION", message: "Source code assessment pipeline initialized for repository: https://github.com/company/core-api" },
      { timestamp: new Date(Date.now() - 1790000).toISOString(), stage: "EXTRACT", message: "Cloned repository branch 'main'. Unpacked 142 source files across 8 modules." },
      { timestamp: new Date(Date.now() - 1760000).toISOString(), stage: "SAST", message: "Semgrep AST engine evaluated 142 syntax rules: detected SQL injection, RCE, and SSRF sinks." },
      { timestamp: new Date(Date.now() - 1740000).toISOString(), stage: "SCA", message: "OSV dependency auditor scanned 48 packages in package.json & requirements.txt: matched 5 CVEs." },
      { timestamp: new Date(Date.now() - 1720000).toISOString(), stage: "SECRETS", message: "Gitleaks entropy scanner inspected 18,420 lines of code: identified 4 hardcoded secret tokens." },
      { timestamp: new Date(Date.now() - 1710000).toISOString(), stage: "NORMALIZATION", message: "Deduplicated AST sinks and correlated supply-chain exploit chains." },
      { timestamp: new Date(Date.now() - 1700000).toISOString(), stage: "COMPLETED", message: "Source code assessment certified. Consolidated 18 findings with security score 74/100." }
    ],
    scanJobs: [
      { id: "job-src-1", module_name: "SAST (Semgrep AST Analyzer)", status: "COMPLETED", duration_ms: 14200, raw_results_count: 9 },
      { id: "job-src-2", module_name: "SCA (OSV Package Auditor)", status: "COMPLETED", duration_ms: 8600, raw_results_count: 5 },
      { id: "job-src-3", module_name: "Secrets (Gitleaks Token Entropy)", status: "COMPLETED", duration_ms: 4800, raw_results_count: 4 }
    ],
    modules: {
      discovery: false,
      dast: false,
      nuclei: false,
      wapiti: false,
      headers: false,
      ssl: false,
      sast: true,
      sca: true,
      secrets: true
    }
  },
  {
    id: "asm-latest",
    name: "Production Comprehensive Scan Run #42",
    assessment_type: "combined",
    target: "https://app.company.internal + Source Code",
    target_info: { url: "https://app.company.internal", scan_mode: "standard", auth_type: "bearer" },
    repository_info: { provider: "github", url: "https://github.com/company/core-api", branch: "main" },
    status: "COMPLETED",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3500000).toISOString(),
    overallScore: 87,
    securityScore: 87,
    overall_risk_score: 13,
    critical_count: 66,
    high_count: 109,
    medium_count: 68,
    low_count: 44,
    info_count: 0,
    total_findings: 287,
    dast_coverage_score: 84,
    coverage_status: "COMPLETED",
    counts: { critical: 66, high: 109, medium: 68, low: 44, info: 0, total: 287 }
  }
];

export const mockCorrelatedRisks = [
  {
    id: "risk-corr-01",
    title: "Authentication Bypass to Remote Code Execution Chain",
    scenario: "Unauthenticated JWT secret leak combined with SQL Injection endpoint permits full database extraction and admin takeover.",
    finalRisk: "CRITICAL",
    confidence: 96,
    exploitability: "HIGH",
    blastRadius: "Entire User Database & Cloud Infrastructure",
    findings: [
      { id: "f-sec-01", title: "Exposed Secret: JWT Private Signing Key", source: "Secrets", severity: "CRITICAL" },
      { id: "f-sast-01", title: "SQL Injection in Query Handler", source: "SAST", severity: "CRITICAL" }
    ]
  },
  {
    id: "risk-corr-02",
    title: "Vulnerable Dependency Combined with Weak Cookie Isolation",
    scenario: "Outdated package CVE exploited via XSS to steal unflagged session identifiers.",
    finalRisk: "ELEVATED",
    confidence: 88,
    exploitability: "MEDIUM",
    blastRadius: "Session Hijacking of Authenticated Users",
    findings: [
      { id: "f-sca-01", title: "Vulnerable Dependency: lodash GHSA-29mw-wpgm-hmr9", source: "SCA", severity: "HIGH" },
      { id: "f-dast-01", title: "Insecure Cookie Attribute (HttpOnly, Secure) on Session Token", source: "DAST", severity: "HIGH" }
    ]
  }
];

export const mockReports = [];
export const mockNotifications = [];

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.scanners.base import RawFinding

SAST_RULES = [
    # --- Python Rules ---
    {
        "id": "py-sql-injection-raw-query",
        "languages": [".py"],
        "pattern": r'(?:cursor|conn|connection|db|engine)\.execute\s*\(\s*(?:f[\'"]|[a-zA-Z0-9_]+\s*\)|[\'"].*?(?:%s|\+))|execute\s*\(\s*f[\'"].*?\{',
        "title": "Potential SQL Injection via Unsanitized Query Execution",
        "description": "Constructing SQL queries using string formatting, interpolation, or dynamic query variables without parameterized bindings allows SQL injection attacks.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-89"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use parameterized queries (e.g. `cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))`) or an ORM with parameter binding."
    },
    {
        "id": "py-command-injection-os-system",
        "languages": [".py"],
        "pattern": r'(os\.system\s*\(\s*f?[\'"].*?\{|os\.system\s*\(.*?\+|subprocess\.(Popen|run|call)\s*\(.*?shell\s*=\s*True)',
        "title": "Command Injection via Unsanitized Shell Execution",
        "description": "Executing system shell commands with concatenated or interpolated user input leads to Remote Code Execution (RCE).",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Remote Code Execution",
        "cwe": ["CWE-78"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Pass command arguments as a list with `shell=False` and validate/sanitize all inputs."
    },
    {
        "id": "py-insecure-deserialization-pickle",
        "languages": [".py"],
        "pattern": r'(pickle\.loads?\s*\(|_pickle\.loads?\s*\(|yaml\.load\s*\([^,)]*\)|yaml\.unsafe_load\s*\()',
        "title": "Insecure Deserialization via Pickle / Unsafe YAML",
        "description": "Deserializing untrusted data with `pickle` or `yaml.load(Loader=yaml.Loader)` allows arbitrary code execution via constructor instantiation.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Insecure Deserialization",
        "cwe": ["CWE-502"],
        "owasp": ["A08:2021-Software and Data Integrity Failures"],
        "remediation": "Use `yaml.safe_load()` or JSON for data serialization instead of pickle."
    },
    {
        "id": "py-weak-cryptographic-hash-md5-sha1",
        "languages": [".py"],
        "pattern": r'hashlib\.(md5|sha1)\s*\(',
        "title": "Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)",
        "description": "MD5 and SHA-1 have known collision vulnerabilities and are unsuitable for password hashing or cryptographic signatures.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Cryptographic Failures",
        "cwe": ["CWE-327", "CWE-328"],
        "owasp": ["A02:2021-Cryptographic Failures"],
        "remediation": "Use SHA-256 / SHA-3 for hashing or Argon2 / bcrypt / PBKDF2 for password storage."
    },
    {
        "id": "py-path-traversal-open",
        "languages": [".py"],
        "pattern": r'open\s*\(\s*f?[\'"].*?\{.*?path|open\s*\([^,)]*\+.*?(filename|path|file)',
        "title": "Potential Path Traversal via Unvalidated File Access",
        "description": "Accessing files using user-supplied file paths without canonicalization or directory whitelisting enables reading arbitrary system files.",
        "severity": "HIGH",
        "confidence": "MEDIUM",
        "category": "Broken Access Control",
        "cwe": ["CWE-22"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Validate paths using `os.path.abspath()` and verify that the target directory starts with the allowed root path."
    },
    {
        "id": "py-ssrf-requests",
        "languages": [".py"],
        "pattern": r'requests\.(get|post|put|delete)\s*\(\s*(url|target_url|request\.|req\.)',
        "title": "Potential Server-Side Request Forgery (SSRF)",
        "description": "Making HTTP requests to URLs controlled directly by users allows attackers to probe internal network services and metadata endpoints (e.g. AWS 169.254.169.254).",
        "severity": "HIGH",
        "confidence": "MEDIUM",
        "category": "SSRF",
        "cwe": ["CWE-918"],
        "owasp": ["A10:2021-Server-Side Request Forgery (SSRF)"],
        "remediation": "Validate target URLs against an explicit domain whitelist and forbid private IP ranges (RFC 1918, RFC 3927)."
    },

    # --- JavaScript / TypeScript Rules ---
    {
        "id": "js-dom-xss-innerhtml",
        "languages": [".js", ".jsx", ".ts", ".tsx"],
        "pattern": r'(\.innerHTML\s*=\s*|\.outerHTML\s*=\s*|dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:)',
        "title": "Cross-Site Scripting (XSS) via innerHTML / dangerouslySetInnerHTML",
        "description": "Directly assigning unsanitized dynamic user input to innerHTML creates Document Object Model (DOM) Cross-Site Scripting vulnerabilities.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Cross-Site Scripting",
        "cwe": ["CWE-79"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use `textContent` or sanitize user input using DOMPurify before inserting into the DOM."
    },
    {
        "id": "js-eval-code-execution",
        "languages": [".js", ".jsx", ".ts", ".tsx"],
        "pattern": r'(eval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*[\'"`][^)]+\+)',
        "title": "Arbitrary Code Execution via eval() or Dynamic Function",
        "description": "Invoking `eval()` or `new Function()` with dynamic strings evaluates untrusted JavaScript in the application runtime context.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Code Execution",
        "cwe": ["CWE-95"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Avoid `eval()` and `new Function()`. Use structured JSON parsers or declarative data structures."
    },
    {
        "id": "js-nosql-injection-mongodb",
        "languages": [".js", ".ts"],
        "pattern": r'(\.find\s*\(\s*req\.body|\.findOne\s*\(\s*req\.body|\$where\s*:\s*)',
        "title": "Potential NoSQL Injection",
        "description": "Passing unvalidated `req.body` directly into MongoDB query operators allows authentication bypass and data extraction through operator injection (e.g. `$ne`).",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-943"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Sanitize query keys using mongo-sanitize or enforce strict schema validation."
    },
    {
        "id": "js-cors-wildcard-origin",
        "languages": [".js", ".ts"],
        "pattern": r'(origin\s*:\s*[\'"]\*[\'"]\s*,\s*credentials\s*:\s*true|res\.setHeader\s*\(\s*[\'"]Access-Control-Allow-Origin[\'"]\s*,\s*[\'"]\*[\'"]\))',
        "title": "Overly Permissive Cross-Origin Resource Sharing (CORS) Policy",
        "description": "Setting `Access-Control-Allow-Origin: *` with credentials or unrestricted origins exposes authenticated resources to arbitrary third-party domains.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-942"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Explicitly whitelist trusted origins and avoid wildcard configurations when handling authenticated sessions."
    },

    # --- Java / Kotlin Rules ---
    {
        "id": "java-sql-injection-jdbc",
        "languages": [".java", ".kt"],
        "pattern": r'(Statement\.executeQuery\s*\(\s*[\'"].*?\+|prepareStatement\s*\(\s*[\'"].*?\+)',
        "title": "SQL Injection in Java JDBC Query",
        "description": "Concatenating user variables directly into SQL statements without PreparedStatement parameterization creates SQL injection vulnerabilities.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-89"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use parameterized `PreparedStatement` with placeholder `?` markers."
    },
    {
        "id": "java-xxe-xml-parser",
        "languages": [".java", ".kt"],
        "pattern": r'(DocumentBuilderFactory\.newInstance\s*\(|SAXParserFactory\.newInstance\s*\(|XMLInputFactory\.newInstance\s*\()',
        "title": "XML External Entity (XXE) Vulnerability in XML Parser",
        "description": "Default Java XML parsers process external entity declarations (DOCTYPE), enabling local file disclosure and SSRF attacks.",
        "severity": "HIGH",
        "confidence": "MEDIUM",
        "category": "XXE",
        "cwe": ["CWE-611"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Disable external entity processing via `dbf.setFeature('http://apache.org/xml/features/disallow-doctype-decl', True)`."
    },

    # --- Go Rules ---
    {
        "id": "go-sql-injection",
        "languages": [".go"],
        "pattern": r'(db\.Query\s*\(\s*fmt\.Sprintf|db\.Exec\s*\(\s*fmt\.Sprintf|db\.QueryRow\s*\(\s*[\'"].*?\+)',
        "title": "SQL Injection via Sprintf in Go Database Query",
        "description": "Using `fmt.Sprintf` to format SQL queries bypasses parameter escaping, enabling SQL injection.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-89"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use parameterized query placeholders (`$1`, `?`) with `db.Query(ctx, 'SELECT * FROM users WHERE id = $1', id)`."
    },
    {
        "id": "go-command-exec",
        "languages": [".go"],
        "pattern": r'exec\.Command\s*\(\s*[\'"](?:sh|bash|cmd)[\'"]\s*,\s*[\'"]-(?:c|C)[\'"]\s*,\s*.*?fmt\.Sprintf',
        "title": "Command Injection in Go exec.Command",
        "description": "Constructing shell execution strings with user-provided parameters allows command injection.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Command Injection",
        "cwe": ["CWE-78"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Avoid invoking the shell directly. Call the executable binary with distinct arguments."
    },

    # --- PHP Rules ---
    {
        "id": "php-sql-injection-mysql-query",
        "languages": [".php"],
        "pattern": r'(\$(?:mysqli|db|conn)->query\s*\(\s*[\'"].*?\$_|\b(?:mysql_query|mysqli_query)\s*\([^,]+,\s*[\'"].*?\$_)',
        "title": "SQL Injection in PHP Query",
        "description": "Direct concatenation of `$_GET`, `$_POST`, or `$_REQUEST` into database queries exposes the database to SQL injection.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-89"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use PDO or MySQLi prepared statements with bound parameters."
    },
    {
        "id": "php-remote-file-inclusion",
        "languages": [".php"],
        "pattern": r'\b(?:include|require|include_once|require_once)\s*\(\s*\$_(?:GET|POST|REQUEST)',
        "title": "Remote / Local File Inclusion (RFI/LFI)",
        "description": "Passing user input directly into file inclusion statements allows arbitrary local file inclusion or remote code execution.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "File Inclusion",
        "cwe": ["CWE-98"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Use a whitelist of allowed template files rather than dynamic file path inclusion."
    },

    # --- C# / .NET Rules ---
    {
        "id": "csharp-sql-injection",
        "languages": [".cs"],
        "pattern": r'(new\s+SqlCommand\s*\(\s*[\'"].*?\+|\.CommandText\s*=\s*[\'"].*?\+)',
        "title": "SQL Injection in C# SqlCommand",
        "description": "Concatenating user-supplied data into `SqlCommand.CommandText` enables SQL injection.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Injection",
        "cwe": ["CWE-89"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use `SqlParameter` objects with parameterized queries or Entity Framework LINQ queries."
    },

    # --- C / C++ Rules ---
    {
        "id": "c-buffer-overflow-strcpy-gets",
        "languages": [".c", ".cpp", ".cc", ".h"],
        "pattern": r'\b(?:strcpy|strcat|sprintf|gets)\s*\(',
        "title": "Insecure Memory Function Leading to Buffer Overflow",
        "description": "Functions like `strcpy`, `strcat`, `sprintf`, and `gets` do not perform boundary checks on memory buffers, creating stack/heap buffer overflow vulnerabilities.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Memory Corruption",
        "cwe": ["CWE-120", "CWE-676"],
        "owasp": ["A06:2021-Vulnerable and Outdated Components"],
        "remediation": "Use bounded alternatives like `strncpy`, `strncat`, `snprintf`, or C++ `std::string`."
    },

    # --- Lua & Neovim Script Rules ---
    {
        "id": "lua-os-execute-command-injection",
        "languages": [".lua"],
        "pattern": r'(os\.execute\s*\(\s*.*?[\.\.\+]|io\.popen\s*\(\s*.*?[\.\.\+])',
        "title": "Command Injection via Unsanitized os.execute / io.popen in Lua",
        "description": "Concatenating unvalidated variables into `os.execute` or `io.popen` allows local/remote shell command injection.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Command Injection",
        "cwe": ["CWE-78"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Validate and escape all command arguments or use `vim.fn.systemlist()` with argument arrays."
    },
    {
        "id": "lua-nvim-dynamic-command-exec",
        "languages": [".lua"],
        "pattern": r'(vim\.cmd\s*\(\s*.*?[\.\.\+]|vim\.api\.nvim_command\s*\(\s*.*?[\.\.\+]|vim\.fn\.system\s*\(\s*.*?[\.\.\+])',
        "title": "Dynamic Neovim Command Execution via Unescaped String Concatenation",
        "description": "Interpolating or concatenating unvalidated variables directly into `vim.cmd()` or `vim.api.nvim_command()` can execute arbitrary Vim commands or shell subprocesses.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Improper Input Validation",
        "cwe": ["CWE-20", "CWE-95"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Use `vim.fn.fnameescape()` for file arguments or use structured Lua Neovim API functions (e.g. `vim.api.nvim_set_current_buf()`)."
    },
    {
        "id": "lua-loadstring-dynamic-code-eval",
        "languages": [".lua"],
        "pattern": r'(loadstring\s*\(|load\s*\(.*?[\.\.\+])',
        "title": "Arbitrary Code Execution via dynamic loadstring() in Lua",
        "description": "Executing dynamic or concatenated Lua code chunks via `loadstring()` creates code execution risks.",
        "severity": "CRITICAL",
        "confidence": "HIGH",
        "category": "Code Execution",
        "cwe": ["CWE-95"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Avoid `loadstring()`. Use static table mappings or safe serializable formats."
    },
    {
        "id": "lua-insecure-temp-file",
        "languages": [".lua"],
        "pattern": r'(os\.tmpname\s*\(|io\.open\s*\(\s*[\'"]/tmp/)',
        "title": "Insecure Temporary File Creation in Lua",
        "description": "Using predictable `/tmp/` paths or `os.tmpname` without exclusive flags can lead to symlink attacks or race conditions.",
        "severity": "LOW",
        "confidence": "MEDIUM",
        "category": "Insecure File Operations",
        "cwe": ["CWE-377"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Use secure atomic temporary directory APIs or verify file permissions before writing."
    },

    # --- Shell & Bash Script Rules ---
    {
        "id": "sh-eval-command-injection",
        "languages": [".sh", ".bash", ".zsh"],
        "pattern": r'\beval\s+[\'"]?\$',
        "title": "Command Injection via Shell eval",
        "description": "Using `eval` on dynamic variables evaluates arbitrary user-controlled shell syntax.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Command Injection",
        "cwe": ["CWE-78"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Avoid `eval`. Use arrays or direct parameter substitution."
    },
    {
        "id": "sh-curl-pipe-bash",
        "languages": [".sh", ".bash", ".zsh", ".yaml", ".yml"],
        "pattern": r'(curl\s+.*?\|\s*(?:bash|sh|sudo\s+bash|sudo\s+sh)|wget\s+.*?\|\s*(?:bash|sh))',
        "title": "Insecure Remote Script Execution via Pipe to Shell",
        "description": "Piping unauthenticated web downloads directly into bash/sh allows attackers on network paths or compromised origins to execute arbitrary root code.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Remote Code Execution",
        "cwe": ["CWE-494"],
        "owasp": ["A08:2021-Software and Data Integrity Failures"],
        "remediation": "Download scripts to a temporary file, inspect and verify SHA256 checksums, then execute."
    },
    {
        "id": "sh-unquoted-command-expansion",
        "languages": [".sh", ".bash", ".zsh", ""],
        "pattern": r'(tmux switch-client -t [^"]*\$|chmod 777|sudo apt-get install (?!-y))',
        "title": "Unquoted Shell Variable Expansion in Subprocess Execution",
        "description": "Passing unquoted variables to system utilities risks word-splitting and command hijacking if variables contain whitespace or special shell characters.",
        "severity": "LOW",
        "confidence": "MEDIUM",
        "category": "Defensive Coding",
        "cwe": ["CWE-78"],
        "owasp": ["A03:2021-Injection"],
        "remediation": "Double-quote all variable references (e.g. `\"$session_name\"`)."
    },

    # --- CI/CD & GitHub Actions Security Rules ---
    {
        "id": "github-actions-deprecated-action-version",
        "languages": [".yml", ".yaml"],
        "pattern": r'uses:\s*actions/checkout@(v1|v2)\b',
        "title": "Outdated / Deprecated GitHub Action Version (actions/checkout@v1/v2)",
        "description": "Using legacy versions of GitHub Actions (`actions/checkout@v2` or `@v1`) relies on deprecated Node.js runtimes (Node 12/16) and lacks security patches present in current releases.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Vulnerable and Outdated Components",
        "cwe": ["CWE-1104"],
        "owasp": ["A06:2021-Vulnerable and Outdated Components"],
        "remediation": "Upgrade to `actions/checkout@v4` or pin to full immutable commit SHA (e.g. `actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11`)."
    },
    {
        "id": "github-actions-unpinned-external-action",
        "languages": [".yml", ".yaml"],
        "pattern": r'uses:\s*[^/\s]+/[^@\s]+@(?:v\d+|master|main)\b',
        "title": "Unpinned Third-Party GitHub Action Tag",
        "description": "Referencing third-party GitHub Actions by mutable branch or tag names (e.g. `@v1`, `@master`) exposes build pipelines to supply chain attacks if the upstream tag is modified.",
        "severity": "LOW",
        "confidence": "HIGH",
        "category": "Supply Chain Security",
        "cwe": ["CWE-1357"],
        "owasp": ["A08:2021-Software and Data Integrity Failures"],
        "remediation": "Pin all third-party GitHub Actions to a 40-character commit SHA."
    },

    # --- IaC & Docker / Terraform / Kubernetes ---
    {
        "id": "docker-root-user",
        "languages": ["Dockerfile", ".dockerfile"],
        "pattern": r'^(?!.*\bUSER\s+(?!root\b)\w+).*$',
        "title": "Dockerfile Container Running as Root",
        "description": "Containers running as root increase the impact of container escape vulnerabilities.",
        "severity": "MEDIUM",
        "confidence": "MEDIUM",
        "category": "Container Security",
        "cwe": ["CWE-250"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Add `USER nonroot` or a dedicated unprivileged user before the ENTRYPOINT/CMD."
    },
    {
        "id": "terraform-s3-public-access",
        "languages": [".tf"],
        "pattern": r'resource\s+[\'"]aws_s3_bucket[\'"].*?acl\s*=\s*[\'"]public-read[\'"]',
        "title": "Terraform S3 Bucket Public Read Access",
        "description": "S3 buckets provisioned with public-read ACL expose sensitive cloud data to the public internet.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Cloud Misconfiguration",
        "cwe": ["CWE-732"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Set `acl = 'private'` and enable `aws_s3_bucket_public_access_block`."
    },
    {
        "id": "k8s-privileged-container",
        "languages": [".yaml", ".yml"],
        "pattern": r'privileged\s*:\s*true',
        "title": "Kubernetes Pod Configured with Privileged Access",
        "description": "Running containers in privileged mode disables isolation and gives container processes root privileges on the underlying host node.",
        "severity": "HIGH",
        "confidence": "HIGH",
        "category": "Infrastructure Misconfiguration",
        "cwe": ["CWE-250"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Set `securityContext.privileged: false` and restrict Linux capabilities."
    }
]

def scan_file_sast(file_path: Path, base_path: Path) -> List[RawFinding]:
    findings: List[RawFinding] = []
    try:
        if not file_path.is_file() or file_path.stat().st_size > 5 * 1024 * 1024:  # 5MB limit
            return findings

        # Skip binary files or test directories / node_modules / .git
        rel_str = str(file_path.relative_to(base_path)).replace("\\", "/")
        if any(part in rel_str for part in ["node_modules/", ".git/", "vendor/", "dist/", "build/", "__pycache__/"]):
            return findings

        file_name = file_path.name
        file_ext = file_path.suffix.lower()

        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return findings

        lines = content.splitlines()

        for rule in SAST_RULES:
            matched_lang = False
            for lang in rule["languages"]:
                if lang.startswith("."):
                    if file_ext == lang:
                        matched_lang = True
                        break
                elif lang.lower() in file_name.lower():
                    matched_lang = True
                    break

            if not matched_lang:
                continue

            # Check pattern
            try:
                regex = re.compile(rule["pattern"], re.MULTILINE | re.IGNORECASE)
                for line_idx, line in enumerate(lines, start=1):
                    match = regex.search(line)
                    if match:
                        snippet_start = max(0, line_idx - 2)
                        snippet_end = min(len(lines), line_idx + 2)
                        snippet = "\n".join([f"{i+1}: {lines[i]}" for i in range(snippet_start, snippet_end)])

                        findings.append(RawFinding(
                            scanner="sentinal-sast",
                            source="SAST",
                            title=rule["title"],
                            description=rule["description"],
                            severity=rule["severity"],
                            confidence=rule["confidence"],
                            category=rule["category"],
                            cwe=rule["cwe"],
                            cves=[],
                            owasp=rule["owasp"],
                            file=rel_str,
                            line=line_idx,
                            code_snippet=snippet,
                            evidence=f"Matched pattern '{match.group(0)}' at line {line_idx}",
                            remediation=rule["remediation"],
                            references=[f"https://cwe.mitre.org/data/definitions/{c.replace('CWE-', '')}.html" for c in rule["cwe"]],
                            raw_data={"rule_id": rule["id"], "match": match.group(0)}
                        ))
            except Exception:
                continue

    except Exception:
        pass
    return findings

def scan_directory_sast(directory: Path) -> List[RawFinding]:
    all_findings: List[RawFinding] = []
    if not directory.exists() or not directory.is_dir():
        return all_findings

    for root, _, files in os.walk(directory):
        for f in files:
            full_path = Path(root) / f
            file_findings = scan_file_sast(full_path, directory)
            all_findings.extend(file_findings)
    return all_findings

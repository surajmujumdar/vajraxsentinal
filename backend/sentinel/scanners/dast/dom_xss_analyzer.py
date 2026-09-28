import re
import urllib.parse
from typing import List, Dict, Any, Tuple, Optional
from bs4 import BeautifulSoup
from sentinel.scanners.base import RawFinding

DOM_SOURCES = [
    (r'(?:window\.|document\.)?location\.hash(?:\.substring|\.slice|\.substr|\.replace)?', 'location.hash (URL Fragment/Hash)', 'hash'),
    (r'(?:window\.|document\.)?location\.search', 'location.search (Query String)', 'search'),
    (r'(?:window\.|document\.)?location\.href', 'location.href (Full URL)', 'href'),
    (r'(?:window\.|document\.)?location\.pathname', 'location.pathname (URL Path)', 'pathname'),
    (r'document\.(?:URL|documentURI|URLUnencoded|baseURI)', 'document.URL', 'url'),
    (r'document\.referrer', 'document.referrer', 'referrer'),
    (r'document\.cookie', 'document.cookie', 'cookie'),
    (r'window\.name', 'window.name', 'name'),
    (r'(?:localStorage|sessionStorage)(?:\.getItem)?', 'Web Storage (localStorage/sessionStorage)', 'storage'),
    (r'new\s+URLSearchParams\s*\(', 'URLSearchParams', 'search_params'),
]

DOM_SINKS = [
    # Direct HTML DOM Execution Sinks (HIGH / CRITICAL)
    (
        r'(\b[\w$.]+(?:\.[\w$.]+)*\.innerHTML\s*=)',
        'innerHTML',
        'HTML DOM Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        'Direct assignment to `.innerHTML` without HTML entity encoding or DOMPurify sanitization allows arbitrary script injection.'
    ),
    (
        r'(\b[\w$.]+(?:\.[\w$.]+)*\.outerHTML\s*=)',
        'outerHTML',
        'HTML DOM Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        'Direct assignment to `.outerHTML` replaces the element with unsanitized HTML markup.'
    ),
    (
        r'(document\.write(?:ln)?\s*\()',
        'document.write',
        'HTML Document Write Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        'Using `document.write()` with user-controlled input allows attackers to inject malicious HTML and execute arbitrary JavaScript.'
    ),
    (
        r'(\b[\w$.]+(?:\.[\w$.]+)*\.insertAdjacentHTML\s*\()',
        'insertAdjacentHTML',
        'HTML Insertion Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        '`insertAdjacentHTML()` parses the specified text as HTML and inserts it into the DOM tree at a specified position.'
    ),
    (
        r'(\beval\s*\()',
        'eval()',
        'Direct Code Evaluation',
        'CRITICAL',
        'CWE-95',
        'A03:2021-Injection',
        'Passing untrusted data to `eval()` allows instant remote code execution in the client browser context.'
    ),
    (
        r'(\bsetTimeout\s*\(\s*[\'"`a-zA-Z_$])',
        'setTimeout()',
        'Dynamic Code Evaluation',
        'HIGH',
        'CWE-95',
        'A03:2021-Injection',
        'Passing a string of code into `setTimeout()` evaluates it dynamically like `eval()`.'
    ),
    (
        r'(\bsetInterval\s*\(\s*[\'"`a-zA-Z_$])',
        'setInterval()',
        'Dynamic Code Evaluation',
        'HIGH',
        'CWE-95',
        'A03:2021-Injection',
        'Passing a string of code into `setInterval()` repeatedly evaluates it dynamically.'
    ),
    (
        r'(\bnew\s+Function\s*\()',
        'Function constructor',
        'Dynamic Function Execution',
        'CRITICAL',
        'CWE-95',
        'A03:2021-Injection',
        'Creating dynamic functions with `new Function(...)` evaluates code strings dynamically.'
    ),
    (
        r'((?:\$|jQuery)\([^)]*\)\.html\s*\()',
        'jQuery .html()',
        'jQuery HTML Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        'Passing unsanitized strings to jQuery `.html()` injects executable HTML into matched elements.'
    ),
    (
        r'((?:\$|jQuery)\([^)]*\)\.(?:append|prepend|after|before|replaceWith|wrap)\s*\()',
        'jQuery DOM Insertion',
        'jQuery DOM Injection',
        'HIGH',
        'CWE-79',
        'A03:2021-Injection',
        'Passing unsanitized user data into jQuery DOM manipulation methods allows HTML/script injection.'
    ),
    (
        r'((?:window\.|document\.)?location(?:\.href)?\s*=\s*)',
        'location.href',
        'DOM-Based Open Redirect / Navigation',
        'MEDIUM',
        'CWE-601',
        'A01:2021-Broken Access Control',
        'Setting `location.href` to user-controlled URLs enables client-side open redirection or `javascript:` URI execution.'
    ),
    (
        r'((?:window\.|document\.)?location\.(?:replace|assign)\s*\()',
        'location.replace/assign',
        'DOM-Based Open Redirect',
        'MEDIUM',
        'CWE-601',
        'A01:2021-Broken Access Control',
        'Redirecting the browser to user-controlled values can redirect victims to malicious phishing sites.'
    ),
    (
        r'(window\.open\s*\()',
        'window.open()',
        'DOM-Based Window Navigation',
        'MEDIUM',
        'CWE-601',
        'A01:2021-Broken Access Control',
        'Opening windows using user-controlled parameters can cause phishing or tab-nabbing.'
    )
]

SANITIZERS = [
    r'DOMPurify\.sanitize',
    r'sanitizeHtml',
    r'escapeHtml',
    r'encodeURIComponent',
    r'\.textContent\s*=',
    r'\.innerText\s*='
]

def scan_html_for_dom_xss(html_content: str, target_url: str, scanner_name: str = "owasp-zap") -> List[RawFinding]:
    """
    Analyzes web page HTML, inline <script> blocks, event handlers, and client-side DOM flows
    to accurately detect DOM-Based Cross-Site Scripting (DOM XSS), Open Redirects, and Insecure postMessage flows.
    """
    findings: List[RawFinding] = []
    if not html_content or len(html_content.strip()) == 0:
        return findings

    parsed_target = urllib.parse.urlparse(target_url)
    endpoint_path = parsed_target.path or "/"

    try:
        soup = BeautifulSoup(html_content, "html.parser")
    except Exception:
        soup = None

    script_blocks: List[Tuple[str, str, int]] = [] # (code, context_type, line_or_id)

    if soup:
        # 1. Extract <script> elements
        scripts = soup.find_all("script")
        for idx, s in enumerate(scripts):
            code = s.string or s.get_text() or ""
            if code and code.strip():
                script_blocks.append((code.strip(), "inline_script", idx + 1))
            elif s.get("src"):
                pass

        # 2. Extract inline event handlers (onload, onerror, onclick, etc.)
        for el in soup.find_all(True):
            for attr_name, attr_val in list(el.attrs.items()):
                if attr_name.lower().startswith("on") and isinstance(attr_val, str) and attr_val.strip():
                    script_blocks.append((attr_val.strip(), f"event_handler_{attr_name}", 0))
    else:
        # Fallback regex extraction of scripts
        raw_scripts = re.findall(r'<script[^>]*>(.*?)</script>', html_content, re.IGNORECASE | re.DOTALL)
        for idx, r_code in enumerate(raw_scripts):
            if r_code.strip():
                script_blocks.append((r_code.strip(), "inline_script", idx + 1))

    # Perform Source-to-Sink Taint Flow Analysis across each script
    seen_vuln_signatures = set()

    for script_code, context_type, block_idx in script_blocks:
        # A. Detect Tainted Variables
        tainted_vars: Dict[str, Tuple[str, str, str]] = {}

        for src_regex, src_desc, src_type in DOM_SOURCES:
            src_matches = list(re.finditer(src_regex, script_code, re.IGNORECASE))
            if src_matches:
                for match in src_matches:
                    pos = match.start()
                    line_start = script_code.rfind('\n', 0, pos)
                    line_start = 0 if line_start == -1 else line_start + 1
                    line_end = script_code.find('\n', pos)
                    line_end = len(script_code) if line_end == -1 else line_end
                    line_text = script_code[line_start:line_end].strip()

                    # Look for variable assignment
                    var_assign = re.search(
                        r'(?:var|let|const)?\s*(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)\s*=\s*.*?' + src_regex,
                        line_text,
                        re.IGNORECASE
                    )
                    if var_assign:
                        v_name = var_assign.group(1)
                        if v_name not in ['window', 'document', 'self', 'globalThis']:
                            tainted_vars[v_name] = (src_desc, line_text, src_type)

        # B. Check Dangerous Execution Sinks
        for sink_regex, sink_name, sink_category, sev, cwe_id, owasp_cat, sink_desc in DOM_SINKS:
            sink_matches = list(re.finditer(sink_regex, script_code, re.IGNORECASE))
            for sm in sink_matches:
                pos = sm.start()
                line_start = script_code.rfind('\n', 0, pos)
                line_start = 0 if line_start == -1 else line_start + 1
                line_end = script_code.find('\n', pos)
                line_end = len(script_code) if line_end == -1 else line_end
                sink_line = script_code[line_start:line_end].strip()

                # Check if this sink line is properly sanitized
                has_sanitizer = any(re.search(san, sink_line, re.IGNORECASE) for san in SANITIZERS)

                is_vuln = False
                matched_source = ""
                flow_explanation = ""
                tainted_input_name = ""
                source_type_matched = "hash"

                # Direct Source match in sink line
                for src_regex, src_desc, src_type in DOM_SOURCES:
                    if re.search(src_regex, sink_line, re.IGNORECASE):
                        is_vuln = True
                        matched_source = src_desc
                        source_type_matched = src_type
                        flow_explanation = f"Direct flow: DOM source `{src_desc}` is passed directly into `{sink_name}` in line: `{sink_line}`."
                        break

                # Tainted variable match in sink line
                if not is_vuln:
                    for tvar, (s_desc, a_line, s_type) in tainted_vars.items():
                        if re.search(r'\b' + re.escape(tvar) + r'\b', sink_line):
                            is_vuln = True
                            matched_source = s_desc
                            source_type_matched = s_type
                            tainted_input_name = tvar
                            flow_explanation = (
                                f"Taint propagation trace:\n"
                                f"1. Source: Variable `{tvar}` receives untrusted data from `{s_desc}` (`{a_line}`)\n"
                                f"2. Sink: Variable `{tvar}` (or transformed value) is written to execution sink `{sink_name}` (`{sink_line}`)"
                            )
                            break

                if is_vuln and not has_sanitizer:
                    sig_key = f"{sink_name}:{matched_source}:{sink_line[:60]}"
                    if sig_key in seen_vuln_signatures:
                        continue
                    seen_vuln_signatures.add(sig_key)

                    # Build Proof of Concept & Remediation
                    poc_url = target_url
                    if source_type_matched == "hash":
                        poc_url = f"{target_url}#<img src=x onerror=alert(document.domain)>"
                    elif source_type_matched in ("search", "search_params"):
                        delim = "&" if "?" in target_url else "?"
                        poc_url = f"{target_url}{delim}query=<svg/onload=alert(document.domain)>"

                    title_label = f"DOM-Based Cross-Site Scripting (DOM XSS) via {sink_name}"
                    if "Redirect" in sink_category:
                        title_label = f"DOM-Based Open Redirect via {sink_name}"

                    evidence_text = (
                        f"Vulnerable DOM Sink: {sink_name} ({sink_category})\n"
                        f"Untrusted DOM Source: {matched_source}\n\n"
                        f"Data Flow Trace:\n{flow_explanation}\n\n"
                        f"Code Context:\n```javascript\n{script_code[:800]}\n```\n\n"
                        f"Sample PoC Payload URL:\n{poc_url}"
                    )

                    remediation_text = (
                        f"1. Avoid passing user-controllable DOM inputs into dynamic execution sinks like `{sink_name}`.\n"
                        f"2. For safe text rendering, use `.textContent` or `.innerText` instead of `.innerHTML`.\n"
                        f"3. If HTML formatting is required, sanitize all user-controlled values with a proven library like DOMPurify:\n"
                        f"   `element.innerHTML = DOMPurify.sanitize(userInput);`\n"
                        f"4. For URL redirects, validate destination URLs against a strict whitelist of trusted internal paths."
                    )

                    findings.append(RawFinding(
                        scanner=scanner_name,
                        source="DAST",
                        title=title_label,
                        description=(
                            f"Client-side JavaScript at `{endpoint_path}` takes untrusted input from `{matched_source}` "
                            f"and dynamically writes it into the `{sink_name}` execution sink without proper sanitization. "
                            f"{sink_desc}"
                        ),
                        severity=sev,
                        confidence="HIGH",
                        category=f"DOM-Based {sink_category}",
                        cwe=[cwe_id, "CWE-79" if cwe_id != "CWE-79" else "CWE-116"],
                        owasp=[owasp_cat],
                        endpoint=endpoint_path,
                        parameter=tainted_input_name or source_type_matched,
                        evidence=evidence_text,
                        remediation=remediation_text,
                        references=[
                            "https://owasp.org/www-community/attacks/DOM_Based_XSS",
                            "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html",
                            "https://cwe.mitre.org/data/definitions/79.html"
                        ],
                        raw_data={
                            "source": matched_source,
                            "sink": sink_name,
                            "flow": flow_explanation,
                            "poc_url": poc_url,
                            "script_snippet": script_code[:500]
                        }
                    ))

        # C. Check for Insecure postMessage Listener (Missing Origin Validation)
        postmessage_matches = re.finditer(
            r'window\.addEventListener\s*\(\s*[\'"]message[\'"]\s*,\s*function\s*\(([^)]*)\)\s*\{([^}]+)\}',
            script_code,
            re.IGNORECASE | re.DOTALL
        )
        for pm in postmessage_matches:
            param_evt = pm.group(1).strip() or "event"
            body = pm.group(2)
            has_origin_check = bool(re.search(rf'{re.escape(param_evt)}\.origin', body, re.IGNORECASE))
            if not has_origin_check and any(re.search(rf'{re.escape(param_evt)}\.data', body) for _ in [1]):
                findings.append(RawFinding(
                    scanner=scanner_name,
                    source="DAST",
                    title="Insecure Cross-Origin postMessage Listener (Missing Origin Validation)",
                    description=(
                        f"The application registers a `message` event listener at `{endpoint_path}` but does not verify `event.origin`. "
                        f"Any third-party malicious domain can embed the site in an iframe and send arbitrary payloads."
                    ),
                    severity="HIGH",
                    confidence="HIGH",
                    category="Cross-Origin Security",
                    cwe=["CWE-345", "CWE-20"],
                    owasp=["A01:2021-Broken Access Control"],
                    endpoint=endpoint_path,
                    evidence=f"Message handler missing origin check:\n```javascript\n{pm.group(0)[:400]}\n```",
                    remediation="Always verify `event.origin === 'https://trusted-domain.com'` before processing `event.data` in message event handlers.",
                    references=["https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#cross-window-messaging"]
                ))

    return findings

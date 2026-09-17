export interface DomainIssue {
  id: string
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  category: string
  protocol: string
  matched_target: string
  description?: string
  remediation?: string
  cwe_id?: string
  cve_id?: string
  cvss_score?: number
  source?: string
  source_url?: string
}

export interface SecurityGradeInfo {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  badge: string
  ring: string
  text: string
  glow: string
  barColor: string
}

export interface UnifiedSecurityStats {
  score: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  totalIssues: number
  critical: number
  high: number
  medium: number
  low: number
  info: number
  highCrit: number
  totalCves: number
  damagingCount: number
  penalty: number
  gradeInfo: SecurityGradeInfo
  allIssues: DomainIssue[]
}

/**
 * Standard grade calculation based on 0-100 security score
 */
export function getGradeFromScore(score: number): SecurityGradeInfo {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)))
  
  if (safeScore >= 95) {
    return {
      grade: 'A+',
      risk: 'LOW',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      ring: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      barColor: '#10b981'
    }
  } else if (safeScore >= 85) {
    return {
      grade: 'A',
      risk: 'LOW',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      ring: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      barColor: '#10b981'
    }
  } else if (safeScore >= 70) {
    return {
      grade: 'B',
      risk: 'MEDIUM',
      badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
      ring: 'border-cyan-500/40',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      barColor: '#06b6d4'
    }
  } else if (safeScore >= 50) {
    return {
      grade: 'C',
      risk: 'HIGH',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
      ring: 'border-amber-500/40',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      barColor: '#f59e0b'
    }
  } else if (safeScore >= 30) {
    return {
      grade: 'D',
      risk: 'HIGH',
      badge: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
      ring: 'border-orange-500/40',
      text: 'text-orange-400',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
      barColor: '#f97316'
    }
  } else {
    return {
      grade: 'F',
      risk: 'CRITICAL',
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      ring: 'border-rose-500/40',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      barColor: '#f43f5e'
    }
  }
}

/**
 * Identify issues that possess damage/risk to the target infrastructure
 */
export function isDamagingIssue(issue: any): boolean {
  if (!issue) return false
  const sev = (issue.severity || '').toUpperCase()
  if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(sev)) return false
  
  const cat = (issue.category || '').toLowerCase()
  const damagingCats = [
    'exposed-panels', 'greenbone-nvt', 'open-ports', 'ssl-tls', 'vulnerability',
    'cve', 'osv', 'owasp-top10', 'misconfiguration', 'threat', 'information-disclosure',
    'exposed_files', 'secrets', 'nikto'
  ]
  
  return damagingCats.some(d => cat.includes(d)) || 
    !!issue.cve_id || 
    (issue.id && String(issue.id).toLowerCase().includes('port'))
}

/**
 * Consolidate all scanner outputs across all engines into uniform DomainIssue array
 */
export function extractAllDomainIssues(data: any, defaultDomain: string = ''): DomainIssue[] {
  if (!data) return []

  const targetDomain = (defaultDomain || data.target || data.domain || '').trim().toLowerCase().replace('https://', '').replace('http://', '').split('/')[0]
  const list: DomainIssue[] = []
  const seenKeys = new Set<string>()
  let idx = 1

  const addIssue = (issue: DomainIssue) => {
    const key = `${(issue.title || '').toLowerCase()}_${issue.category || ''}_${issue.matched_target || ''}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      list.push(issue)
    }
  }

  // 0. Pre-normalized domain_issues array
  if (Array.isArray(data.domain_issues)) {
    for (const item of data.domain_issues) {
      addIssue({
        id: item.id || `issue-${idx++}`,
        title: item.title || 'Security Issue',
        severity: (item.severity || 'LOW').toUpperCase() as any,
        category: item.category || 'misconfiguration',
        protocol: item.protocol || 'HTTP',
        matched_target: item.matched_target || targetDomain,
        description: item.description || '',
        remediation: item.remediation || '',
        cwe_id: item.cwe_id,
        cve_id: item.cve_id,
        cvss_score: item.cvss_score,
        source: item.source || 'Domain Intelligence Feed',
        source_url: item.source_url
      })
    }
  }

  // 1. Greenbone OpenVAS NVTs
  if (data.greenbone_data?.findings && Array.isArray(data.greenbone_data.findings)) {
    for (const g of data.greenbone_data.findings) {
      addIssue({
        id: `greenbone-${g.id || g.cve_id || idx++}`,
        title: g.title || 'Network Vulnerability',
        severity: (g.severity || 'MEDIUM').toUpperCase() as any,
        category: 'greenbone-nvt',
        protocol: g.service || 'TCP/IP',
        matched_target: g.port ? `${targetDomain}:${g.port}` : targetDomain,
        description: g.description || 'Vulnerability detected by Greenbone OpenVAS scanner.',
        remediation: g.remediation || 'Apply vendor security patches and close unneeded ports.',
        cve_id: g.cve_id,
        cvss_score: g.cvss_score || 7.0,
        source: 'Greenbone OpenVAS Network Scanner',
        source_url: 'https://github.com/greenbone/'
      })
    }
  }

  // 2. OWASP Top 10 Web Application Scanner
  if (data.owasp_data?.findings && Array.isArray(data.owasp_data.findings)) {
    for (const of of data.owasp_data.findings) {
      addIssue({
        id: `owasp-${of.id || idx++}`,
        title: of.title || 'OWASP Web Application Vulnerability',
        severity: (of.severity || 'LOW').toUpperCase() as any,
        category: of.category || 'owasp-top10',
        protocol: 'HTTPS',
        matched_target: of.url || targetDomain,
        description: of.description || '',
        remediation: of.remediation || '',
        cwe_id: of.cwe_id,
        cvss_score: of.cvss_score || 5.0,
        source: 'OWASP Web App Scanner',
        source_url: of.source_url || 'https://github.com/OWASP/Top10/'
      })
    }
  }

  // 2b. WebScanner (16-Step Pipeline)
  if (data.webscanner_data?.findings && Array.isArray(data.webscanner_data.findings)) {
    for (const wf of data.webscanner_data.findings) {
      addIssue({
        id: `webscanner-${wf.id || idx++}`,
        title: wf.title || 'WebScanner Security Finding',
        severity: (wf.severity || 'LOW').toUpperCase() as any,
        category: wf.category || 'misconfiguration',
        protocol: wf.protocol || 'HTTPS',
        matched_target: targetDomain,
        description: wf.description || '',
        remediation: wf.remediation || '',
        cvss_score: wf.cvss_score || 5.0,
        source: wf.source || 'WebScanner',
        source_url: 'https://github.com/kpirnie/webscanner'
      })
    }
  }

  // 3. ProjectDiscovery Nuclei
  if (data.nuclei_data?.findings && Array.isArray(data.nuclei_data.findings)) {
    for (const f of data.nuclei_data.findings) {
      addIssue({
        id: `nuclei-${f.template_id || idx++}`,
        title: f.name || 'Infrastructure Security Issue',
        severity: (f.severity || 'LOW').toUpperCase() as any,
        category: f.category || 'misconfiguration',
        protocol: f.protocol || 'HTTP',
        matched_target: f.matched_at || targetDomain,
        description: f.description || 'Infrastructure security issue detected via ProjectDiscovery Nuclei.',
        remediation: f.remediation || '',
        cwe_id: f.cwe_id,
        cvss_score: f.cvss_score,
        source: 'ProjectDiscovery Nuclei',
        source_url: f.template_url || 'https://github.com/projectdiscovery/nuclei'
      })
    }
  }

  // 4. testssl.sh Cryptographic & TLS Protocol Audit
  if (data.testssl_data?.findings && Array.isArray(data.testssl_data.findings)) {
    for (const s of data.testssl_data.findings) {
      addIssue({
        id: `testssl-${s.id || idx++}`,
        title: s.title || 'TLS/SSL Cryptographic Finding',
        severity: (s.severity || 'MEDIUM').toUpperCase() as any,
        category: 'ssl-tls',
        protocol: 'TLS/SSL',
        matched_target: `${targetDomain}:${data.testssl_data.port || 443}`,
        description: s.description || 'TLS protocol or cipher suite audit finding from testssl.sh.',
        remediation: s.remediation || 'Enforce modern TLS 1.3/1.2 protocols and disable legacy ciphers.',
        cvss_score: s.cvss_score || 5.5,
        source: 'testssl.sh Protocol Auditor',
        source_url: 'https://github.com/testssl/testssl.sh'
      })
    }
  }

  // 5. Nmap Network Port Scanner & Service Exposures
  if (data.nmap_data?.issues && Array.isArray(data.nmap_data.issues)) {
    for (const n of data.nmap_data.issues) {
      addIssue({
        id: `nmap-port-${n.port || idx++}`,
        title: `Nmap: Exposed Service ${n.service || 'Service'} (Port ${n.port})`,
        severity: (n.severity || 'LOW').toUpperCase() as any,
        category: 'exposed-panels',
        protocol: n.service || 'TCP',
        matched_target: `${targetDomain}:${n.port}`,
        description: n.description || `Network port ${n.port} is open to incoming traffic.`,
        remediation: `Close port ${n.port} or restrict access using firewalls or VPN.`,
        cvss_score: n.cvss_score || 5.0,
        source: 'Nmap Network Scanner',
        source_url: 'https://nmap.org'
      })
    }
  }

  // 6. Google OSV Open Source Vulnerabilities
  if (data.osv_data?.vulnerabilities && Array.isArray(data.osv_data.vulnerabilities)) {
    for (const osv of data.osv_data.vulnerabilities) {
      const oId = osv.cve_id || osv.id || 'OSV-ADVISORY'
      addIssue({
        id: `osv-${osv.id || idx++}`,
        title: `Google OSV: ${oId} (${osv.package || 'Web Component'})`,
        severity: (osv.severity || 'MEDIUM').toUpperCase() as any,
        category: 'cve',
        protocol: 'HTTP',
        matched_target: targetDomain,
        description: osv.summary || 'Known open-source component vulnerability advisory.',
        remediation: `Upgrade ${osv.package || 'component'} to the latest secure patch.`,
        cve_id: osv.cve_id,
        cvss_score: osv.cvss_score || 6.5,
        source: 'Google OSV Database',
        source_url: osv.advisory_url || 'https://osv.dev'
      })
    }
  }

  // 7. NVD CVE Vulnerabilities
  if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
    for (const v of data.vulnerabilities) {
      addIssue({
        id: `cve-${v.cve_id || idx++}`,
        title: `${v.cve_id}: ${(v.description || '').slice(0, 80)}...`,
        severity: (v.severity || 'MEDIUM').toUpperCase() as any,
        category: 'cve',
        protocol: 'TCP/IP',
        matched_target: targetDomain,
        description: v.description || 'Known common vulnerability and exposure.',
        remediation: `Apply vendor security patch addressing ${v.cve_id}.`,
        cve_id: v.cve_id,
        cvss_score: v.cvss_score || 5.0,
        source: 'NVD CVE Database',
        source_url: `https://nvd.nist.gov/vuln/detail/${v.cve_id}`
      })
    }
  }

  // 8. Shodan Detected Vulnerabilities
  if (data.shodan_data?.vulnerabilities && Array.isArray(data.shodan_data.vulnerabilities)) {
    for (const sv of data.shodan_data.vulnerabilities) {
      addIssue({
        id: `shodan-vuln-${sv}-${idx++}`,
        title: `Shodan Detected Vulnerability: ${sv}`,
        severity: 'HIGH',
        category: 'cve',
        protocol: 'TCP/IP',
        matched_target: targetDomain,
        description: `Shodan scanner detected known CVE ${sv} on infrastructure.`,
        remediation: `Apply latest security patch addressing ${sv}.`,
        cve_id: sv,
        cvss_score: 7.5,
        source: 'Shodan Vulnerability Intelligence',
        source_url: `https://nvd.nist.gov/vuln/detail/${sv}`
      })
    }
  }

  // 9. ThreatFox Malicious IOC Detections
  if (data.threatfox_data?.is_malicious && Array.isArray(data.threatfox_data.threats)) {
    for (const tf of data.threatfox_data.threats) {
      const conf = tf.confidence_level || 75
      addIssue({
        id: `threatfox-${idx++}`,
        title: `ThreatFox IOC: ${tf.malware_printable || 'Malware Activity'}`,
        severity: (conf >= 80 ? 'CRITICAL' : 'HIGH') as any,
        category: 'threat',
        protocol: 'TCP/IP',
        matched_target: tf.ioc || targetDomain,
        description: `Target matched ThreatFox indicator (${tf.threat_type || 'Threat'}) with ${conf}% confidence.`,
        remediation: 'Isolate affected hosts, block malicious C2 endpoints, and inspect logs.',
        cvss_score: conf >= 80 ? 8.8 : 7.5,
        source: 'ThreatFox (abuse.ch)',
        source_url: 'https://threatfox.abuse.ch'
      })
    }
  }

  // 10. VirusTotal Detections
  if (data.virustotal_data) {
    const vtStats = data.virustotal_data.last_analysis_stats || {}
    const vtMalicious = vtStats.malicious || 0
    if (vtMalicious > 0) {
      addIssue({
        id: `virustotal-detection-${idx++}`,
        title: `VirusTotal: ${vtMalicious} Security Vendors Flagged Malicious`,
        severity: (vtMalicious >= 3 ? 'CRITICAL' : 'HIGH') as any,
        category: 'threat',
        protocol: 'HTTP/DNS',
        matched_target: targetDomain,
        description: `${vtMalicious} antivirus engines classified this domain as malicious.`,
        remediation: 'Inspect hosted content, check blacklists, and submit false-positive requests.',
        cvss_score: vtMalicious >= 3 ? 8.5 : 7.2,
        source: 'VirusTotal Multi-Engine',
        source_url: 'https://www.virustotal.com'
      })
    }
  }

  // 11. Security Threats
  if (data.threats && Array.isArray(data.threats)) {
    for (const t of data.threats) {
      addIssue({
        id: `threat-${idx++}`,
        title: t.type || 'Security Threat',
        severity: (t.severity || 'MEDIUM').toUpperCase() as any,
        category: 'threat',
        protocol: 'HTTP/DNS',
        matched_target: targetDomain,
        description: `Security telemetry flag: ${t.type || 'Unknown Threat'}`,
        remediation: 'Review active logs and blacklist status to remediate security risks.',
        source: t.source || 'Threat Intelligence'
      })
    }
  }

  return list
}

/**
 * Unified calculation function that computes identical score, rating, penalty, and issue stats
 * across outer cards (companies/page.tsx), inner headers (CompanyDetailsView.tsx), and analysis (DomainDetails.tsx).
 */
export function computeUnifiedSecurityStats(input: any, fallbackDomain: string = ''): UnifiedSecurityStats {
  if (!input) {
    const gradeInfo = getGradeFromScore(100)
    return {
      score: 100,
      grade: 'A+',
      risk: 'LOW',
      totalIssues: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      highCrit: 0,
      totalCves: 0,
      damagingCount: 0,
      penalty: 0,
      gradeInfo,
      allIssues: []
    }
  }

  // Extract nested assessment details if present
  let det: any = null
  const assessment = input.latest_risk_assessment || input.risk_assessment || null

  if (assessment?.assessment_details) {
    try {
      det = typeof assessment.assessment_details === 'string'
        ? JSON.parse(assessment.assessment_details)
        : assessment.assessment_details
    } catch {
      det = null
    }
  }

  // Gather data object (could be company, det, or raw domainData)
  const analysisPayload = det || input.analysis_data || (input.target || input.domain_issues || input.greenbone_data ? input : null)
  const domain = fallbackDomain || input.domain || analysisPayload?.target || ''

  // Consolidate all issues
  const allIssues = extractAllDomainIssues(analysisPayload, domain)

  // Calculate severity counts
  const critical = allIssues.filter(i => i.severity === 'CRITICAL').length
  const high = allIssues.filter(i => i.severity === 'HIGH').length
  const medium = allIssues.filter(i => i.severity === 'MEDIUM').length
  const low = allIssues.filter(i => i.severity === 'LOW').length
  const info = allIssues.filter(i => i.severity === 'INFO').length
  const totalIssues = allIssues.length
  const highCrit = critical + high

  // Filter damaging issues & compute exact penalty
  const damagingIssues = allIssues.filter(isDamagingIssue)
  const criticalDamaging = damagingIssues.filter(i => i.severity === 'CRITICAL').length
  const highDamaging = damagingIssues.filter(i => i.severity === 'HIGH').length
  const mediumDamaging = damagingIssues.filter(i => i.severity === 'MEDIUM').length
  const lowDamaging = damagingIssues.filter(i => i.severity === 'LOW').length

  const penalty = (criticalDamaging * 10) + (highDamaging * 5) + (mediumDamaging * 2) + (lowDamaging * 2)

  let score: number
  if (allIssues.length > 0 || analysisPayload) {
    // Authoritative dynamic calculation based on scanner findings
    score = Math.max(5, Math.min(100, 100 - penalty))
  } else if (assessment?.security_score !== undefined && assessment?.security_score !== null) {
    score = Number(assessment.security_score)
  } else if (input.security_score !== undefined && input.security_score !== null) {
    score = Number(input.security_score)
  } else {
    score = 100
  }

  // Calculate deduplicated CVEs
  const cveSet = new Set<string>()
  allIssues.forEach((i: any) => {
    if (i.cve_id) cveSet.add(i.cve_id)
    else if (i.category === 'cve' || i.category === 'osv' || (typeof i.title === 'string' && i.title.startsWith('CVE-'))) {
      cveSet.add(i.id || i.title)
    }
  })
  
  let totalCves = cveSet.size
  if (totalCves === 0) {
    if (analysisPayload?.total_cves_count) {
      totalCves = Number(analysisPayload.total_cves_count)
    } else if (analysisPayload?.issues_statistics?.total_cves) {
      totalCves = Number(analysisPayload.issues_statistics.total_cves)
    } else if (Array.isArray(analysisPayload?.vulnerabilities)) {
      totalCves = analysisPayload.vulnerabilities.length
    }
  }

  // Get standardized grade and visual styling
  const gradeInfo = getGradeFromScore(score)

  return {
    score,
    grade: gradeInfo.grade,
    risk: gradeInfo.risk,
    totalIssues: totalIssues > 0 ? totalIssues : (assessment?.vulnerabilities_count || 0),
    critical,
    high,
    medium,
    low,
    info,
    highCrit: highCrit > 0 ? highCrit : (assessment?.active_incidents || 0),
    totalCves,
    damagingCount: damagingIssues.length,
    penalty,
    gradeInfo,
    allIssues
  }
}

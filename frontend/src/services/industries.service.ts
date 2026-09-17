import api from './auth.service'

export interface CaseStudy {
  title: string
  victim: string
  year?: string
  impact: string
  root_cause?: string
  attack_chain?: string
}

export interface DefenseControl {
  priority: string
  control: string
  rationale: string
}

export interface IndustryTarget {
  id: number
  name: string
  attack_percentage: number
  attack_count: number
  trend: string
  risk_level: string
  primary_vector?: string
  primary_threat_vectors: string[]
  top_adversaries: string[]
  common_cves: string[]
  impact_summary: string
  recommended_defenses: string[]
  description: string
  campaigns_count?: number
  downtime_cost_per_hour?: string
  regulatory_frameworks?: string[]
  real_world_case_studies?: CaseStudy[]
  threat_landscape_analysis?: string
  defense_hardening_checklist?: DefenseControl[]
}

export const INITIAL_INDUSTRIES_DATA: IndustryTarget[] = [
  {
    id: 1,
    name: 'Healthcare, Hospitals & Life Sciences',
    attack_percentage: 28.5,
    attack_count: 356,
    trend: '↑ 14%',
    risk_level: 'CRITICAL',
    primary_vector: 'Double Extortion Ransomware & Medical IoT Hijacking',
    primary_threat_vectors: [
      'Double Extortion Ransomware (Exfiltration + Encryption)',
      'Medical IoT & PACS Diagnostic Imaging Protocol Exploits (DICOM/HL7)',
      'Spear-Phishing & Voice Phishing of Clinical Support Staff',
      'Third-Party Billing & Healthcare Supply Chain Breaches',
      'Unpatched Edge VPN & Telehealth Ingress Vulnerabilities'
    ],
    top_adversaries: ['LockBit 3.0', 'BlackCat (ALPHV)', 'Lazarus Group', 'Royal / BlackSuit', 'Rhysida'],
    common_cves: ['CVE-2023-4966 (Citrix Bleed)', 'CVE-2024-21887 (Ivanti Connect Secure)', 'CVE-2023-2868 (Barracuda ESG)', 'CVE-2024-1709 (ConnectWise ScreenConnect)'],
    impact_summary: 'Disruption of emergency triage and ICU surgical rooms, diversion of trauma ambulances, dark web auctioning of Protected Health Information (PHI/EHR), nationwide pharmacy prescription processing blackouts, and devastating HIPAA regulatory fines.',
    recommended_defenses: [
      'Strict microsegmentation physically separating clinical diagnostic devices (CT/MRI/Infusion) from hospital enterprise IT networks',
      'Mandatory FIDO2 hardware MFA tokens on all Electronic Health Record (EHR) portals, remote telehealth endpoints, and PACS systems',
      'Immutable, off-site air-gapped backups for hospital patient management database clusters with tested sub-2-hour bare-metal recovery',
      'Continuous 24/7 Managed Detection and Response (MDR/EDR) telemetry inspection across all hospital endpoints and IoT gateways',
      'Automated anomalous credential testing and emergency network isolation triggers on unauthorized lateral SMB/RDP traversals'
    ],
    description: 'Healthcare remains the #1 most aggressively targeted sector globally. Adversaries exploit the non-negotiable requirement for 24/7 operational uptime and the immense black-market value of complete patient identity records.',
    campaigns_count: 38,
    downtime_cost_per_hour: '$420,000 / hr (Excluding patient diversion liability & HIPAA settlements)',
    regulatory_frameworks: ['HIPAA Security Rule', 'HITECH Act', 'FDA Medical Device Cybersecurity (Premarket/Postmarket)', 'EU NIS2 Directive'],
    threat_landscape_analysis: 'Healthcare organizations face severe cyber risk caused by an expanding attack surface of connected biomedical devices, legacy unpatched Windows embedded operating systems in diagnostic suites, and consolidated third-party billing clearinghouses. Ransomware operators deliberately launch attacks during holiday weekends and high-volume clinical hours to maximize extortion leverage.',
    real_world_case_studies: [
      {
        title: 'Nationwide Prescription & Claims Blackout',
        victim: 'Change Healthcare (UnitedHealth Group)',
        year: '2024',
        impact: '$22M ransom paid; Estimated $1.6B+ overall financial fallout; Disrupted 1 in 3 US patient medical prescriptions.',
        root_cause: 'Single compromised credential on an edge Citrix server that lacked Multi-Factor Authentication (MFA).'
      },
      {
        title: 'Emergency Room Diversion & Patient Data Leak',
        victim: 'Ardent Health Services (30 Hospitals)',
        year: '2023',
        impact: 'Emergency rooms across 6 states diverted ambulances for over 72 hours; Elective surgeries cancelled.',
        root_cause: 'BlackCat/ALPHV deployment via weaponized phishing attachment exploiting unpatched VPN gateway.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Enforce MFA on all Citrix, VPN, and RDP portals without exception.', rationale: 'Eliminates the #1 primary initial access vector used against healthcare networks.' },
      { priority: 'P0 - IMMEDIATE', control: 'Air-gap and isolate EHR database backups with immutable object locking.', rationale: 'Guarantees zero-ransom recovery capability during active encryption events.' },
      { priority: 'P1 - HIGH', control: 'Segment VLANs for all medical diagnostic equipment (PACS, Infusion Pumps).', rationale: 'Prevents commodity ransomware on corporate PCs from reaching life-support equipment.' },
      { priority: 'P2 - STRATEGIC', control: 'Establish 3rd-party vendor risk scoring & B2B VPN access reviews.', rationale: 'Mitigates supply-chain breaches through outsourced billing and IT support contractors.' }
    ]
  },
  {
    id: 2,
    name: 'Financial Services, Banking & Fintech',
    attack_percentage: 22.3,
    attack_count: 278,
    trend: '↑ 9%',
    risk_level: 'CRITICAL',
    primary_vector: 'API Credential Stuffing & SWIFT Heists',
    primary_threat_vectors: [
      'API Credential Stuffing & Automated Account Takeover (ATO)',
      'SWIFT Interbank Messaging & Core Banking Manipulation',
      'DeFi Smart Contract Logic Exploitation & Bridge Drains',
      'Zero-Day Exploits against Perimeter Firewalls & Trading Gateways',
      'Insider Threat Recruitment & Helpdesk Social Engineering'
    ],
    top_adversaries: ['Lazarus Group (APT38)', 'Scattered Spider (0ktapus)', 'FIN7', 'LockBit 3.0', 'Evil Corp'],
    common_cves: ['CVE-2023-38606 (Kernel Memory Exposure)', 'CVE-2024-1709 (ConnectWise Auth Bypass)', 'CVE-2023-48788 (FortiClient EMS)', 'CVE-2023-4966 (Citrix Bleed)'],
    impact_summary: 'Direct unauthorized wire transfers and cryptocurrency asset drainage, temporary suspension of interbank settlement clearing, catastrophic market reputational damage, SEC and GLBA enforcement actions.',
    recommended_defenses: [
      'Hardware Security Module (HSM) cryptographic key isolation for all transaction signing systems',
      'AI-powered behavioral fraud detection and anomalous transaction velocity triggers',
      'Mandatory dual-custody authorization and out-of-band biometric approval on all wire operations exceeding $50k',
      'Zero Trust Network Access (ZTNA) enforced on all privileged trading terminals and core banking databases',
      'Automated secret scanning preventing API private key leakage on GitHub and CI/CD pipelines'
    ],
    description: 'Financial institutions face persistent, multi-vector assaults from both state-sponsored actors seeking sovereign revenue and sophisticated cybercrime syndicates targeting payment gateways and banking APIs.',
    campaigns_count: 31,
    downtime_cost_per_hour: '$1,250,000 / hr (Market trading halts, liquidity freeze & regulatory fines)',
    regulatory_frameworks: ['PCI-DSS v4.0', 'GLBA', 'NYDFS 23 NYCRR 500', 'DORA (EU Digital Operational Resilience Act)', 'FFIEC Guidelines'],
    threat_landscape_analysis: 'The financial sector is undergoing rapid digitization with Open Banking APIs, cloud-native microservices, and Web3 integrations. Threat actors deploy high-volume residential proxy botnets to conduct credential stuffing against customer mobile banking APIs, while elite APT units compromise core banking servers to forge SWIFT wire instructions.',
    real_world_case_studies: [
      {
        title: 'Treasury Bond Trading Clearing Disruption',
        victim: 'ICBC Financial Services (US Branch)',
        year: '2023',
        impact: 'Disrupted over $9 billion in daily US Treasury settlement trades; forced manual messenger USB trades.',
        root_cause: 'LockBit ransomware deployment exploiting unpatched Citrix Bleed (CVE-2023-4966).'
      },
      {
        title: 'Interbank SWIFT Transfer Manipulation',
        victim: 'Bangladesh Central Bank',
        year: '2016',
        impact: '$81 million stolen via fraudulent Federal Reserve NY wire requests.',
        root_cause: 'Lazarus Group malware compromising local SWIFT Alliance Access terminals and disabling confirmation printers.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Enforce biometric / FIDO2 MFA for all employee and contractor access.', rationale: 'Blocks credential stuffing and reverse-proxy phishing attacks entirely.' },
      { priority: 'P0 - IMMEDIATE', control: 'Implement HSM token signing for all financial API endpoints and webhooks.', rationale: 'Prevents unauthorized transfer forgery even if backend application servers are breached.' },
      { priority: 'P1 - HIGH', control: 'Deploy Behavioral AI Web Application & API Protection (WAAP).', rationale: 'Detects high-frequency automated ATO attempts and anomalous API parameter tampering.' },
      { priority: 'P2 - STRATEGIC', control: 'Conduct continuous purple-team simulated SWIFT and IAM breach assessments.', rationale: 'Validates SOC detection engineering against elite state-sponsored banking intrusions.' }
    ]
  },
  {
    id: 3,
    name: 'Government, Defense Industrial Base & Aerospace',
    attack_percentage: 18.7,
    attack_count: 234,
    trend: '↑ 16%',
    risk_level: 'CRITICAL',
    primary_vector: 'State-Sponsored Advanced Persistent Espionage',
    primary_threat_vectors: [
      'Advanced Nation-State Cyber Espionage & Exfiltration',
      'Spear-Phishing of Diplomatic, Military & Legislative Personnel',
      'Living-off-the-Land (LotL) Stealth Infiltration',
      'Zero-Day Weaponization against Edge Firewalls and Gateway Appliances',
      'Subcontractor & Defense Supply Chain Infiltration'
    ],
    top_adversaries: ['APT29 (Cozy Bear)', 'APT28 (Fancy Bear)', 'Volt Typhoon', 'Mustang Panda', 'Charming Kitten'],
    common_cves: ['CVE-2023-23397 (Microsoft Outlook NTLM)', 'CVE-2024-3400 (Palo Alto Networks PAN-OS)', 'CVE-2023-46805 (Ivanti VPN)', 'CVE-2024-21887 (Ivanti)'],
    impact_summary: 'Exfiltration of classified weapons schematics, military logistics and readiness data, surveillance of diplomatic negotiations, compromise of municipal voting rolls and citizen identity databases.',
    recommended_defenses: [
      'Strict Cross-Domain Solutions (CDS) and physical air-gapping for classified enclaves',
      'Complete deprecation of legacy NTLM authentication across all Active Directory forests',
      'Continuous memory anomaly detection and firmware integrity validation on boundary appliances',
      'Mandatory Cybersecurity Maturity Model Certification (CMMC 2.0 Level 2/3) for all defense contractors',
      'Zero-trust credential lifecycle management with continuous conditional access re-evaluation'
    ],
    description: 'Government agencies and defense industrial base contractors are primary targets for nation-state cyber warfare units seeking strategic military, diplomatic, and geopolitical superiority.',
    campaigns_count: 42,
    downtime_cost_per_hour: 'Immeasurable (National security breach & strategic deterrence compromise)',
    regulatory_frameworks: ['NIST SP 800-171 / 800-53', 'DoD CMMC 2.0', 'FedRAMP High', 'ITAR (International Traffic in Arms Regulations)'],
    threat_landscape_analysis: 'Foreign intelligence services deploy multi-tiered cyber operations against defense contractors. Tier-1 APT actors focus on breaking into smaller tier-3 and tier-4 machine shops, engineering consultancies, and parts manufacturers who lack enterprise SOC defenses to pivot upward into major defense primes.',
    real_world_case_studies: [
      {
        title: 'SolarWinds Orion Supply Chain Compromise',
        victim: 'US Treasury, Commerce, Homeland Security, Pentagon',
        year: '2020',
        impact: 'Unmonitored intelligence extraction across cabinet-level departments for over 9 months.',
        root_cause: 'APT29 (SVR) trojanized source code build pipeline injecting Sunburst backdoor into software updates.'
      },
      {
        title: 'Defense Contractor Blueprint Exfiltration',
        victim: 'Major US Aerospace Defense Contractors',
        year: '2023',
        impact: 'Exfiltration of hypersonic propulsion research and naval electronic warfare sensor data.',
        root_cause: 'Zero-day exploitation of edge VPN appliances followed by Living-off-the-Land Active Directory harvesting.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Mandate FIDO2 hardware passkeys for all unclassified & classified email/cloud access.', rationale: 'Neutralizes 99.9% of credential theft and reverse-proxy phishing attacks.' },
      { priority: 'P0 - IMMEDIATE', control: 'Enforce strict network segmentation between corporate IT and defense design networks.', rationale: 'Prevents lateral movement from compromised email workstations to CAD/CAM blueprint storage.' },
      { priority: 'P1 - HIGH', control: 'Audit and restrict outbound internet traffic from edge firewalls and servers.', rationale: 'Severely inhibits adversary reverse-shell C2 communication channels.' },
      { priority: 'P2 - STRATEGIC', control: 'Implement automated CMMC 2.0 compliance telemetry monitoring across supply chain.', rationale: 'Provides visibility into third-party vendor security posture and unpatched vulnerabilities.' }
    ]
  },
  {
    id: 4,
    name: 'Energy, Electric Power Grids & Oil/Gas Pipelines',
    attack_percentage: 15.4,
    attack_count: 192,
    trend: '↑ 18%',
    risk_level: 'CRITICAL',
    primary_vector: 'ICS/SCADA Sabotage & OT Ransomware',
    primary_threat_vectors: [
      'ICS/SCADA Industrial Protocol Hijacking (DNP3, Modbus, IEC 104)',
      'OT Network Infiltration from Corporate IT Lateral Movement',
      'Ransomware Encryption of Pipeline Logistics & Billing Systems',
      'Pre-Positioning inside Electrical Substation Remote Terminal Units (RTUs)',
      'Compromised Vendor Remote Maintenance VPNs'
    ],
    top_adversaries: ['Sandworm (Unit 74455)', 'Volt Typhoon', 'BlackCat (ALPHV)', 'DarkSide / BlackMatter', 'Dragonfly (Energetic Bear)'],
    common_cves: ['CVE-2023-46805 (Ivanti VPN)', 'CVE-2022-26134 (Confluence)', 'CVE-2024-3400 (Palo Alto)', 'CVE-2023-27997 (Fortinet FortiOS)'],
    impact_summary: 'Widespread civilian electrical blackouts, physical damage to high-voltage power transformers, pipeline fuel flow shutdowns causing regional energy panics, multi-billion dollar economic halting.',
    recommended_defenses: [
      'Purdue Model strict physical & firewall isolation between IT business networks and OT plant operations',
      'Read-only unidirectional hardware data diodes for exporting SCADA telemetry to corporate analytics',
      'Out-of-band manual override capabilities for all electrical substation protection relays',
      'Continuous monitoring of industrial network packets for unauthorized PLC firmware download commands',
      'Mandatory multi-factor authentication on all third-party vendor remote maintenance portals'
    ],
    description: 'The energy sector is the cornerstone of national critical infrastructure. Disruption of electricity or fuel distribution immediately cripples water, transportation, healthcare, and emergency response capabilities.',
    campaigns_count: 27,
    downtime_cost_per_hour: '$850,000 / hr (Refinery halts & regional grid blackout economic impact)',
    regulatory_frameworks: ['NERC CIP (Critical Infrastructure Protection)', 'TSA Pipeline Security Directives', 'DOE C2M2 Model', 'IEC 62443 Standard'],
    threat_landscape_analysis: 'Energy networks are increasingly integrating IoT smart meters, remote wind turbine telemetry, and cloud optimization systems. This convergence of legacy operational technology (which often lacks authentication) with modern IP networks creates critical attack vectors that hostile nation-states and extortion syndicates exploit.',
    real_world_case_studies: [
      {
        title: 'East Coast Pipeline Fuel Delivery Shutdown',
        victim: 'Colonial Pipeline',
        year: '2021',
        impact: 'Precautionary 6-day shutdown of 5,500 miles of pipeline carrying 45% of East Coast fuel; $4.4M ransom paid.',
        root_cause: 'Compromised legacy VPN account credentials found on the dark web; account lacked Multi-Factor Authentication.'
      },
      {
        title: 'Cyber-Induced Electrical Substation Blackout',
        victim: 'Kyiv Power Grid (Ukrenergo)',
        year: '2016',
        impact: 'Automatic circuit breakers tripped across high-voltage substation; 200MW power loss blacking out northern Kyiv.',
        root_cause: 'Sandworm deployed custom Industroyer (CrashOverride) malware directly speaking IEC 60870-5-104 SCADA protocol.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Sever any direct routing connections between IT enterprise networks and OT SCADA VLANs.', rationale: 'Stops ransomware that infects corporate email from spreading to plant control machinery.' },
      { priority: 'P0 - IMMEDIATE', control: 'Deploy hardware data diodes for all outward SCADA monitoring feeds.', rationale: 'Physically guarantees that data can only travel outbound from the OT network, making inbound hacking impossible.' },
      { priority: 'P1 - HIGH', control: 'Enforce strict change-control alarms on all PLC logic programming changes.', rationale: 'Instantly alerts OT engineers if adversary malware attempts to overwrite safety control limits.' },
      { priority: 'P2 - STRATEGIC', control: 'Conduct regular offline blackout restoration drills (Black Start validation).', rationale: 'Ensures engineers can safely restart generators without relying on compromised digital networks.' }
    ]
  },
  {
    id: 5,
    name: 'Manufacturing, Aerospace & Industrial Automation',
    attack_percentage: 14.2,
    attack_count: 178,
    trend: '↓ 2%',
    risk_level: 'HIGH',
    primary_vector: 'Ransomware Halting Assembly Lines & CAD Blueprint Theft',
    primary_threat_vectors: [
      'Ransomware Deployment Halting Robotics & Assembly Lines',
      'Proprietary CAD/CAM Blueprint Exfiltration via Spear-Phishing',
      'Compromised Vendor Firmware & Remote Assistance Software',
      'Unsecured RDP & Legacy Windows XP/7 Industrial Terminals',
      'MFT (Managed File Transfer) Zero-Day Data Theft'
    ],
    top_adversaries: ['LockBit 3.0', 'Cl0p (Lace Tempest)', 'BlackBasta', 'APT41 (Winnti)', 'Dragonfly'],
    common_cves: ['CVE-2023-34362 (MOVEit Transfer)', 'CVE-2023-27997 (FortiOS SSL-VPN)', 'CVE-2024-1709 (ConnectWise)', 'CVE-2022-26134 (Confluence)'],
    impact_summary: 'Automotive and aerospace factory line halts costing millions per hour, cascade supply shortages across global assembly networks, theft of intellectual property and proprietary material formulations.',
    recommended_defenses: [
      'Physical and logical air-gapping of Purdue Model Industrial Control (ICS) networks from ERP systems',
      'Deprecation of default credentials on all Programmable Logic Controllers (PLCs) and CNC machines',
      'Software Bill of Materials (SBOM) tracking and vulnerability vetting for all embedded machinery software',
      'Unified visibility platforms bridging IT security operations (SOC) with OT plant floor engineers',
      'Immutable backup repositories for robotic automation scripts and PLC logic configurations'
    ],
    description: 'Manufacturing combines legacy operational machinery with modern ERP and supply chain connectivity, creating exceptionally lucrative extortion targets for ransomware cartels aware that every minute of downtime costs thousands of dollars.',
    campaigns_count: 22,
    downtime_cost_per_hour: '$520,000 / hr (Robotic assembly shutdown & supply contract penalties)',
    regulatory_frameworks: ['ISO/IEC 27001', 'IEC 62443', 'NIST CSF 2.0', 'NIS2 Directive'],
    threat_landscape_analysis: 'Manufacturing organizations frequently operate high-value CNC milling machines and robotic assembly systems running on outdated operating systems that cannot be patched without voiding manufacturer warranties. Ransomware syndicates take advantage by breaching corporate IT networks and propagating down to shop-floor HMIs.',
    real_world_case_studies: [
      {
        title: 'Global Automotive Supplier Extortion',
        victim: 'Continental AG',
        year: '2022',
        impact: '40TB of proprietary automotive data exfiltrated and leaked; $50M ransom demand.',
        root_cause: 'LockBit 3.0 infiltration via compromised employee credentials followed by internal Active Directory reconnaissance.'
      },
      {
        title: 'Meat Processing Plant Global Halt',
        victim: 'JBS Foods',
        year: '2021',
        impact: 'Halted meat processing across US, Canada, and Australia; $11M ransom paid in Bitcoin.',
        root_cause: 'REvil ransomware deployed across corporate Active Directory controllers, freezing operational logistics.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Isolate all legacy shop-floor HMI terminals behind microsegmented firewalls.', rationale: 'Prevents malware on administrative PCs from scanning and attacking unpatched Windows 7 factory computers.' },
      { priority: 'P0 - IMMEDIATE', control: 'Disable internet access on all programmable machinery controllers.', rationale: 'Ensures industrial tools cannot communicate with external command and control servers.' },
      { priority: 'P1 - HIGH', control: 'Implement continuous file-integrity monitoring on CAD blueprint file servers.', rationale: 'Detects mass exfiltration attempts of proprietary engineering blueprints.' },
      { priority: 'P2 - STRATEGIC', control: 'Standardize disaster recovery automation to rebuild assembly lines from cold storage.', rationale: 'Guarantees rapid factory restart without paying extortion ransoms.' }
    ]
  },
  {
    id: 6,
    name: 'Technology, Cloud Infrastructure & SaaS',
    attack_percentage: 10.8,
    attack_count: 135,
    trend: '↑ 6%',
    risk_level: 'HIGH',
    primary_vector: 'CI/CD Pipeline Poisoning & Cloud IAM Token Theft',
    primary_threat_vectors: [
      'CI/CD Build Pipeline Poisoning & Source Code Tampering',
      'Open-Source Dependency Typosquatting & Backdooring (npm, PyPI)',
      'Cloud IAM Role Misconfiguration & Privilege Escalation',
      'Developer API Key & Secret Leakage on Public Repositories',
      'Zero-Day Exploits against DevOps Infrastructure (TeamCity, GitLab, Confluence)'
    ],
    top_adversaries: ['Lazarus (Zinc)', 'APT29 (Nobelium)', 'Scattered Spider', 'APT41 (Winnti)', 'Lapsus$ Group'],
    common_cves: ['CVE-2024-3094 (XZ Utils Backdoor)', 'CVE-2024-27198 (TeamCity Auth Bypass)', 'CVE-2023-44487 (HTTP/2 Rapid Reset)', 'CVE-2023-22515 (Confluence Auth Bypass)'],
    impact_summary: 'Downstream supply chain compromises impacting thousands of tenant enterprise customers, theft of source code intellectual property, unauthorized cryptocurrency mining on cloud GPU clusters, cloud service downtime.',
    recommended_defenses: [
      'Automated secret scanning integrated natively into pre-commit hooks and CI/CD pipelines',
      'Mandatory cryptographically signed commits (GPG/Sigstore) and enforced branch protection rules',
      'Least-privilege Cloud IAM policies using short-lived AWS STS/GCP temporary access tokens',
      'Automated Software Composition Analysis (SCA) blocking known vulnerable dependencies during build',
      'Enforced FIDO2 passkey MFA for all developer cloud consoles and code repositories'
    ],
    description: 'Technology companies, open-source maintainers, and cloud service providers are high-leverage targets because compromising a single developer identity or software release can grant adversaries access to thousands of downstream customer networks.',
    campaigns_count: 34,
    downtime_cost_per_hour: '$680,000 / hr (SaaS SLA breach penalties & enterprise customer churn)',
    regulatory_frameworks: ['SOC 2 Type II', 'ISO/IEC 27001', 'EU CRA (Cyber Resilience Act)', 'SLSA Framework (Supply-chain Levels for Software Artifacts)'],
    threat_landscape_analysis: 'The explosion of cloud-native development and complex microservice dependencies has shifted the primary attack vector to the software supply chain. Adversaries target third-party libraries, developer workstations, and continuous deployment pipelines to inject stealth backdoors prior to cryptographic code-signing.',
    real_world_case_studies: [
      {
        title: 'XZ Utils Multi-Year Open-Source Backdoor',
        victim: 'Global Linux Ecosystem (liblzma)',
        year: '2024',
        impact: 'Near-universal SSH authentication bypass averted days before mainstream enterprise distribution release.',
        root_cause: 'Nation-state persona (Jia Tan) gained project maintainer trust over 2+ years, injecting stealth test payload into tarballs.'
      },
      {
        title: 'CircleCI Customer Secret Exfiltration',
        victim: 'CircleCI DevOps Platform',
        year: '2023',
        impact: 'Thousands of enterprise customer AWS, GitHub, and production database API tokens compromised.',
        root_cause: 'Infostealer malware on a single engineer\'s laptop bypassed 2FA via session token theft.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Enable branch protection requiring 2+ peer approvals & signed commits.', rationale: 'Prevents a single compromised developer account from directly pushing malicious code to production.' },
      { priority: 'P0 - IMMEDIATE', control: 'Revoke all long-lived AWS IAM access keys in favor of short-lived OIDC roles.', rationale: 'Renders stolen developer credentials useless after 1 hour.' },
      { priority: 'P1 - HIGH', control: 'Run automated real-time secret detection on all code repositories.', rationale: 'Catches accidental private key and token commits before they are indexed by threat actor scrapers.' },
      { priority: 'P2 - STRATEGIC', control: 'Implement SLSA Level 3 reproducible build verifications across all pipelines.', rationale: 'Guarantees software binaries match source code without unauthorized build-server tampering.' }
    ]
  },
  {
    id: 7,
    name: 'Telecommunications, 5G & Internet Infrastructure',
    attack_percentage: 9.6,
    attack_count: 120,
    trend: '↑ 11%',
    risk_level: 'CRITICAL',
    primary_vector: 'Edge Gateway Exploitation & Core Signaling Eavesdropping',
    primary_threat_vectors: [
      'SS7 and Diameter Core Signaling Protocol Interception',
      'Edge Router & Carrier-Grade NAT (CGNAT) Firmware Compromise',
      'MESSAGETAP SMS & Voice Call Packet Sniffing',
      'SIM Swapping Operations against High-Value Subscribers',
      'DDoS Attacks Targeting DNS Root Nameservers & BGP Route Hijacking'
    ],
    top_adversaries: ['Salt Typhoon', 'Volt Typhoon', 'APT41 (Winnti)', 'Scattered Spider', 'APT29'],
    common_cves: ['CVE-2024-3400 (PAN-OS)', 'CVE-2023-4966 (Citrix)', 'CVE-2022-42475 (Fortinet)', 'CVE-2020-8597 (PPP Daemon RCE)'],
    impact_summary: 'Eavesdropping on senior government officials\' private phone calls and text messages, interception of SMS-based 2FA authentication codes, global routing redirection via BGP poisoning, widespread cellular blackout.',
    recommended_defenses: [
      'Implementation of SS7/Diameter signaling firewalls with strict geographic anomaly filtering',
      'Resource Public Key Infrastructure (RPKI) enforcement to prevent BGP route hijacking',
      'Firmware cryptographic attestation and memory integrity verification on core carrier routers',
      'Mandatory in-person biometric authorization for telecom subscriber SIM card reassignments',
      'End-to-end encryption enforced across internal carrier control plane communications'
    ],
    description: 'Telecommunications networks are the lifeblood of global digital communication. Nation-state intelligence agencies prioritize infiltrating telecom backbones to conduct covert wiretapping and track the geolocation of strategic targets.',
    campaigns_count: 19,
    downtime_cost_per_hour: '$950,000 / hr (Broadband outage liability & critical infrastructure communications loss)',
    regulatory_frameworks: ['FCC Cybersecurity Requirements', 'CALEA (Communications Assistance for Law Enforcement Act)', 'GSMA Security Guidelines', 'NIS2 Directive'],
    threat_landscape_analysis: 'Elite state-sponsored actors have repeatedly breached telecommunications providers worldwide to install custom network sniffers that intercept unencrypted SMS verification codes and lawful intercept audio streams. Telecom carriers face simultaneous threats from financially motivated SIM swappers targeting customer accounts.',
    real_world_case_studies: [
      {
        title: 'US Wiretap & Government Phone Interception',
        victim: 'Major US Telecom Providers (AT&T, Verizon, Lumen)',
        year: '2024',
        impact: 'Targeted interception of phone communications of presidential campaigns and national security officials.',
        root_cause: 'Salt Typhoon (Chinese state actor) compromised core carrier routing infrastructure and court-authorized wiretap portals.'
      },
      {
        title: 'MESSAGETAP SMS Carrier Eavesdropping',
        victim: 'Multiple Global Mobile Network Operators',
        year: '2019-2022',
        impact: 'Millions of SMS text messages searched in real-time for keywords matching political dissidents and foreign ministers.',
        root_cause: 'APT41 installed kernel-level MESSAGETAP sniffer software directly onto carrier SMSC gateway servers.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Enforce RPKI Route Origin Authorization on all carrier BGP peering routers.', rationale: 'Prevents malicious or accidental BGP hijacking that redirects internet traffic through foreign countries.' },
      { priority: 'P0 - IMMEDIATE', control: 'Mandate out-of-band multi-factor verification for all customer SIM swaps.', rationale: 'Stops cybercriminals from socially engineering call center employees to steal phone numbers.' },
      { priority: 'P1 - HIGH', control: 'Deploy signaling firewalls to inspect and block anomalous SS7/Diameter location queries.', rationale: 'Prevents foreign intelligence services from tracking mobile subscribers\' physical location via rogue inter-carrier requests.' },
      { priority: 'P2 - STRATEGIC', control: 'Establish continuous cryptographic firmware verification across all edge routers.', rationale: 'Detects persistent rootkits installed on boundary telecommunication equipment.' }
    ]
  },
  {
    id: 8,
    name: 'Transportation, Maritime Ports & Aviation Logistics',
    attack_percentage: 7.8,
    attack_count: 98,
    trend: '↑ 7%',
    risk_level: 'HIGH',
    primary_vector: 'Terminal Operating System (TOS) & Flight Reservation Hijacking',
    primary_threat_vectors: [
      'Terminal Operating System (TOS) & Automated Crane Hijacking',
      'Flight Dispatch & Global Distribution System (GDS) Reservation Disruption',
      'Automatic Identification System (AIS) & GPS/GNSS Spoofing',
      'Ransomware Halting Rail Cargo Switching & Tracking Systems',
      'Supply Chain Compromise of Aircraft Maintenance Telemetry Systems'
    ],
    top_adversaries: ['Volt Typhoon', 'LockBit 3.0', 'Sandworm', 'APT28', 'BlackCat (ALPHV)'],
    common_cves: ['CVE-2023-4966 (Citrix Bleed)', 'CVE-2023-34362 (MOVEit)', 'CVE-2024-21887 (Ivanti)', 'CVE-2023-27997 (FortiOS)'],
    impact_summary: 'Cargo container ship gridlock outside major maritime ports, grounding of commercial airline flights, derailment risks from compromised rail switching signals, massive supply chain food & industrial shortages.',
    recommended_defenses: [
      'Air-gapping and strict segmenting of Port Terminal Operating Systems (TOS) from public shipping portals',
      'Multi-band GNSS anti-spoofing antennas and inertial navigation backups for commercial vessels and aircraft',
      'Rapid automated network isolation triggers on port container scheduling database anomalies',
      'Mandatory cybersecurity audits for all third-party automated baggage and cargo handling vendors',
      'Immutable off-site backups for flight dispatch and aircraft maintenance compliance logs'
    ],
    description: 'Modern global commerce relies on precision timing across ports, rail networks, and airlines. Disrupting automated crane systems or flight planning software creates instant international supply bottlenecks.',
    campaigns_count: 16,
    downtime_cost_per_hour: '$600,000 / hr (Container demurrage, flight cancellation compensation & port gridlock)',
    regulatory_frameworks: ['IMO (International Maritime Organization) Cyber Risk Management', 'TSA Aviation Security Directives', 'FAA Aircraft Cyber Safety', 'NIS2 Directive'],
    threat_landscape_analysis: 'Maritime ports and airlines have rapidly automated their logistics using IoT container trackers, automated guided vehicles (AGVs), and cloud dispatch systems. State actors target ports for geopolitical pre-positioning, while ransomware gangs seek massive ransom payouts by paralyzing time-sensitive shipping lanes.',
    real_world_case_studies: [
      {
        title: 'Largest Japanese Maritime Port Cargo Gridlock',
        victim: 'Port of Nagoya (Handles 10% of Japan\'s trade)',
        year: '2023',
        impact: 'Complete halt of container processing for 3 days; Toyota parts shipping frozen across multiple assembly plants.',
        root_cause: 'LockBit 3.0 ransomware infection of the Nagoya Port Unified Terminal Operating System (NUTS).'
      },
      {
        title: 'Global Shipping Fleet Terminal Sabotage',
        victim: 'A.P. Moller - Maersk',
        year: '2017',
        impact: '76 port terminals worldwide completely disabled; $300M in losses; 800+ servers and 50,000 PCs destroyed in minutes.',
        root_cause: 'Collateral damage from Sandworm\'s NotPetya automated supply chain worm via Ukrainian accounting software.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Isolate Terminal Operating System (TOS) databases behind air-gapped security boundaries.', rationale: 'Guarantees container loading cranes continue operating even if corporate email systems are hit by ransomware.' },
      { priority: 'P0 - IMMEDIATE', control: 'Deploy anti-spoofing GNSS time synchronization receivers on dispatch systems.', rationale: 'Prevents electronic warfare spoofing attacks from disrupting maritime and aviation scheduling.' },
      { priority: 'P1 - HIGH', control: 'Enforce strict vulnerability scanning and MFA on all remote ship-to-shore satellite links.', rationale: 'Secures satellite VSAT terminals on commercial vessels from being used as pivot points into corporate networks.' },
      { priority: 'P2 - STRATEGIC', control: 'Maintain manual paper fallback protocols for port gate operations.', rationale: 'Ensures truck drivers can continue moving critical perishable food cargo during digital system outages.' }
    ]
  },
  {
    id: 9,
    name: 'Retail, E-Commerce & Payment Gateways',
    attack_percentage: 5.5,
    attack_count: 69,
    trend: '↓ 3%',
    risk_level: 'MEDIUM',
    primary_vector: 'Magecart Digital Skimming & Automated Bot Checkout Raids',
    primary_threat_vectors: [
      'Magecart JavaScript Digital Skimming on Checkout Pages',
      'High-Volume Credential Stuffing & Gift Card Balance Draining Bots',
      'Point-of-Sale (PoS) Memory Scraping Malware',
      'DDoS Extortion Campaigns during Black Friday / Cyber Monday Peak Sales',
      'Third-Party E-Commerce Plugin & Shopify/Magento Exploits'
    ],
    top_adversaries: ['Magecart Group 8', 'FIN7', 'TA505', 'Snatch Ransomware', 'Scattered Spider'],
    common_cves: ['CVE-2023-3824 (PHP Buffer Overflow)', 'CVE-2024-20767 (Adobe ColdFusion / Magento)', 'CVE-2023-22515 (Confluence)', 'CVE-2022-26134 (Confluence)'],
    impact_summary: 'Theft of millions of consumer payment card numbers (PAN/CVV) directly from web browsers, massive class-action consumer lawsuits, severe PCI-DSS non-compliance fines and merchant card processing revocation.',
    recommended_defenses: [
      'Strict Content Security Policy (CSP) headers and Subresource Integrity (SRI) on all checkout scripts',
      'Full end-to-end tokenization ensuring raw credit card numbers never touch merchant web servers',
      'AI-driven bot mitigation and CAPTCHA rate-limiting on user login and gift card verification portals',
      'Continuous automated scanning of all third-party analytics and marketing scripts for unauthorized DOM modifications',
      'Payment Card Industry Data Security Standard (PCI-DSS v4.0) strict compliance attestation'
    ],
    description: 'Retail platforms process high volumes of consumer credit cards and personal identities, attracting digital skimming syndicates that inject invisible malicious JavaScript into shopping cart checkout flows.',
    campaigns_count: 12,
    downtime_cost_per_hour: '$380,000 / hr (Lost sales volume during peak e-commerce seasons)',
    regulatory_frameworks: ['PCI-DSS v4.0', 'GDPR', 'CCPA (California Consumer Privacy Act)', 'FTC Safeguards Rule'],
    threat_landscape_analysis: 'E-commerce websites rely on dozens of third-party JavaScript libraries for analytics, live chat, tag management, and marketing retargeting. Cybercriminals compromise these third-party marketing vendors to inject malicious skimmers that siphon customers\' credit card numbers directly from browser form fields without ever touching the merchant\'s backend server.',
    real_world_case_studies: [
      {
        title: 'British Airways Magecart Digital Skimming Breach',
        victim: 'British Airways E-Commerce Portal & Mobile App',
        year: '2018',
        impact: '380,000 customer payment cards stolen; £20M ($26M) GDPR fine levied by UK ICO.',
        root_cause: 'Adversaries modified 22 lines of JavaScript in an unmonitored Modernizr library hosted on the BA checkout server.'
      },
      {
        title: 'Mailing Weaponized USB Gift Cards to Retail Executives',
        victim: 'Major US Retail & Restaurant Chains',
        year: '2020-2022',
        impact: 'Millions of customer credit cards scraped from Point-of-Sale networks.',
        root_cause: 'FIN7 mailed physical BadUSB drives disguised as Best Buy customer loyalty rewards to retail executives.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Implement Subresource Integrity (SRI) tags on all external JavaScript scripts.', rationale: 'Prevents browsers from executing modified or tampered third-party scripts on checkout pages.' },
      { priority: 'P0 - IMMEDIATE', control: 'Enforce strict CSP (Content-Security-Policy) script-src and connect-src rules.', rationale: 'Stops malicious digital skimmers from transmitting exfiltrated credit cards to unauthorized attacker domains.' },
      { priority: 'P1 - HIGH', control: 'Deploy behavioral bot protection on login, registration, and promo code APIs.', rationale: 'Blocks automated credential-stuffing attacks and inventory-scalping bots.' },
      { priority: 'P2 - STRATEGIC', control: 'Migrate all payment capture fields to hosted iframe tokenization fields.', rationale: 'Eliminates merchant PCI-DSS liability by keeping raw PAN data completely off merchant servers.' }
    ]
  },
  {
    id: 10,
    name: 'Water Utilities & Municipal Infrastructure',
    attack_percentage: 4.9,
    attack_count: 62,
    trend: '↑ 22%',
    risk_level: 'CRITICAL',
    primary_vector: 'Exposed PLC Human-Machine Interfaces (HMIs) & Default Credentials',
    primary_threat_vectors: [
      'Direct Exposure of Unitronics/Siemens PLCs to the Public Internet',
      'Unauthorized Chemical Dosing Alteration via Unauthenticated HMIs',
      'Ransomware Halting Municipal Wastewater Pumping Stations',
      'Brute-Forcing of Legacy VNC/RDP Remote Management Terminals',
      'Compromise of Regional Municipal Supervisory Control (SCADA) Links'
    ],
    top_adversaries: ['Volt Typhoon', 'CyberAv3ngers (Iran IRGC-affiliated)', 'Sandworm', 'LockBit 3.0'],
    common_cves: ['CVE-2023-6448 (Unitronics PCOM Insecure Protocol)', 'CVE-2022-46805 (Ivanti)', 'CVE-2021-34527 (PrintNightmare)', 'CVE-2020-0796 (SMBGhost)'],
    impact_summary: 'Tampering with public drinking water chemical treatment levels (lye/chlorine), wastewater overflows contaminating regional water tables, loss of pressure monitoring for municipal fire hydrants.',
    recommended_defenses: [
      'Immediate disconnection of all water treatment PLCs, RTUs, and HMIs from direct public internet exposure',
      'Mandatory changing of all factory default administrative passwords on programmable logic controllers',
      'Hardware-enforced physical chemical dosing limiters that cannot be overridden by software commands',
      'Cellular and VPN isolation with strict IP whitelisting for remote municipal water engineer access',
      'Continuous EPA-mandated cybersecurity assessments under the Safe Drinking Water Act (SDWA)'
    ],
    description: 'Municipal drinking water and wastewater treatment facilities provide essential public health services but frequently operate on constrained municipal budgets with minimal dedicated cybersecurity staff.',
    campaigns_count: 15,
    downtime_cost_per_hour: '$310,000 / hr (Boil water notices, emergency water distribution & toxic chemical neutralization)',
    regulatory_frameworks: ['EPA Safe Drinking Water Act (SDWA 1433)', 'CISA Water Sector Cybersecurity Performance Goals', 'NIST CSF'],
    threat_landscape_analysis: 'Thousands of small-to-medium municipal water treatment plants utilize Israeli-made Unitronics Programmable Logic Controllers (PLCs) with built-in web servers connected directly to cellular modems with default manufacturer passwords (\'1111\'). Geopolitical threat actors actively scan the global internet using Shodan and Censys to hijack these water pumps.',
    real_world_case_studies: [
      {
        title: 'Municipal Water Authority PLC Hijacking',
        victim: 'Municipal Authority of West View Water Authority (Pennsylvania)',
        year: '2023',
        impact: 'Water pressure pump controller hijacked by Iranian state group (CyberAv3ngers); forced immediate manual emergency operations.',
        root_cause: 'Unitronics PLC was directly accessible on the public internet using default factory administrative password.'
      },
      {
        title: 'Water Treatment Chemical Dosing Tampering Attempt',
        victim: 'Oldsmar Water Treatment Facility (Florida)',
        year: '2021',
        impact: 'Intruder raised sodium hydroxide (lye) levels from 100 ppm to a toxic 11,100 ppm before an alert plant operator intervened.',
        root_cause: 'Compromised TeamViewer remote access software running on an unpatched Windows 7 HMI computer.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Remove every water pump PLC and HMI from direct public internet exposure.', rationale: 'Instantly eliminates 100% of automated opportunistic state-sponsored scanner attacks.' },
      { priority: 'P0 - IMMEDIATE', control: 'Install physical mechanical chemical dosing limiters on pumps.', rationale: 'Physically prevents toxic chemical overdosing regardless of any software or PLC command tampering.' },
      { priority: 'P1 - HIGH', control: 'Change all manufacturer default passwords on every industrial controller.', rationale: 'Blocks automated credential dictionary attacks targeting default Unitronics/Siemens credentials.' },
      { priority: 'P2 - STRATEGIC', control: 'Enforce MFA and VPN tunneling for all remote water engineer maintenance sessions.', rationale: 'Prevents unauthorized remote desktop hijacking of municipal water supervisory computers.' }
    ]
  },
  {
    id: 11,
    name: 'Higher Education, Research Universities & Scientific Laboratories',
    attack_percentage: 4.1,
    attack_count: 52,
    trend: '↑ 12%',
    risk_level: 'HIGH',
    primary_vector: 'Academic Phishing, VPN Credential Compromise & Research IP Theft',
    primary_threat_vectors: [
      'Spear-Phishing of University Professors & Dual-Appointment Researchers',
      'Unauthenticated Research Cluster & Supercomputing SSH Access',
      'Ransomware Encryption of Campus Enrollment & Financial Aid Systems',
      'Bring Your Own Device (BYOD) Campus Network Lateral Traversals',
      'State-Sponsored Academic Espionage Targeting Quantum & AI Blueprints'
    ],
    top_adversaries: ['Mabna Institute (Cobalt Mirage)', 'APT41 (Wicked Panda)', 'Charming Kitten', 'Lazarus Group', 'Vice Society'],
    common_cves: ['CVE-2023-3519 (Citrix ADC)', 'CVE-2022-26134 (Confluence)', 'CVE-2021-44228 (Log4Shell)', 'CVE-2023-4966 (Citrix Bleed)'],
    impact_summary: 'Theft of multi-million dollar grant research (quantum computing, mRNA therapeutics, hypersonic aerodynamics), campus-wide cancellation of lectures and exams, dark web leakage of student social security and financial aid records.',
    recommended_defenses: [
      'Mandatory FIDO2/Duo MFA for all faculty, student, and research portal logins',
      'Strict isolation of high-performance computing (HPC) research clusters from general campus Wi-Fi networks',
      'Automated egress data loss prevention (DLP) inspecting outbound transfers from research laboratories',
      'Continuous identity lifecycle management automatically revoking access upon student graduation or faculty departure',
      'NIST SP 800-171 compliance attestation for all defense-funded university research labs'
    ],
    description: 'Universities foster open collaboration, high-bandwidth networks, and diverse BYOD devices, creating an exceptionally permeable attack surface for state espionage groups seeking defense research.',
    campaigns_count: 18,
    downtime_cost_per_hour: '$240,000 / hr (Research grant forfeiture, academic disruption & FERPA penalties)',
    regulatory_frameworks: ['FERPA', 'NIST SP 800-171 (CUI Defense Grants)', 'GLBA (Student Financial Services)', 'EU GDPR'],
    threat_landscape_analysis: 'Foreign intelligence services specifically target university laboratories conducting cutting-edge dual-use research in semiconductors, artificial intelligence, and aerospace. Ransomware gangs simultaneously exploit decentralized campus IT departments to extort universities during semester start periods.',
    real_world_case_studies: [
      {
        title: 'State-Sponsored Global University Credential Campaign',
        victim: '300+ Universities Worldwide (Mabna Institute)',
        impact: '31 terabytes of academic research, dissertations, and journal manuscripts stolen; $3B+ in intellectual value exfiltrated.',
        attack_chain: 'Targeted professors with emails disguised as fellow academics -> led to cloned university SSO login pages -> accessed research portals.'
      },
      {
        title: 'Major University Health Science Ransomware Extortion',
        victim: 'University of California San Francisco (UCSF)',
        impact: '$1.14M ransom paid in Bitcoin to recover encrypted COVID-19 medical research data.',
        attack_chain: 'NetWalker ransomware gained access via unpatched edge VPN -> quickly traversed academic subnets to encrypt backup servers.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Enforce MFA across all university SSO portals without exclusion for legacy protocols.', rationale: 'Prevents credential harvesting from compromising access to university email and grading databases.' },
      { priority: 'P0 - IMMEDIATE', control: 'Segment high-performance computing (HPC) research labs into dedicated Zero Trust enclaves.', rationale: 'Ensures a compromised student dorm PC cannot communicate with classified research servers.' },
      { priority: 'P1 - HIGH', control: 'Deploy automated cloud storage DLP to monitor bulk downloads of research data.', rationale: 'Detects unauthorized exfiltration of intellectual property to foreign cloud repositories.' },
      { priority: 'P2 - STRATEGIC', control: 'Implement NIST SP 800-171 security controls across all government-funded research departments.', rationale: 'Guarantees cybersecurity compliance required for federal research grant funding.' }
    ]
  },
  {
    id: 12,
    name: 'Cryptocurrency, Web3 & Decentralized Finance (DeFi)',
    attack_percentage: 3.8,
    attack_count: 48,
    trend: '↑ 28%',
    risk_level: 'CRITICAL',
    primary_vector: 'Smart Contract Logic Exploits, Private Key Theft & Flash Loan Attacks',
    primary_threat_vectors: [
      'Smart Contract Reentrancy & Oracle Price Manipulation (Flash Loans)',
      'Cross-Chain Bridge Validator Multi-Signature Key Theft',
      'Developer Laptop Compromise via Malicious npm/PyPI Packages',
      'Trojanized Web3 Wallet Extensions & Fake Frontend DNS Hijacks',
      'Automated AI-Driven Smart Contract Fuzzing & Exploit Bot Swarms'
    ],
    top_adversaries: ['Lazarus Group (BlueNoroff)', 'Kimsuky', 'Scattered Spider', 'Decentralized Exploit Syndicates'],
    common_cves: ['CVE-2023-4863 (libwebp Buffer Overflow)', 'CVE-2022-41352 (Zimbra)', 'CVE-2024-3094 (XZ Utils)', 'CVE-2023-42793 (TeamCity)'],
    impact_summary: 'Instant irreversible loss of hundreds of millions in digital assets within seconds, protocol liquidity insolvency, immediate total collapse of governance token market value, catastrophic user trust destruction.',
    recommended_defenses: [
      'Multi-party computation (MPC) and hardware cold-storage isolation with timelocked multi-sig thresholds for all treasury vaults',
      'Mandatory dual independent smart contract formal audits and continuous bug bounty coverage on Immunefi',
      'Decentralized Chainlink/Pyth oracle aggregation with TWAP filters to prevent flash loan price distortion',
      'Application sandboxing and continuous repository dependency verification for core smart contract developer workstations',
      'Real-time automated transaction pausability and circuit-breaker smart contracts on anomalous TVL outflows'
    ],
    description: 'Web3 protocols manage billions of dollars in publicly inspectable open-source code with instant settlement finality. A single logic vulnerability or compromised private key leads to irreversible asset extraction.',
    campaigns_count: 25,
    downtime_cost_per_hour: '$1,800,000 / hr (Unstoppable on-chain liquidity drain & total token market capitalization wipeout)',
    regulatory_frameworks: ['FATF Travel Rule', 'EU MiCA (Markets in Crypto-Assets)', 'CFTC/SEC Digital Asset Guidance', 'FinCEN AML Directives'],
    threat_landscape_analysis: 'State-sponsored cyber units (principally North Korea\'s Lazarus Group) dedicate specialized teams of reverse-engineers and smart contract auditors to locate 0-day flaws in cross-chain bridges and decentralized exchanges. Assets stolen on-chain are swiftly routed through decentralized mixers (Tornado Cash), cross-chain bridges, and OTC fiat off-ramps.',
    real_world_case_studies: [
      {
        title: 'Cross-Chain Bridge Validator Compromise',
        victim: 'Ronin Bridge (Sky Mavis / Axie Infinity)',
        impact: '$620 million in ETH and USDC drained; largest decentralized theft in history.',
        attack_chain: 'Spear-phished engineer with fake PDF job lure -> compromised 4 private keys -> accessed 1 RPC DAO key -> forged fraudulent withdrawal transactions.'
      },
      {
        title: 'Euler Finance Flash Loan Oracle Exploitation',
        victim: 'Euler Finance Lending Protocol',
        impact: '$197 million extracted via donation mechanism vulnerability in smart contract code.',
        attack_chain: 'Exploited flawed reserve balance check in eToken donation function -> minted unbacked leveraged debt -> drained lending pools.'
      }
    ],
    defense_hardening_checklist: [
      { priority: 'P0 - IMMEDIATE', control: 'Implement MPC (Multi-Party Computation) and mandatory 48-hour timelocks on bridge contracts.', rationale: 'Prevents immediate asset drainage even if individual validator keys are compromised.' },
      { priority: 'P0 - IMMEDIATE', control: 'Deploy automated on-chain circuit breakers that pause transactions if outflows exceed 10% of TVL.', rationale: 'Caps total loss potential during zero-day smart contract exploitation.' },
      { priority: 'P1 - HIGH', control: 'Require formal verification and automated static analysis on all smart contract deployments.', rationale: 'Mathematically proves the correctness of token balance checks and authorization logic.' },
      { priority: 'P2 - STRATEGIC', control: 'Enforce strict hardware-isolated workstations for all developers with smart contract upgrade keys.', rationale: 'Immunizes core protocol deployers against spear-phishing and npm dependency supply chain attacks.' }
    ]
  }
]

let cachedIndustries: IndustryTarget[] | null = null

export const industriesService = {
  getCachedOrInitial(): IndustryTarget[] {
    return cachedIndustries && cachedIndustries.length > 0 ? cachedIndustries : INITIAL_INDUSTRIES_DATA
  },

  hasCache(): boolean {
    return !!cachedIndustries && cachedIndustries.length > 0
  },

  async getTargetedIndustries(): Promise<IndustryTarget[]> {
    try {
      const response = await api.get('/api/threat-intelligence/industries', { timeout: 4000 })
      if (Array.isArray(response.data) && response.data.length > 0) {
        cachedIndustries = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for industries, using fast preloaded telemetry dataset:', error)
    }
    return industriesService.getCachedOrInitial()
  },
}

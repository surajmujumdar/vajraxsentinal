import api from './auth.service'

export interface MitreTechnique {
  id: string
  name: string
  tactic: string
  description: string
}

export interface IncidentCase {
  year: string
  victim: string
  impact: string
  attack_chain: string
}

export interface ThreatActor {
  id: number
  name: string
  aliases?: string[]
  activity_level: string
  attacks_count?: number
  attack_count?: number
  last_seen: string
  country: string
  attribution: string
  first_seen: string
  targeted_regions?: string[]
  motivations: string
  capabilities: string
  targeted_sectors?: string[]
  targets?: string[]
  techniques: string
  notable_incidents: string
  defenses: string
  description: string
  additional_description?: string
  c2_infrastructure?: string
  yara_rule_guidance?: string
  malware_tools?: string[]
  weaponized_cves?: string[]
  mitre_matrix?: MitreTechnique[]
  incident_cases?: IncidentCase[]
}

export const INITIAL_ACTORS_DATA: ThreatActor[] = [
  {
    id: 1,
    name: 'APT29 (Cozy Bear / Midnight Blizzard)',
    aliases: ['Nobelium', 'Midnight Blizzard', 'The Dukes', 'Cloaked Ursa', 'UNC2452', 'YTTRIUM'],
    activity_level: 'CRITICAL',
    attacks_count: 248,
    last_seen: '18 mins ago',
    country: 'Russia',
    attribution: 'Russian Foreign Intelligence Service (SVR) - Center 16 / Special Technology Center & 85th GTsSS',
    first_seen: '2008',
    targeted_regions: ['North America', 'European Union', 'NATO Member States', 'Asia-Pacific Diplomatic Missions'],
    motivations: 'Geopolitical cyber espionage, long-term foreign intelligence collection, diplomatic policy surveillance, Western strategic defense intelligence forecasting, and intelligence on policy negotiations.',
    capabilities: 'Zero-day exploitation, custom stealth implants (WellMess, GoldFinder, MagicWeb, EnvyScout), software supply chain tampering, cloud identity (Entra ID / Azure AD) and OAuth application token compromise, dormant administrative account reactivation, Active Directory Federation Services (ADFS) Golden SAML token forgery, residential proxy network pivoting, and living-off-the-cloud techniques.',
    targeted_sectors: ['Government & Foreign Ministries', 'Defense Industrial Base', 'Diplomatic Corps', 'Healthcare & Life Sciences', 'Think Tanks & Policy Institutes', 'Cloud Service Providers & IT Supply Chain'],
    targets: ['Government', 'Healthcare', 'Defense', 'Diplomatic', 'Think Tanks', 'Cloud Providers'],
    techniques: 'Spear-phishing attachments (T1566.001), Living-off-the-land (T1059), Active Directory lateral movement (T1003), Golden SAML token forgery (T1606.002), Web shell persistence (T1505), OAuth application abuse (T1098), Domain trust manipulation (T1484), Token theft via Session Hijacking (T1539)',
    notable_incidents: '2020 SolarWinds Orion software supply chain compromise injecting the Sunburst backdoor into 18,000+ public and private organizations globally; 2021 Democratic National Committee & US federal agency intrusions; 2023 NATO summit diplomatic credential harvesting campaigns; 2024 Microsoft corporate executive email & source code repository exfiltration via automated password spraying against legacy non-production test tenants.',
    defenses: 'Mandatory FIDO2 hardware Multi-Factor Authentication (passkeys), complete elimination of legacy authentication protocols (Basic Auth/POP3/IMAP), comprehensive auditing and least-privilege scoping of Azure AD / Entra ID OAuth application consents, continuous EDR telemetry inspection for memory injection, elimination of standing administrative privileges via PIM/PAM, and Zero Trust network microsegmentation.',
    description: 'APT29 (Cozy Bear / Midnight Blizzard) is the primary cyber espionage syndicate operated by Russia\'s Foreign Intelligence Service (SVR). Active for over 15 years, they specialize in ultra-stealthy, long-term clandestine intelligence gathering targeting Western governments, diplomatic missions, and core technology supply chains.',
    additional_description: 'APT29 is renowned across the intelligence community for extraordinary operational discipline, patience, and technical precision. Unlike destructive threat groups, they prioritize staying invisible within target environments for years. They pioneered groundbreaking tradecraft in exploiting cloud identities, compromised OAuth enterprise applications, and enterprise supply chain software builds.',
    c2_infrastructure: 'Dynamic domain-generation algorithms (DGAs), multi-hop residential proxy chains, compromised WordPress sites, and legitimate cloud hosting platforms (Azure, AWS, Google Drive) used as dead-drop resolvers.',
    yara_rule_guidance: 'Detects MagicWeb and Sunburst DLL memory signatures, specifically looking for hooked ADFS authentication modules (Microsoft.IdentityServer.Servicehost) and custom base64-encoded XML payload structures.',
    malware_tools: ['Sunburst (Solorigate)', 'Teardrop', 'Raindrop', 'GoldFinder', 'GoldMax', 'MagicWeb', 'WellMess', 'WellMail', 'EnvyScout', 'Cobalt Strike', 'Mimikatz'],
    weaponized_cves: ['CVE-2023-38831 (WinRAR RCE)', 'CVE-2023-22515 (Confluence Auth Bypass)', 'CVE-2021-26855 (Exchange ProxyLogon)', 'CVE-2023-4966 (Citrix Bleed)'],
    incident_cases: [
      {
        year: '2020',
        victim: 'SolarWinds Orion Platform (Global Supply Chain)',
        impact: '18,000+ enterprise & government organizations backdoored; 9 US federal agencies compromised for 9+ months.',
        attack_chain: 'Infiltrated SolarWinds build environment -> injected Sunburst backdoor into signed DLLs -> distributed via legitimate software updates -> established stealth C2 via DNS subdomains.'
      },
      {
        year: '2024',
        victim: 'Microsoft Corporate Leadership & Security Teams',
        impact: 'Senior executive emails, cybersecurity communications, and select internal source code repositories accessed.',
        attack_chain: 'Password-sprayed legacy non-production test tenant -> pivoted into OAuth app with full Exchange Web Services permissions -> exfiltrated corporate mailboxes.'
      }
    ],
    mitre_matrix: [
      { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access', description: 'Delivers weaponized PDFs, ISO files, or password-protected archives containing custom droppers and LNK files.' },
      { id: 'T1195.002', name: 'Supply Chain Compromise', tactic: 'Initial Access', description: 'Modifies upstream software source builds (e.g., SolarWinds Orion) to distribute backdoors in signed binaries.' },
      { id: 'T1606.002', name: 'Golden SAML Token Forgery', tactic: 'Credential Access', description: 'Steals token-signing private keys from ADFS servers to forge valid SAML assertions and bypass all MFA.' },
      { id: 'T1098.005', name: 'Device Registration & OAuth Abuse', tactic: 'Persistence', description: 'Registers rogue devices and OAuth enterprise applications into Entra ID tenants to maintain access without user passwords.' },
      { id: 'T1059.001', name: 'PowerShell Execution', tactic: 'Execution', description: 'Executes obfuscated in-memory scripts that reflectively load stealth .NET assemblies without touching disk.' }
    ]
  },
  {
    id: 2,
    name: 'APT28 (Fancy Bear / Forest Blizzard)',
    aliases: ['Strontium', 'Forest Blizzard', 'Pawn Storm', 'Sednit', 'Sofacy', 'TGR-ETH-0004', 'FROZENLAKE'],
    activity_level: 'HIGH',
    attacks_count: 196,
    last_seen: '45 mins ago',
    country: 'Russia',
    attribution: 'Russian Military Intelligence (GRU) - 85th Main Special Service Center (Unit 26165 & Unit 74455)',
    first_seen: '2007',
    targeted_regions: ['United States', 'Ukraine', 'Eastern & Western Europe', 'NATO Member States', 'Caucasus Region'],
    motivations: 'Military intelligence collection, geopolitical disruption, psychological information warfare, hack-and-leak influence operations, and tactical battlefield cyber operations.',
    capabilities: 'Custom malware frameworks (X-Agent, Zebrocy, GooseEgg, Drovorub), CVE-2023-23397 Outlook zero-day weaponization, destructive wipers (HermeticWiper, CaddyWiper), high-volume credential brute-forcing, satellite terminal exploitation, and edge network appliance tunneling.',
    targeted_sectors: ['Defense & Military Contractors', 'Government Agencies', 'Energy & Critical Infrastructure', 'Media & Press Organizations', 'International NGOs & Think Tanks', 'Aviation & Logistics'],
    targets: ['Defense', 'Government', 'Energy', 'Aviation', 'Media', 'International NGOs'],
    techniques: 'Credential harvesting via fake OAuth login portals (T1056), Zero-day Outlook NTLM leakage (T1187), PowerShell reverse shells (T1059.001), Mimikatz memory dump (T1003), Edge router firmware persistence (T1542), Destructive wiping (T1485)',
    notable_incidents: "2015 French TV5Monde broadcast hijacking; 2016 US Democratic National Committee & World Anti-Doping Agency (WADA) hack-and-leak operations; 2018 PyeongChang Winter Olympics 'Olympic Destroyer' cyber sabotage; 2022 Ukrainian energy grid attacks; 2023-2024 European government Outlook zero-day exploits.",
    defenses: 'Block outbound SMB (port 445) at perimeter firewalls, enforce NTLM deprecation across Windows Active Directory, rapid patching of Microsoft Outlook (CVE-2023-23397), implement Kerberos Armoring (FAST), and deploy sandboxed inbound email payload detonation.',
    description: "APT28 (Fancy Bear / Forest Blizzard) is the military intelligence cyber warfare wing of Russia's GRU. They conduct aggressive cyber reconnaissance, destructive disruption, and large-scale information warfare operations worldwide.",
    additional_description: 'Unlike their civilian counterpart APT29, APT28 is characterized by speed, boldness, and a willingness to deploy destructive payloads when instructed. They actively target defense contractors, NATO logistics, and election infrastructure.',
    c2_infrastructure: 'Compromised edge routers (MikroTik, Ubiquiti), dynamic DNS domains mimicking European foreign ministries, and encrypted TOR hidden services.',
    yara_rule_guidance: 'Focuses on X-Agent and Zebrocy binary string tables, specifically targeting custom RC4 decryption routines and characteristic command dispatch loops.',
    malware_tools: ['X-Agent', 'Zebrocy', 'GooseEgg', 'Drovorub', 'SkinnyBoy', 'SourFace', 'Mimikatz', 'Seduploader', 'HermeticWiper'],
    weaponized_cves: ['CVE-2023-23397 (Microsoft Outlook NTLM)', 'CVE-2023-38831 (WinRAR)', 'CVE-2022-30190 (Follina MSDT)', 'CVE-2024-3400 (Palo Alto PAN-OS)'],
    incident_cases: [
      {
        year: '2016',
        victim: 'Democratic National Committee (DNC)',
        impact: 'Exfiltration of thousands of internal emails published to influence election discourse.',
        attack_chain: 'Spear-phishing email with malicious Google login clone -> harvested credentials -> deployed X-Agent backdoor -> exfiltrated 60k+ emails.'
      },
      {
        year: '2023',
        victim: 'European Foreign Ministries & Defense Agencies',
        impact: 'Systematic NTLM credential harvesting without user interaction.',
        attack_chain: 'Sent crafted Outlook calendar appointment with PidLidReminderFileParameter property -> triggered forced SMB auth to GRU server -> cracked NTLMv2 hashes.'
      }
    ],
    mitre_matrix: [
      { id: 'T1187', name: 'Forced Authentication', tactic: 'Credential Access', description: 'Sends specially crafted MAPI appointment properties in Outlook to force victim clients to authenticate against attacker SMB servers, leaking NTLMv2 hashes.' },
      { id: 'T1059.001', name: 'PowerShell Scripting', tactic: 'Execution', description: 'Uses obfuscated PowerShell scripts to inject memory-only implants and harvest system tokens.' },
      { id: 'T1485', name: 'Data Destruction', tactic: 'Impact', description: 'Deploys customized raw disk wipers to destroy MBRs and wipe enterprise file systems.' },
      { id: 'T1542.001', name: 'System Firmware Persistence', tactic: 'Persistence', description: 'Flashes trojanized firmware onto edge network routers and VPN concentrators.' }
    ]
  },
  {
    id: 3,
    name: 'Sandworm (Voodoo Bear / Unit 74455)',
    aliases: ['Seashell Blizzard', 'Ironside', 'TeleBots', 'BlackEnergy Group', 'Unit 74455', 'GTsST'],
    activity_level: 'CRITICAL',
    attacks_count: 182,
    last_seen: '1 hour ago',
    country: 'Russia',
    attribution: 'Russian Military Intelligence (GRU) - Unit 74455 (Main Center for Special Technologies)',
    first_seen: '2009',
    targeted_regions: ['Ukraine', 'United States', 'European Union', 'Global Maritime & Logistics'],
    motivations: 'Catastrophic physical infrastructure sabotage, electric power grid collapse, destructive malware proliferation, hybrid kinetic-cyber warfare, and election interference.',
    capabilities: 'ICS/SCADA protocol manipulation (IEC 60870-5-104, OPC DA, Modbus), custom industrial wipers (Industroyer, Industroyer2, AcidRain, CaddyWiper), automated destructive worms (NotPetya), fast edge device weaponization, and satellite modem firmware wiping.',
    targeted_sectors: ['Electric Power Grids', 'Critical Energy Infrastructure', 'Water Utilities', 'Rail & Transportation', 'Government Defense', 'Telecommunications'],
    targets: ['Electric Power', 'Energy', 'Water Utilities', 'Transportation', 'Government', 'Telecom'],
    techniques: 'Industrial control protocol hijacking (T0855), Supply chain injection via accounting software (T1195.002), MBR/VBR overwriting (T1561), Active Directory wipe automation (T1486), Edge device firmware bricking (T1495)',
    notable_incidents: '2015 & 2016 Ukrainian blackout cyberattacks (first confirmed cyber-induced electrical grid shutdowns in human history); 2017 NotPetya global destructive worm causing $10B+ in economic damage across Maersk, Merck, and FedEx; 2022 Viasat KA-SAT satellite communication sabotage during military invasion; 2023-2024 regional electrical sub-station attacks.',
    defenses: 'Strict physical and logical air-gapping of Operational Technology (OT/SCADA) networks following Purdue Model, out-of-band serial circuit breakers for grid telemetry, read-only unidirectional data diodes, immutable backup systems, and continuous industrial network traffic inspection.',
    description: "Sandworm is Russia's premier destructive cyber sabotage unit, responsible for the most damaging infrastructure attacks in history, including the first cyber-induced electrical grid blackouts and the NotPetya worm.",
    additional_description: 'Sandworm operates at the intersection of kinetic military operations and digital sabotage. They specialize in engineering custom malware that interacts directly with programmable logic controllers (PLCs) and substation protection relays.',
    c2_infrastructure: 'Dynamic mesh network built from compromised MikroTik routers (Cyclops Blink) and direct satellite uplink intercept nodes.',
    yara_rule_guidance: 'Detects Industroyer2 raw IEC-104 byte command construction and CaddyWiper kernel disk-overwrite routines targeting physical drives \\\\.\\PhysicalDrive0.',
    malware_tools: ['BlackEnergy', 'Industroyer (CrashOverride)', 'Industroyer2', 'NotPetya', 'HermeticWiper', 'AcidRain', 'Cyclops Blink', 'CaddyWiper', 'RoarBAT'],
    weaponized_cves: ['CVE-2023-46805 (Ivanti Connect Secure)', 'CVE-2022-26134 (Confluence)', 'CVE-2017-0144 (EternalBlue)', 'CVE-2020-0796 (SMBGhost)'],
    incident_cases: [
      {
        year: '2015-2016',
        victim: 'Ukrainian Regional Electrical Grid (Ukrenergo)',
        impact: '225,000+ civilians left in darkness; high-voltage transmission substation opened via remote SCADA commands.',
        attack_chain: 'Spear-phishing Word documents -> BlackEnergy3 implant -> harvested VPN credentials -> navigated to SCADA HMI -> executed custom Industroyer IEC-104 breaker open commands.'
      },
      {
        year: '2017',
        victim: 'Global Supply Chain & Logistics (Maersk, Merck, TNT)',
        impact: '$10B+ worldwide damage; thousands of maritime shipping containers frozen at ports globally.',
        attack_chain: 'Compromised Ukrainian accounting software update server (M.E.Doc) -> distributed NotPetya worm -> automated propagation via EternalBlue and PsExec -> permanent Master Boot Record encryption.'
      }
    ],
    mitre_matrix: [
      { id: 'T0855', name: 'Unauthorized Command Message', tactic: 'Inhibit Response Function', description: 'Sends rogue IEC 104 APDUs directly to substation Remote Terminal Units (RTUs) to open circuit breakers.' },
      { id: 'T1561.002', name: 'Disk Structure Wipe', tactic: 'Impact', description: 'Corrupts the Master Boot Record (MBR) and raw partition tables to render critical operating systems unbootable.' },
      { id: 'T1195.002', name: 'Supply Chain Compromise', tactic: 'Initial Access', description: 'Infiltrates trusted business accounting software updates to push zero-click wiper worms into corporate intranets.' }
    ]
  },
  {
    id: 4,
    name: 'Lazarus Group (HIDDEN COBRA / Lab 110)',
    aliases: ['Diamond Sleet', 'Zinc', 'Guardians of Peace', 'Labyrinth Chollima', 'APT38', 'AppleJeus', 'BlueNoroff', 'Andariel'],
    activity_level: 'CRITICAL',
    attacks_count: 324,
    last_seen: '12 mins ago',
    country: 'North Korea',
    attribution: 'Reconnaissance General Bureau (RGB) - 3rd Bureau (Technical Surveillance) & Lab 110',
    first_seen: '2009',
    targeted_regions: ['United States', 'South Korea', 'Japan', 'Global Web3 & DeFi Ecosystem', 'Southeast Asia'],
    motivations: 'State-directed cryptocurrency theft to fund sovereign weapons and nuclear programs, sanction evasion, strategic military and nuclear espionage, and destructive retaliation.',
    capabilities: 'Cross-platform malware (C++, Rust, Go, Swift for macOS), smart contract exploit analysis, social engineering via LinkedIn/Telegram job lures, open-source package registry poisoning (npm, PyPI), memory-only loaders, and direct SWIFT financial network manipulation.',
    targeted_sectors: ['Cryptocurrency & DeFi Platforms', 'Financial Services & Central Banks', 'Defense Aerospace & Missile Technology', 'Nuclear Research', 'Software Supply Chains'],
    targets: ['Cryptocurrency', 'Financial Services', 'Defense Aerospace', 'Nuclear', 'Software'],
    techniques: 'Trojanized developer interview tests (T1204.002), Compromised open-source packages (T1195.001), Multi-hop cryptocurrency mixing, Fast-flux C2 infrastructure (T1090), Memory-resident backdoors (T1055)',
    notable_incidents: '2014 Sony Pictures destructive wiper attack; 2016 Bangladesh Central Bank $81M SWIFT robbery; 2017 global WannaCry ransomware epidemic impacting 300,000+ computers; 2022 Axie Infinity Ronin Bridge $620M cryptocurrency drain; 2023 Atomic Wallet $100M theft and CoinEx $55M exploit.',
    defenses: 'Multi-signature hardware wallet signing with mandatory timelocks, application whitelisting on developer workstations, continuous npm/PyPI dependency signature verification, rigorous employee counter-phishing training against fake job offers, and strict developer sandbox execution.',
    description: "Lazarus Group is North Korea's premier state cyber apparatus, unique in its dual mandate of conducting massive billion-dollar financial heists to fund ballistic missile programs alongside strategic military espionage.",
    additional_description: 'Over the past decade, Lazarus has stolen an estimated $3.5+ billion in cryptocurrencies. They maintain specialized sub-units: APT38 (banking & SWIFT heists), Bluenoroff (crypto & Web3 funds), and Andariel (defense and nuclear espionage).',
    c2_infrastructure: 'Compromised third-party WordPress sites, WebSockets tunnels disguised as TLS, and decentralised IPFS nodes.',
    yara_rule_guidance: 'Detects AppleJeus cryptocurrency wallet-stealing binaries and Dtrack modular backdoor string encryption routines.',
    malware_tools: ['AppleJeus', 'FALLCHILL', 'HOPLIGHT', 'Brambul', 'WannaCry', 'Dtrack', 'Manuscrypt', 'RustBucket', 'KANDYKORN', 'Volgmer'],
    weaponized_cves: ['CVE-2023-4863 (libwebp Buffer Overflow)', 'CVE-2022-41352 (Zimbra RCE)', 'CVE-2021-44228 (Log4Shell)', 'CVE-2023-42793 (TeamCity)'],
    incident_cases: [
      {
        year: '2022',
        victim: 'Axie Infinity (Ronin Network Bridge)',
        impact: '$620 million in Ethereum and USDC drained in the largest single crypto theft in history.',
        attack_chain: 'Targeted Sky Mavis engineer with fake high-salary PDF job offer -> infected laptop with backdoor -> compromised 5 of 9 bridge validator private keys -> authorized fraudulent withdrawals.'
      },
      {
        year: '2016',
        victim: 'Bangladesh Central Bank',
        impact: '$81 million stolen via fraudulent Federal Reserve NY wire requests.',
        attack_chain: 'Infiltrated banking network via spear-phishing -> monitored SWIFT operators -> injected malware to intercept and manipulate SWIFT confirmation printouts -> initiated $951M in wire attempts.'
      }
    ],
    mitre_matrix: [
      { id: 'T1204.002', name: 'Malicious File Execution', tactic: 'Execution', description: 'Lures Web3/DeFi developers to clone malicious GitHub repos or run coding tests containing embedded infostealers.' },
      { id: 'T1195.001', name: 'Compromise Software Dependencies', tactic: 'Initial Access', description: 'Uploads malicious packages typosquatting popular open-source libraries into public package registries.' },
      { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access', description: 'Contacts engineers on LinkedIn and Telegram posing as recruiters, sending malicious coding assessments.' }
    ]
  },
  {
    id: 5,
    name: 'Volt Typhoon (VANGUARD PANDA / Dev-0391)',
    aliases: ['Bronze Silhouette', 'Insidious Taurus', 'Dev-0391', 'UNC3236', 'VOLT TYPHOON'],
    activity_level: 'CRITICAL',
    attacks_count: 142,
    last_seen: '35 mins ago',
    country: 'China',
    attribution: 'Chinese Ministry of State Security (MSS) / PLA Strategic Support Force',
    first_seen: '2021',
    targeted_regions: ['United States (Guam, Continental US)', 'Pacific Rim Alliances', 'Taiwan'],
    motivations: 'Strategic pre-positioning inside Western critical infrastructure to enable disruptive cyber attacks during a geopolitical crisis or armed conflict (e.g. Taiwan contingency).',
    capabilities: 'Zero-footprint Living-off-the-Land (LotL), SOHO router botnet proxying (KV-Botnet), stolen administrator credential abuse, multi-year stealth persistence, zero custom binary disk writes, and native Windows command execution.',
    targeted_sectors: ['Critical Infrastructure', 'Water Treatment Utilities', 'Electrical Power Grids', 'Maritime Ports & Logistics', 'Telecommunications', 'Aviation & Air Traffic Control'],
    targets: ['Critical Infrastructure', 'Water Utilities', 'Electrical Grid', 'Ports', 'Telecom', 'Transportation'],
    techniques: 'Native Windows binary execution (powershell, wmic, ntdsutil, netsh) (T1059), Compromise of end-of-life SOHO routers for covert C2 proxying (T1090), Zero-footprint Active Directory dumping (T1003.003), Web shell stealth tunnels',
    notable_incidents: '2023 Discovery of deep pre-positioning inside critical infrastructure on Guam (US military Pacific hub); 2024 CISA/FBI advisory confirming ongoing undetected access inside major US drinking water systems, regional electrical distribution nodes, and pipeline control centers.',
    defenses: 'Comprehensive baseline behavioral monitoring of administrative utilities (ntdsutil, wmic, netsh), immediate replacement of end-of-life edge SOHO routers and firewalls, out-of-band management network isolation, comprehensive credential revocation upon any perimeter breach, and strict MFA.',
    description: 'Volt Typhoon is an elite Chinese state cyber operation whose mission differs fundamentally from classic espionage: they seek deep, quiet pre-positioning inside Western critical infrastructure to enable physical disruption during conflict.',
    additional_description: 'Volt Typhoon is notoriously difficult to detect because they almost never write custom malware binaries to victim disks. They operate entirely in memory using native operating system binaries (Living-off-the-Land) and route commands through compromised home/office routers.',
    c2_infrastructure: 'KV-Botnet mesh comprised of compromised Cisco RV, Netgear ProSafe, and DrayTek routers located in the same geographic metropolitan areas as target victims.',
    yara_rule_guidance: 'Detects specific fast-reverse-proxy (FRP) and Earthworm configuration artifacts and ntdsutil AD snapshot extraction script commands.',
    malware_tools: ['KV-Botnet (Proxy Mesh)', 'FastReverseProxy (FRP)', 'Earthworm', 'Mimikatz', 'Ntdsutil', 'Custom Web Shells'],
    weaponized_cves: ['CVE-2024-21887 (Ivanti Connect Secure)', 'CVE-2023-46805 (Ivanti Web)', 'CVE-2023-27997 (FortiOS SSL-VPN)', 'CVE-2022-42475 (FortiOS)'],
    incident_cases: [
      {
        year: '2023-2024',
        victim: 'US Strategic Military Pacific Hub (Guam Utilities)',
        impact: 'Covert persistent access established into power, water, and telecommunications routing networks.',
        attack_chain: 'Exploited zero-day flaw in edge Fortinet/Ivanti appliances -> dumped Active Directory NTDS.dit via living-off-the-land -> proxied traffic via local SOHO routers.'
      }
    ],
    mitre_matrix: [
      { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution', description: 'Relies entirely on native Windows commands (wmic, netsh, powershell) to query system architecture without triggering antivirus.' },
      { id: 'T1090.002', name: 'External Proxy Network', tactic: 'Command and Control', description: 'Routes all C2 traffic through compromised Cisco, Netgear, and DrayTek SOHO routers across North America to blend in with domestic traffic.' },
      { id: 'T1003.003', name: 'NTDS Extraction', tactic: 'Credential Access', description: 'Uses built-in ntdsutil.exe utility to create Active Directory database snapshots and extract domain password hashes.' }
    ]
  },
  {
    id: 6,
    name: 'APT41 (Double Dragon / Wicked Panda)',
    aliases: ['Wicked Panda', 'Winnti Group', 'Barium', 'Axiom', 'Blackfly', 'Brass Typhoon', 'Red Kelpie'],
    activity_level: 'CRITICAL',
    attacks_count: 275,
    last_seen: '1 hour ago',
    country: 'China',
    attribution: 'Chinese Ministry of State Security (MSS) - Chengdu 404 front company',
    first_seen: '2012',
    targeted_regions: ['Global', 'United States', 'Taiwan', 'Japan', 'European Union', 'India'],
    motivations: 'State-directed cyber espionage (intellectual property, telecommunications metadata, healthcare research) alongside financially motivated cybercrime for personal illicit enrichment.',
    capabilities: 'Software supply chain injection, digital code-signing certificate theft, bootkit/rootkit deployment, cross-platform C++ implants, telecommunications SMS eavesdropping (MESSAGETAP), rapid zero-day weaponization, and cloud API abuse.',
    targeted_sectors: ['Telecommunications', 'Gaming & Digital Entertainment', 'Healthcare & Biotechnology', 'Higher Education & Research', 'Software Vendors', 'Government'],
    targets: ['Telecom', 'Gaming', 'Healthcare', 'Higher Education', 'Software Supply Chain', 'Government'],
    techniques: 'Supply chain compromise via build systems (T1195.002), Digital certificate theft for code signing (T1553.002), Telecom SMS packet interception (T1040), Web server deserialization exploitation (T1190)',
    notable_incidents: 'CCleaner software supply chain compromise reaching 2.2 million devices; ASUS LiveUpdate trojanized utility update (ShadowHammer); Telecommunications telco core compromise intercepting high-value SMS traffic; 2022 US state government network breaches exploiting Log4j.',
    defenses: 'Cryptographic build verification and reproducible builds for software pipelines, Hardware Security Module (HSM) protection for code-signing certificates, network egress monitoring on server clusters, and real-time SMS gateway audit logging.',
    description: 'APT41 (Double Dragon / Wicked Panda) is a prolific Chinese state-sponsored threat group unique for conducting both state-sanctioned espionage and unauthorized financial crime operations simultaneously.',
    additional_description: 'APT41 operates with exceptional speed and technical sophistication. They are notorious for compromising software vendors\' build environments, hijacking legitimate update mechanisms, and deploying sophisticated rootkits.',
    c2_infrastructure: 'Global network of cloud virtual servers, compromised web servers running custom ASPX backdoors, and dead-drop GitHub profile resolvers.',
    yara_rule_guidance: 'Targets MESSAGETAP memory structure signatures and Crosswalk backdoor payload loader decompression stubs.',
    malware_tools: ['MESSAGETAP', 'Winnti', 'Crosswalk', 'Cobalt Strike', 'ShadowPad', 'HighNotes', 'DustPanic', 'Spyder', 'LOWKEY'],
    weaponized_cves: ['CVE-2021-44228 (Log4j)', 'CVE-2020-10189 (Zoho ManageEngine)', 'CVE-2019-19781 (Citrix ADC)', 'CVE-2023-38831 (WinRAR)'],
    incident_cases: [
      {
        year: '2019',
        victim: 'ASUS LiveUpdate Utility (ShadowHammer)',
        impact: '1 million+ ASUS computer users distributed backdoored updates; 600 specific MAC addresses targeted.',
        attack_chain: 'Stole ASUS code-signing certificates -> modified LiveUpdate binary -> pushed update through legitimate ASUS cloud servers.'
      }
    ],
    mitre_matrix: [
      { id: 'T1195.002', name: 'Supply Chain Compromise', tactic: 'Initial Access', description: 'Infiltrates software vendor development environments to insert backdoors into digitally signed product updates.' },
      { id: 'T1040', name: 'Network Sniffing', tactic: 'Credential Access', description: 'Installs MESSAGETAP on telecommunications SMS gateways to filter and record text messages of high-value political targets.' },
      { id: 'T1553.002', name: 'Code Signing', tactic: 'Defense Evasion', description: 'Signs malicious backdoors with stolen legitimate digital certificates from software and video game developers.' }
    ]
  },
  {
    id: 7,
    name: 'LockBit 3.0 (LockBit Black / Green)',
    aliases: ['LockBit Gang', 'Bitwise Spider', 'ABCD Ransomware', 'LockBit Green', 'LockBit 3.0 Black'],
    activity_level: 'CRITICAL',
    attacks_count: 482,
    last_seen: '8 mins ago',
    country: 'Transnational / Eastern Europe',
    attribution: 'Financially motivated Ransomware-as-a-Service (RaaS) Cartel',
    first_seen: '2019',
    targeted_regions: ['Global (120+ Countries)', 'United States', 'European Union', 'United Kingdom', 'Japan'],
    motivations: 'Multi-million dollar extortion, enterprise proprietary data theft & dark web auctioning, cryptocurrency ransom extraction, and brand extortion.',
    capabilities: 'Sub-5 minute automated network file encryption, custom StealBit high-speed multithreaded data exfiltration, automated Active Directory Group Policy (GPO) propagation, antivirus driver termination (BYOVD), and cross-platform VMware ESXi locker builds.',
    targeted_sectors: ['Healthcare & Hospitals', 'Manufacturing & Heavy Industry', 'Supply Chain & Logistics', 'Financial Services', 'Legal & Accounting', 'Municipal Government'],
    targets: ['Healthcare', 'Manufacturing', 'Supply Chain', 'Financial Services', 'Legal', 'Government'],
    techniques: 'Affiliate network distribution, Edge appliance exploitation (Citrix Bleed, Fortinet) (T1190), StealBit cloud exfiltration before encryption (T1567), Shadow copy & backup deletion (T1490), Bring Your Own Vulnerable Driver (T1068)',
    notable_incidents: '2022 Continental Automotive $50M extortion breach; 2023 UK Royal Mail international logistics blackout; 2023 Industrial & Commercial Bank of China (ICBC) US branch attack disrupting $9B in daily Treasury trades; 2024 Boeing aerospace data leak; Over 2,500 total enterprise extortion attacks.',
    defenses: 'Immutable, air-gapped backup storage architecture, rapid patching of edge VPN and Citrix ADC gateways, Endpoint Detection and Response (EDR) with tamper protection, and real-time file renaming & mass entropy anomaly detection.',
    description: 'LockBit is the most prolific and industrialized Ransomware-as-a-Service (RaaS) syndicate in cyber history, responsible for thousands of attacks across 120+ countries.',
    additional_description: 'LockBit operates a franchise-like model, providing affiliates with automated builder utilities, high-speed encryption payloads, and an automated victim negotiation portal. Even after coordinated law enforcement actions (Operation Cronos), splinter cells remain active.',
    c2_infrastructure: 'TOR hidden services for affiliate portals, automated bulletproof cloud servers for StealBit exfiltration, and decentralized payment resolvers.',
    yara_rule_guidance: 'Detects LockBit 3.0 Black anti-analysis debugging checks, dynamic API resolution hashes, and ransom note generation routines.',
    malware_tools: ['LockBit 3.0 (Black)', 'LockBit Green', 'StealBit', 'PsExec', 'Mimikatz', 'GMER', 'Process Hacker', 'TDSSKiller'],
    weaponized_cves: ['CVE-2023-4966 (Citrix Bleed)', 'CVE-2023-0669 (GoAnywhere MFT)', 'CVE-2023-27997 (Fortinet)', 'CVE-2021-34527 (PrintNightmare)'],
    incident_cases: [
      {
        year: '2023',
        victim: 'UK Royal Mail (International Postal Operations)',
        impact: 'International parcel export systems paralyzed for over 2 weeks; $80M ransom demanded.',
        attack_chain: 'Infiltrated logistics network via vulnerable edge appliance -> automated StealBit exfiltration -> encrypted dispatch printers and scheduling servers.'
      },
      {
        year: '2023',
        victim: 'ICBC Financial Services (US Branch)',
        impact: 'Disrupted $9 billion in daily Treasury bond settlement trades; forced manual messenger USB trades.',
        attack_chain: 'Exploited unpatched Citrix Bleed (CVE-2023-4966) -> hijacked active session tokens -> deployed LockBit 3.0 locker.'
      }
    ],
    mitre_matrix: [
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', description: 'Uses multithreaded AES/ChaCha20 + RSA algorithms to encrypt local and mapped network shares simultaneously in under 5 minutes.' },
      { id: 'T1567.002', name: 'Exfiltration to Cloud Storage', tactic: 'Exfiltration', description: 'Uses custom StealBit tool to upload hundreds of gigabytes of proprietary documents to Mega and private S3 buckets prior to encryption.' },
      { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact', description: 'Executes vssadmin delete shadows /all /quiet and bcdedit commands to prevent Windows volume recovery.' }
    ]
  },
  {
    id: 8,
    name: 'BlackCat / ALPHV (Noberus)',
    aliases: ['Noberus', 'AlphaVM', 'BlackCat Ransomware', 'ALPHV Group', 'BlackCat RaaS'],
    activity_level: 'HIGH',
    attacks_count: 215,
    last_seen: '2 hours ago',
    country: 'Eastern Europe',
    attribution: 'Russian-speaking cybercrime cartel / Former DarkSide and BlackMatter core developers',
    first_seen: '2021',
    targeted_regions: ['United States', 'European Union', 'Canada', 'Australia'],
    motivations: 'Mass enterprise extortion, triple extortion (data exfiltration, encryption, and DDoS/leaks), and high-profile healthcare/energy targets.',
    capabilities: 'Rust-based high-performance cross-platform ransomware, VMware ESXi hypervisor mass encryption, public searchable data leak portal indexing, DDoS extortion pressure, and helpdesk social engineering.',
    targeted_sectors: ['Healthcare & Prescription Systems', 'Energy, Oil & Gas', 'Financial Institutions', 'Defense Industrial Base', 'Retail & Hospitality Logistics'],
    targets: ['Healthcare', 'Energy', 'Financial Institutions', 'Defense', 'Retail'],
    techniques: 'Compromised credential login via brokers (T1078), Social engineering IT helpdesks via voice phishing (vishing) (T1566.004), ESXi CLI command encryption (T1059.004), Data leakage site indexing (T1486)',
    notable_incidents: '2024 Change Healthcare nationwide medical claims blackout causing billions in financial gridlock ($22M ransom paid); 2023 MGM Resorts & Caesars Entertainment casino & hotel operations disruption; Attack on German fuel distribution logistics pipelines.',
    defenses: 'Strict identity verification workflows for all helpdesk password resets, FIDO2 hardware MFA tokens, hypervisor network isolation separating ESXi management from guest subnets, and immediate EDR deployment on Linux/ESXi hosts.',
    description: 'BlackCat (ALPHV) is an advanced Rust-engineered ransomware operation known for targeting massive enterprise infrastructure, including critical healthcare networks and Fortune 500 conglomerates.',
    additional_description: 'ALPHV pioneered triple-extortion models and engineered their payloads in Rust for high-speed encryption across Windows, Linux, and VMware ESXi virtual machine clusters.',
    c2_infrastructure: 'TOR onion services with public REST API endpoints and searchable victim data leak mirrors.',
    yara_rule_guidance: 'Detects Rust-compiled cryptographic routines utilizing ChaCha20-Poly1305 and AES-256-CTR with custom JSON command-line argument parsers.',
    malware_tools: ['BlackCat (Rust)', 'ExMatter', 'Sphinx', 'Cobalt Strike', 'Mimikatz', 'MegaSync', 'AnyDesk', 'Total Commander'],
    weaponized_cves: ['CVE-2023-34362 (MOVEit Transfer)', 'CVE-2022-41082 (ProxyNotShell)', 'CVE-2021-34473 (ProxyShell)', 'CVE-2024-1709 (ConnectWise)'],
    incident_cases: [
      {
        year: '2024',
        victim: 'Change Healthcare (UnitedHealth Group)',
        impact: '$22M ransom paid; 1 in 3 US medical prescriptions disrupted; $1.6B+ financial response cost.',
        attack_chain: 'Gained initial access via compromised credentials on edge Citrix server lacking MFA -> exfiltrated 6TB of health records -> executed Rust locker across virtual server farms.'
      }
    ],
    mitre_matrix: [
      { id: 'T1566.004', name: 'Voice Phishing (Vishing)', tactic: 'Initial Access', description: 'Calls corporate IT helpdesks impersonating employees to socially engineer password and MFA token resets.' },
      { id: 'T1059.004', name: 'Unix Shell Execution', tactic: 'Execution', description: 'Executes shell commands on compromised VMware ESXi hypervisors to terminate VMs and encrypt raw .vmdk virtual disks.' }
    ]
  },
  {
    id: 9,
    name: 'Scattered Spider (0ktapus / UNC3944)',
    aliases: ['UNC3944', 'Muddled Libra', 'Starfrost Panda', 'Scatter Swine', 'Octo Tempest'],
    activity_level: 'CRITICAL',
    attacks_count: 168,
    last_seen: '15 mins ago',
    country: 'United States / United Kingdom / Global',
    attribution: "Decentralized collective of native English-speaking cybercriminals closely linked to 'The Com'",
    first_seen: '2022',
    targeted_regions: ['North America', 'United Kingdom', 'Global Cloud Providers'],
    motivations: 'Mass extortion, cryptocurrency theft, telecommunications subscriber identity theft, and enterprise cloud data monetization.',
    capabilities: 'Sophisticated voice phishing (vishing) against enterprise IT helpdesks, SIM swapping, Okta/Azure AD identity manipulation, Azure Cloud VM hijacking, BlackCat/ALPHV and RansomHub ransomware affiliate deployment, and BYOVD driver evasion.',
    targeted_sectors: ['Hospitality & Casinos', 'Telecommunications & Mobile Carriers', 'Cloud & Identity Providers (IAM)', 'Financial Fintech', 'Retail & Entertainment'],
    targets: ['Hospitality', 'Telecommunications', 'Cloud & IAM', 'Fintech', 'Retail'],
    techniques: 'SMS phishing portals with reverse-proxies (T1566.002), Voice phishing IT helpdesks (T1566.004), SIM swapping (T1098.005), Okta tenant manipulation, Bring Your Own Vulnerable Driver (T1068), Cloud lateral movement',
    notable_incidents: '2023 MGM Resorts cyberattack causing $100M+ in losses and disabling slot machines, hotel room keys, and ATMs; 2023 Caesars Entertainment $15M extortion; 130+ organization Okta credential harvesting campaign (0ktapus).',
    defenses: 'Eliminate SMS-based MFA in favor of FIDO2 passkeys, mandatory video verification or in-person manager signoff for helpdesk password resets, continuous monitoring of Okta/Azure AD administrator session grants, and cloud IAM anomaly detection.',
    description: 'Scattered Spider is an extraordinarily aggressive group of native English-speaking cybercriminals specializing in social engineering, identity provider compromises, and multi-million dollar corporate extortion.',
    additional_description: 'Unlike traditional eastern European ransomware gangs, Scattered Spider utilizes fluent English social engineering, targeting IT service desks to reset credentials and register rogue MFA tokens inside corporate Okta and Azure AD environments.',
    c2_infrastructure: 'Cloud-hosted reverse proxies (Evilginx), ngrok tunnels, Telegram bots, and direct Azure VM management ports.',
    yara_rule_guidance: 'Detects specific EDR bypass tools loading vulnerable signed drivers (e.g. mhyprot2.sys or RTCore64.sys) to terminate endpoint protection agents.',
    malware_tools: ['EDR Bypasser (BYOVD)', 'Teleport', 'AnyDesk', 'TeamViewer', 'Ngrok', 'BlackCat (Affiliate)', 'RansomHub', 'Evilginx2'],
    weaponized_cves: ['CVE-2023-4966 (Citrix Bleed)', 'CVE-2023-22515 (Confluence)', 'CVE-2024-21887 (Ivanti)', 'CVE-2015-1701 (Win32k)'],
    incident_cases: [
      {
        year: '2023',
        victim: 'MGM Resorts International',
        impact: '$100M+ in operational losses; digital hotel room keys, slot machines, and booking systems shut down for 10 days.',
        attack_chain: 'Identified MGM employee on LinkedIn -> called IT helpdesk impersonating employee -> bypassed MFA -> gained Okta Super Admin -> deployed BlackCat ransomware to VMware ESXi farms.'
      }
    ],
    mitre_matrix: [
      { id: 'T1566.004', name: 'Helpdesk Voice Phishing', tactic: 'Initial Access', description: 'Calls corporate IT helpdesks using employee personal details gathered from LinkedIn to convince technicians to reset MFA.' },
      { id: 'T1098.005', name: 'Key Registration Abuse', tactic: 'Persistence', description: 'Registers their own FIDO2 hardware keys into victim Okta user profiles to guarantee persistent single sign-on access.' }
    ]
  },
  {
    id: 10,
    name: 'Charming Kitten (APT35 / Mint Sandstorm)',
    aliases: ['Mint Sandstorm', 'Phosphorus', 'NewsBeef', 'TA453', 'Yellow Garuda', 'Cobalt Mirage'],
    activity_level: 'HIGH',
    attacks_count: 138,
    last_seen: '1 hour ago',
    country: 'Iran',
    attribution: 'Islamic Revolutionary Guard Corps (IRGC) - Intelligence Organization',
    first_seen: '2013',
    targeted_regions: ['Middle East', 'United States', 'United Kingdom', 'Israel', 'European Union'],
    motivations: 'State-sponsored cyber espionage, surveillance of political dissidents and journalists, nuclear & defense technology theft, and Middle East geopolitical intelligence.',
    capabilities: 'Elaborate multi-week social engineering personas via WhatsApp/LinkedIn, custom modular backdoors (PowerLess, BellaCiao), Android mobile infostealers, edge device exploitation, and automated cloud email exfiltration.',
    targeted_sectors: ['Defense & Aerospace', 'Government & Diplomatic', 'Nuclear Energy & Physics', 'Think Tanks & Academics', 'Journalists & Human Rights Activists', 'Medical Research'],
    targets: ['Defense', 'Government', 'Nuclear Energy', 'Think Tanks', 'Journalists', 'Medical'],
    techniques: 'Persona-based spear-phishing with conversational lures (T1566.003), Web shell deployment on Exchange (T1505.003), PowerShell backdoor execution (T1059.001), Cloud mailbox syncing (T1114.002)',
    notable_incidents: 'Targeting of US presidential campaign staff; Infiltration of Munich Security Conference attendees; Cyber espionage campaigns targeting nuclear non-proliferation policy researchers; Medical research data theft.',
    defenses: 'Strict domain-based DMARC/DKIM/SPF enforcement, continuous outbound cloud session logging, comprehensive mobile device management (MDM) security profiles, and user awareness training on long-term conversational social engineering.',
    description: 'Charming Kitten (APT35 / Mint Sandstorm) is an Iranian state-sponsored cyber espionage group operated by the IRGC, known for patient, highly convincing social engineering personas targeting foreign policy leaders.',
    additional_description: 'Charming Kitten frequently engages victims in weeks of authentic-sounding academic or journalistic conversations before sending weaponized document links or credential phishing portals.',
    c2_infrastructure: 'Domain names spoofing legitimate media outlets (CNN, BBC, Deutsche Welle) and cloud storage APIs.',
    yara_rule_guidance: 'Detects PowerLess .NET PowerShell runners and BellaCiao web shell dropper components.',
    malware_tools: ['PowerLess', 'BellaCiao', 'Hyperscrape', 'CharmPower', 'DrokBackup', 'Custom Android Infostealers', 'Sliver C2'],
    weaponized_cves: ['CVE-2021-44228 (Log4Shell)', 'CVE-2021-26855 (ProxyLogon)', 'CVE-2022-26134 (Confluence)', 'CVE-2023-3519 (Citrix Gateway)'],
    incident_cases: [
      {
        year: '2022',
        victim: 'Nuclear Non-Proliferation Researchers & Think Tanks',
        impact: 'Comprehensive exfiltration of private strategic foreign policy correspondence and analysis.',
        attack_chain: 'Created fake persona of British journalist -> conducted multi-week interview discussions -> shared weaponized OneDrive link -> executed Hyperscrape tool to download full email archives.'
      }
    ],
    mitre_matrix: [
      { id: 'T1566.003', name: 'Spearphishing via Service', tactic: 'Initial Access', description: 'Reaches out via WhatsApp or LinkedIn posing as journalists or think-tank directors to build rapport before sharing malicious links.' },
      { id: 'T1114.002', name: 'Remote Email Collection', tactic: 'Collection', description: 'Uses Hyperscrape tool to automatically download entire victim Google/Microsoft mailboxes via valid stolen credentials.' }
    ]
  },
  {
    id: 11,
    name: 'Mustang Panda (Bronze President / RedDelta)',
    aliases: ['RedDelta', 'Earth Preta', 'Camouflage Panda', 'TA416', 'Stately Taurus', 'Bronze President'],
    activity_level: 'HIGH',
    attacks_count: 164,
    last_seen: '50 mins ago',
    country: 'China',
    attribution: 'Chinese State-Sponsored Cyber Espionage Unit',
    first_seen: '2017',
    targeted_regions: ['Southeast Asia', 'European Union', 'Vatican City', 'Taiwan', 'Pacific Island Nations'],
    motivations: 'Geopolitical intelligence across Southeast Asia, European Union policy surveillance, Vatican and religious diplomacy monitoring, and Belt and Road Initiative security.',
    capabilities: 'PlugX / Korplug modular malware loaders, USB worm infection vectors, multi-stage DLL side-loading, and PDF decoy documents with embedded shortcut (.LNK) exploits.',
    targeted_sectors: ['Government & Foreign Ministries', 'Diplomatic Delegations', 'Telecommunications', 'Non-Governmental Organizations', 'Religious Organizations (Vatican)', 'European Union Agencies'],
    targets: ['Government', 'Diplomatic', 'Telecommunications', 'NGOs', 'Religious', 'EU Agencies'],
    techniques: 'Spear-phishing with decoy diplomatic agendas (T1566.001), DLL side-loading using legitimate signed binaries (T1574.002), Worm propagation via removable media (T1091), Google Drive C2 routing',
    notable_incidents: '2020 Vatican and Catholic Diocese of Hong Kong network compromise ahead of China-Vatican provisional agreement; European government foreign ministry espionage campaigns; Southeast Asian government border dispute surveillance.',
    defenses: 'Disable USB removable storage auto-run, enforce strict DLL search order security (SafeDllSearchMode), and inspect outbound Google Drive/Dropbox API calls from non-browser processes.',
    description: 'Mustang Panda is a persistent Chinese state espionage actor focused on collecting intelligence from foreign ministries, diplomatic delegations, and religious entities across Asia and Europe.',
    additional_description: 'Mustang Panda is recognized for its mastery of DLL side-loading techniques and weaponizing diplomatic-themed lure documents tailored to ongoing international summits.',
    c2_infrastructure: 'Dynamic Google Drive API channels, legitimate cloud storage endpoints, and multi-tier forward proxy nodes across Southeast Asia.',
    yara_rule_guidance: 'Detects PlugX (Korplug) shellcode decoders and ToneShell DLL side-loading import table hooks.',
    malware_tools: ['PlugX (Korplug)', 'Hodur', 'PoisonIvy', 'ToneIns', 'ToneShell', 'PubLoad', 'MPlayer'],
    weaponized_cves: ['CVE-2023-38831 (WinRAR)', 'CVE-2021-40444 (MSHTML)', 'CVE-2017-11882 (Equation Editor)', 'CVE-2023-23397 (Outlook)'],
    incident_cases: [
      {
        year: '2020',
        victim: 'The Vatican & Catholic Diocese of Hong Kong',
        impact: 'Covert surveillance of Vatican diplomatic communications ahead of China-Holy See treaty renewal.',
        attack_chain: 'Sent spear-phishing email with forged letter from Cardinal Secretary of State -> executed DLL side-loading -> loaded PlugX backdoor.'
      }
    ],
    mitre_matrix: [
      { id: 'T1574.002', name: 'DLL Side-Loading', tactic: 'Defense Evasion', description: 'Places a malicious DLL in the same folder as a legitimately signed executable (e.g., Adobe, Avast) to load implants into trusted processes.' },
      { id: 'T1091', name: 'Replication Through Removable Media', tactic: 'Lateral Movement', description: 'Modifies USB flash drives to hide user files and replace them with weaponized LNK shortcuts that spread PlugX.' }
    ]
  },
  {
    id: 12,
    name: 'FIN7 (Carbanak / ELBRUS / Sangria Tempest)',
    aliases: ['Sangria Tempest', 'ITG14', 'Navigator Group', 'Gold Niagara', 'Carbon Spider', 'ELBRUS'],
    activity_level: 'HIGH',
    attacks_count: 210,
    last_seen: '3 hours ago',
    country: 'Eastern Europe',
    attribution: 'Elite Organized Cybercrime Syndicate',
    first_seen: '2013',
    targeted_regions: ['United States', 'European Union', 'United Kingdom', 'Global Retail & Hospitality'],
    motivations: 'Large-scale financial theft, corporate payment card data theft, and ransomware extortion deployment (BlackCat, Cl0p, DarkSide affiliates).',
    capabilities: 'Weaponized USB BadUSB hardware attacks mailed to corporate targets, custom backdoors (Carbanak, LNK loaders, DICELOADER), front company recruitment deception (Combi Security), and Point-of-Sale (PoS) memory scraping.',
    targeted_sectors: ['Retail & E-Commerce', 'Hospitality & Restaurant Chains', 'Financial Services & Banking', 'Transportation & Logistics', 'Defense Contractors'],
    targets: ['Retail', 'Hospitality', 'Financial Services', 'Transportation', 'Defense'],
    techniques: 'Mailing physical weaponized USB drives (T1091), Fraudulent front company recruitment (T1566), Point-of-Sale memory scraping (T1056), Custom PowerShell payload obfuscation (T1059.001)',
    notable_incidents: "Theft of over 20 million credit card records from 3,600+ business locations (Chipotle, Arby's, Red Robin, Saks Fifth Avenue) causing $1B+ in consumer fraud; Mailing explosive/keystroke-injecting USB drives disguised as Best Buy gift cards.",
    defenses: 'Physical security controls prohibiting unvetted USB device insertion, Point-of-Sale end-to-end tokenization (P2PE), memory scanning for unencrypted track 1/track 2 credit card data, and advanced PowerShell script block logging (EID 4104).',
    description: 'FIN7 is one of the most organized and financially devastating cybercrime cartels in history, responsible for billions in losses across retail, hospitality, and banking verticals.',
    additional_description: "FIN7 operated fake cybersecurity front companies (such as 'Combi Security') to unwittingly recruit legitimate penetration testers and developers to write malware components and test exploits against enterprise defenses.",
    c2_infrastructure: 'Custom TLS encrypted reverse proxies, compromised WordPress installations, and AWS EC2 relay nodes.',
    yara_rule_guidance: 'Detects DICELOADER (Lizar) XOR decryption routines and Carbanak memory injection shellcode.',
    malware_tools: ['Carbanak', 'DICELOADER (Lizar)', 'Tirion', 'GRIFFON', 'DOMINOS', 'PowerPlant', 'BadUSB Payloads', 'Pillager'],
    weaponized_cves: ['CVE-2023-34362 (MOVEit)', 'CVE-2021-34527 (PrintNightmare)', 'CVE-2020-1472 (ZeroLogon)', 'CVE-2023-4966 (Citrix Bleed)'],
    incident_cases: [
      {
        year: '2015-2019',
        victim: "Major US Restaurant & Hospitality Chains (Arby's, Chipotle, Saks)",
        impact: '20+ million payment cards scraped from PoS memory; $1B+ in fraud across US banks.',
        attack_chain: 'Spear-phishing emails posing as health inspectors or catering requests -> executed GRIFFON JS dropper -> scraped memory on PoS terminals during card swipes.'
      }
    ],
    mitre_matrix: [
      { id: 'T1056', name: 'Input Capture', tactic: 'Collection', description: 'Injects memory-scraping modules into Point-of-Sale software processes to extract raw credit card track 1 and track 2 data during checkout.' },
      { id: 'T1091', name: 'Physical Media Ingestion', tactic: 'Initial Access', description: 'Mails malicious BadUSB microcontrollers disguised as corporate rewards or promotional gifts to target executives via postal mail.' }
    ]
  }
]

let cachedActors: ThreatActor[] | null = null

export const threatActorsService = {
  getCachedOrInitial(): ThreatActor[] {
    return cachedActors && cachedActors.length > 0 ? cachedActors : INITIAL_ACTORS_DATA
  },

  hasCache(): boolean {
    return !!cachedActors && cachedActors.length > 0
  },

  async getThreatActors(): Promise<ThreatActor[]> {
    try {
      const response = await api.get('/api/threat-intelligence/actors', { timeout: 4000 })
      if (Array.isArray(response.data) && response.data.length > 0) {
        cachedActors = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for threat actors, using fast preloaded dossier dataset:', error)
    }
    return threatActorsService.getCachedOrInitial()
  },
}

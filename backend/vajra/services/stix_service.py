import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class STIXService:
    """
    OASIS STIX 2.1 Threat Intelligence Bundle Generator.
    Spec: https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html
    Generates standardized STIX 2.1 JSON packages for enterprise SIEM/SOAR/TIP ingestion.
    """

    def generate_stix_bundle(self, domain_data: Dict[str, Any], company_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a complete OASIS STIX 2.1 bundle from a domain analysis or company risk assessment.
        """
        bundle_id = f"bundle--{uuid.uuid4()}"
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        target = domain_data.get("target") or domain_data.get("domain") or "unknown.domain"
        security_score = domain_data.get("security_score", 100)
        risk_level = domain_data.get("risk_level", "LOW")

        objects: List[Dict[str, Any]] = []

        # 1. Identity Object: VAJRA Platform
        identity_id = f"identity--{uuid.uuid5(uuid.NAMESPACE_DNS, 'vajra.security.ai')}"
        objects.append({
            "type": "identity",
            "spec_version": "2.1",
            "id": identity_id,
            "created": now_iso,
            "modified": now_iso,
            "name": "VAJRA Security AI Platform",
            "description": "Automated Threat Intelligence & Risk Assessment Platform",
            "identity_class": "system",
            "sectors": ["technology", "cybersecurity"],
            "contact_information": "security@vajra.ai"
        })

        # 2. Identity Object for Target Entity (if company name provided)
        target_identity_id = None
        if company_name:
            target_identity_id = f"identity--{uuid.uuid4()}"
            objects.append({
                "type": "identity",
                "spec_version": "2.1",
                "id": target_identity_id,
                "created": now_iso,
                "modified": now_iso,
                "name": company_name,
                "description": f"Monitored target organization for domain {target}",
                "identity_class": "organization"
            })

        # 3. Main Target Indicator SDO
        is_ip = bool(domain_data.get("is_ip") or (target.replace(".", "").isdigit() and target.count(".") == 3))
        pattern_str = f"[ipv4-addr:value = '{target}']" if is_ip else f"[domain-name:value = '{target}']"
        
        main_indicator_id = f"indicator--{uuid.uuid4()}"
        objects.append({
            "type": "indicator",
            "spec_version": "2.1",
            "id": main_indicator_id,
            "created_by_ref": identity_id,
            "created": now_iso,
            "modified": now_iso,
            "name": f"Target Telemetry: {target}",
            "description": f"Security risk score: {security_score}/100, Risk Rating: {risk_level}",
            "indicator_types": ["compromised" if risk_level in ["HIGH", "CRITICAL"] else "anomalous-activity"],
            "pattern": pattern_str,
            "pattern_type": "stix",
            "pattern_version": "2.1",
            "valid_from": now_iso,
            "confidence": max(10, 100 - security_score)
        })

        # 4. Discovered Vulnerability SDOs (CVEs)
        vulnerability_ids = []
        for issue in domain_data.get("domain_issues", [])[:20]:
            cve_id = issue.get("cve_id")
            if cve_id:
                vuln_sdo_id = f"vulnerability--{uuid.uuid5(uuid.NAMESPACE_DNS, cve_id)}"
                vulnerability_ids.append(vuln_sdo_id)
                objects.append({
                    "type": "vulnerability",
                    "spec_version": "2.1",
                    "id": vuln_sdo_id,
                    "created_by_ref": identity_id,
                    "created": now_iso,
                    "modified": now_iso,
                    "name": cve_id,
                    "description": issue.get("description", "Vulnerability detected by VAJRA NVD/Nuclei engine"),
                    "external_references": [
                        {
                            "source_name": "cve",
                            "external_id": cve_id,
                            "url": f"https://nvd.nist.gov/vuln/detail/{cve_id}"
                        }
                    ]
                })

                # SRO: Indicator -> Vulnerability Relationship
                objects.append({
                    "type": "relationship",
                    "spec_version": "2.1",
                    "id": f"relationship--{uuid.uuid4()}",
                    "created_by_ref": identity_id,
                    "created": now_iso,
                    "modified": now_iso,
                    "relationship_type": "indicates",
                    "source_ref": main_indicator_id,
                    "target_ref": vuln_sdo_id
                })

        # 5. Active Threats & Malware SDOs
        for threat in domain_data.get("threats", [])[:10]:
            threat_name = threat.get("type") or threat.get("threat_type") or "Malware Activity"
            malware_id = f"malware--{uuid.uuid4()}"
            objects.append({
                "type": "malware",
                "spec_version": "2.1",
                "id": malware_id,
                "created_by_ref": identity_id,
                "created": now_iso,
                "modified": now_iso,
                "name": threat_name,
                "is_family": False,
                "description": f"Threat detected via {threat.get('source', 'VAJRA Threat Intelligence')}",
                "malware_types": ["ransomware" if "ransomware" in threat_name.lower() else "trojan"]
            })

            objects.append({
                "type": "relationship",
                "spec_version": "2.1",
                "id": f"relationship--{uuid.uuid4()}",
                "created_by_ref": identity_id,
                "created": now_iso,
                "modified": now_iso,
                "relationship_type": "indicates",
                "source_ref": main_indicator_id,
                "target_ref": malware_id
            })

        # 6. STIX 2.1 Report Object encapsulating the bundle findings
        report_id = f"report--{uuid.uuid4()}"
        objects.append({
            "type": "report",
            "spec_version": "2.1",
            "id": report_id,
            "created_by_ref": identity_id,
            "created": now_iso,
            "modified": now_iso,
            "name": f"VAJRA Threat & Risk Intelligence Assessment - {target}",
            "description": f"Comprehensive security assessment for {target}. Overall score: {security_score}/100, Risk Level: {risk_level}",
            "report_types": ["threat-report", "vulnerability"],
            "published": now_iso,
            "object_refs": [obj["id"] for obj in objects]
        })

        return {
            "type": "bundle",
            "id": bundle_id,
            "spec_version": "2.1",
            "objects": objects
        }

stix_service = STIXService()

import sys
sys.path.insert(0, '.')
import asyncio
from services.domain_analysis_service import domain_service

def calculate_security_score(res: dict):
    seen = set()
    deduped = []
    for i in res.get('domain_issues', []):
        t = i.get('title', '').lower()
        c = i.get('category', '')
        m = i.get('matched_target', '')
        key = f"{t}_{c}_{m}"
        if key not in seen:
            seen.add(key)
            deduped.append(i)

    def is_damaging(issue):
        sev = (issue.get('severity') or '').upper()
        if sev not in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            return False
        cat = (issue.get('category') or '').lower()
        damaging_cats = [
            'exposed-panels', 'greenbone-nvt', 'open-ports', 'ssl-tls',
            'vulnerability', 'cve', 'osv', 'owasp-top10', 'misconfiguration',
            'threat', 'information-disclosure', 'exposed_files', 'secrets'
        ]
        return (
            any(d in cat for d in damaging_cats)
            or bool(issue.get('cve_id'))
            or ('port' in str(issue.get('id', '')).lower())
        )

    damaging = [i for i in deduped if is_damaging(i)]
    crit = sum(1 for i in damaging if (i.get('severity') or '').upper() == 'CRITICAL')
    high = sum(1 for i in damaging if (i.get('severity') or '').upper() == 'HIGH')
    med = sum(1 for i in damaging if (i.get('severity') or '').upper() == 'MEDIUM')
    low = sum(1 for i in damaging if (i.get('severity') or '').upper() == 'LOW')

    penalty = crit * 10 + high * 5 + med * 2 + low * 2
    score = max(5, min(100, 100 - penalty))
    return {
        "deduped": len(deduped),
        "damaging": len(damaging),
        "crit": crit,
        "high": high,
        "med": med,
        "low": low,
        "penalty": penalty,
        "score": score
    }

async def analyze_target(domain: str):
    clean = domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0].split(":")[0].strip()
    print(f"\n[+] Starting domain analysis for: {clean} ...")
    try:
        res = await asyncio.wait_for(domain_service.analyze_domain(clean), timeout=45.0)
        stats = calculate_security_score(res)
        print("\n" + "="*50)
        print(f" TARGET: {clean}")
        print(f" SECURITY SCORE: {stats['score']}/100")
        print(f" TOTAL DEDUPED FINDINGS: {stats['deduped']}")
        print(f" DAMAGING FINDINGS: {stats['damaging']}")
        print(f" BREAKDOWN -> Critical: {stats['crit']}, High: {stats['high']}, Medium: {stats['med']}, Low: {stats['low']}")
        print(f" TOTAL PENALTY: -{stats['penalty']}")
        print("="*50 + "\n")
    except asyncio.TimeoutError:
        print(f"[!] Analysis timed out after 45s for '{clean}'. Remote services took too long.")
    except asyncio.CancelledError:
        print(f"[!] Analysis was cancelled.")
    except Exception as e:
        print(f"[!] Error analyzing '{clean}': {e}")

def main():
    print("="*50)
    print(" VAJRA DOMAIN RISK ANALYZER INTERACTIVE CLI")
    print(" (Type 'exit' or 'q' to quit)")
    print("="*50)
    
    while True:
        try:
            domain = input("\nEnter domain or IP to analyze: ").strip()
            if not domain:
                continue
            if domain.lower() in ['exit', 'quit', 'q']:
                print("Goodbye!")
                break
            asyncio.run(analyze_target(domain))
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"[!] Execution error: {e}. Ready for next input.\n")

if __name__ == '__main__':
    main()

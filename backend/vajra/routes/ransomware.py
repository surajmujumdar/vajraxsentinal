from fastapi import APIRouter
from schemas.ransomware import RansomwareIncident, RansomwareStats
from services.ransomware_service import ransomware_service

router = APIRouter()

@router.get("", response_model=list[RansomwareIncident])
@router.get("/recent", response_model=list[RansomwareIncident])
async def get_ransomware_incidents():
    # Use ransomware.live API for real data
    attacks = await ransomware_service.get_recent_attacks(limit=20)
    
    if attacks:
        return [
            {
                "id": i + 1,
                "group": attack.get('group_name', 'Unknown'),
                "target": attack.get('target', 'Unknown'),
                "country": attack.get('country', 'Unknown'),
                "published": attack.get('published_date', 'Unknown'),
                "impact": attack.get('impact', 'Medium'),
                "status": attack.get('status', 'Published'),
                "description": attack.get('description') or f"{attack.get('group_name', 'Unknown')} ransomware attack targeting {attack.get('target', 'Unknown')} in {attack.get('country', 'Unknown')}."
            }
            for i, attack in enumerate(attacks)
        ]
    
    # Fallback to mock data if API fails
    return [
        {
            "id": 1,
            "group": "LockBit",
            "target": "Healthcare Global Services",
            "country": "USA",
            "published": "2026-07-13",
            "impact": "Critical",
            "status": "Published",
            "description": "LockBit ransomware attack targeting Healthcare Global Services. Critical databases encrypted and data exfiltration claimed."
        },
        {
            "id": 2,
            "group": "BlackCat",
            "target": "Finance Trust Corp",
            "country": "UK",
            "published": "2026-07-12",
            "impact": "High",
            "status": "Published",
            "description": "BlackCat (ALPHV) ransomware attack targeting Finance Trust Corp. Threat actors claimed downloading 250GB of sensitive corporate finance logs."
        },
        {
            "id": 3,
            "group": "Cl0p",
            "target": "Manufacturing Tech Ltd",
            "country": "Germany",
            "published": "2026-07-12",
            "impact": "Critical",
            "status": "Published",
            "description": "Cl0p ransomware attack exploiting zero-day vulnerability in MOVEit transfer service to extract data from Manufacturing Tech Ltd."
        },
        {
            "id": 4,
            "group": "Play",
            "target": "Government City Portal",
            "country": "France",
            "published": "2026-07-11",
            "impact": "High",
            "status": "Published",
            "description": "Play ransomware group claimed attack against municipal servers of Government City Portal, disrupting public administration services."
        },
        {
            "id": 5,
            "group": "Hive",
            "target": "Retail Stores Inc",
            "country": "Canada",
            "published": "2026-07-11",
            "impact": "Medium",
            "status": "Published",
            "description": "Hive ransomware attack against Retail Stores Inc, causing brief checkout system downtime before detection and containment."
        },
        {
            "id": 6,
            "group": "Royal",
            "target": "Technology Hub Solutions",
            "country": "India",
            "published": "2026-07-10",
            "impact": "Critical",
            "status": "Published",
            "description": "Royal ransomware attack targeting active developer infrastructure at Technology Hub Solutions. Ransom demands sent to executive board."
        }
    ]

@router.get("/stats", response_model=RansomwareStats)
async def get_ransomware_stats():
    stats = await ransomware_service.get_ransomware_stats()
    return RansomwareStats(
        groupsCount=stats.get("groupsCount", 357),
        overallVictims=stats.get("overallVictims", 29732),
        victimsThisYear=stats.get("victimsThisYear", 5144),
        victimsThisMonth=stats.get("victimsThisMonth", 445),
        victimsThisYearTrend=stats.get("victimsThisYearTrend", "↑ 20.0% vs 2025"),
        victimsThisMonthTrend=stats.get("victimsThisMonthTrend", "↓ 37.1% vs Jun")
    )


@router.get("/group/{group_name}", response_model=list[RansomwareIncident])
async def get_group_ransomware_incidents(group_name: str):
    attacks = await ransomware_service.get_group_attacks(group_name=group_name, limit=30)
    return [
        {
            "id": i + 1,
            "group": attack.get('group_name', 'Unknown'),
            "target": attack.get('target', 'Unknown'),
            "country": attack.get('country', 'Unknown'),
            "published": attack.get('published_date', 'Unknown'),
            "impact": attack.get('impact', 'Medium'),
            "status": attack.get('status', 'Published'),
            "description": attack.get('description') or f"{attack.get('group_name', 'Unknown')} ransomware attack targeting {attack.get('target', 'Unknown')}."
        }
        for i, attack in enumerate(attacks)
    ]


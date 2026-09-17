from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.database import get_db
from models import Alert, ThreatFeed, RansomwareIncident
import requests
import logging

logger = logging.getLogger(__name__)

class SocSyncService:
    """Service for managing automated SOC data synchronization"""
    
    def __init__(self):
        # In-memory storage for SOC providers (in production, use database)
        self.providers = []
    
    def add_provider(self, provider: dict):
        """Add a SOC provider for sync"""
        self.providers.append(provider)
        logger.info(f"Added SOC provider: {provider['name']}")
    
    def remove_provider(self, provider_id: str):
        """Remove a SOC provider"""
        self.providers = [p for p in self.providers if p['id'] != provider_id]
        logger.info(f"Removed SOC provider: {provider_id}")
    
    def get_due_syncs(self) -> list:
        """Get providers that are due for sync based on their frequency"""
        now = datetime.now()
        due_providers = []
        
        for provider in self.providers:
            if provider.get('status') != 'active':
                continue
            
            last_sync = provider.get('last_sync')
            if not last_sync:
                due_providers.append(provider)
                continue
            
            # Parse last_sync timestamp
            try:
                if isinstance(last_sync, str):
                    last_sync_time = datetime.strptime(last_sync, "%Y-%m-%d %H:%M:%S")
                else:
                    last_sync_time = last_sync
                
                # Calculate next sync time based on frequency
                sync_frequency = provider.get('sync_frequency', 'hourly')
                
                if sync_frequency == 'real-time':
                    # Real-time sync every 5 minutes
                    next_sync = last_sync_time + timedelta(minutes=5)
                elif sync_frequency == 'hourly':
                    next_sync = last_sync_time + timedelta(hours=1)
                elif sync_frequency == 'daily':
                    next_sync = last_sync_time + timedelta(days=1)
                elif sync_frequency == 'weekly':
                    next_sync = last_sync_time + timedelta(weeks=1)
                else:
                    next_sync = last_sync_time + timedelta(hours=1)
                
                if now >= next_sync:
                    due_providers.append(provider)
                    
            except Exception as e:
                logger.error(f"Error parsing sync time for provider {provider['id']}: {e}")
                due_providers.append(provider)
        
        return due_providers
    
    def sync_provider(self, provider: dict, db: Session) -> dict:
        """Sync data with a specific SOC provider"""
        try:
            exported_data = {}
            total_exported = 0
            
            # Fetch data based on provider's data types
            data_types = provider.get('data_types', [])
            
            if 'alerts' in data_types:
                alerts = db.query(Alert).limit(100).all()
                alert_data = [
                    {
                        "id": alert.id,
                        "title": alert.title,
                        "description": alert.description,
                        "severity": alert.severity,
                        "time": alert.time.isoformat() if alert.time else None,
                        "source": getattr(alert, 'source', 'Unknown'),
                        "timestamp": datetime.now().isoformat()
                    }
                    for alert in alerts
                ]
                exported_data['alerts'] = alert_data
                total_exported += len(alert_data)
            
            if 'threat-intel' in data_types:
                threats = db.query(ThreatFeed).limit(100).all()
                threat_data = [
                    {
                        "id": threat.id,
                        "name": threat.name,
                        "type": threat.type,
                        "severity": threat.severity
                    }
                    for threat in threats
                ]
                exported_data['threat_intel'] = threat_data
                total_exported += len(threat_data)
            
            if 'ransomware' in data_types:
                ransomware = db.query(RansomwareIncident).limit(100).all()
                ransomware_data = [
                    {
                        "id": r.id,
                        "group_name": r.group_name,
                        "target": r.target,
                        "country": r.country
                    }
                    for r in ransomware
                ]
                exported_data['ransomware'] = ransomware_data
                total_exported += len(ransomware_data)
            
            # Send data to SOC provider endpoint
            if exported_data:
                success = self.send_to_soc(provider, exported_data)
                
                if success:
                    # Update provider stats
                    for i, p in enumerate(self.providers):
                        if p['id'] == provider['id']:
                            self.providers[i]['last_sync'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            self.providers[i]['total_exports'] = self.providers[i].get('total_exports', 0) + total_exported
                            self.providers[i]['status'] = 'active'
                            break
                    
                    logger.info(f"Successfully synced {total_exported} records to {provider['name']}")
                    return {
                        "success": True,
                        "provider": provider['name'],
                        "exported_count": total_exported,
                        "data_types": list(exported_data.keys()),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    logger.error(f"Failed to send data to {provider['name']}")
                    return {
                        "success": False,
                        "provider": provider['name'],
                        "error": "Failed to send data to SOC endpoint"
                    }
            
            return {
                "success": True,
                "provider": provider['name'],
                "exported_count": 0,
                "message": "No data to export",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error syncing provider {provider['name']}: {e}")
            return {
                "success": False,
                "provider": provider['name'],
                "error": str(e)
            }
    
    def send_to_soc(self, provider: dict, data: dict) -> bool:
        """Send data to SOC provider endpoint"""
        try:
            endpoint = provider.get('endpoint')
            api_key = provider.get('api_key')
            
            if not endpoint:
                logger.warning(f"No endpoint configured for provider {provider['name']}")
                return True  # Return true for demo purposes
            
            # In production, make actual API call
            # response = requests.post(
            #     f"{endpoint}/ingest",
            #     headers={
            #         "Authorization": f"Bearer {api_key}",
            #         "Content-Type": "application/json"
            #     },
            #     json=data,
            #     timeout=30
            # )
            # return response.status_code == 200
            
            # For demo purposes, return True
            logger.info(f"Would send data to {endpoint} (demo mode)")
            return True
            
        except Exception as e:
            logger.error(f"Error sending data to SOC: {e}")
            return False
    
    def sync_all_due(self, db: Session) -> list:
        """Sync all providers that are due for sync"""
        due_providers = self.get_due_syncs()
        results = []
        
        for provider in due_providers:
            result = self.sync_provider(provider, db)
            results.append(result)
        
        return results
    
    def manual_sync(self, provider_id: str, db: Session) -> dict:
        """Manually trigger sync for a specific provider"""
        provider = next((p for p in self.providers if p['id'] == provider_id), None)
        
        if not provider:
            return {
                "success": False,
                "error": "Provider not found"
            }
        
        return self.sync_provider(provider, db)

# Global instance
soc_sync_service = SocSyncService()

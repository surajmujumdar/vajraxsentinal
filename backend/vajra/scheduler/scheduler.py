from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
from services.soc_sync_service import soc_sync_service
from database.database import get_db
from services.threat_service import refresh_threat_intelligence
from services.dashboard_service import refresh_dashboard_stats

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def scheduled_ransomware_fetch():
    """Fetch ransomware data every 15 minutes"""
    logger.info("Running scheduled ransomware data fetch")
    try:
        await fetch_ransomware_data()
        logger.info("Ransomware data fetch completed")
    except Exception as e:
        logger.error(f"Error in scheduled ransomware fetch: {e}")

async def scheduled_threat_refresh():
    """Refresh threat intelligence every 30 minutes"""
    logger.info("Running scheduled threat intelligence refresh")
    try:
        await refresh_threat_intelligence()
        logger.info("Threat intelligence refresh completed")
    except Exception as e:
        logger.error(f"Error in scheduled threat refresh: {e}")

async def scheduled_dashboard_refresh():
    """Refresh dashboard stats every 30 seconds"""
    logger.info("Running scheduled dashboard stats refresh")
    try:
        await refresh_dashboard_stats()
        logger.info("Dashboard stats refresh completed")
    except Exception as e:
        logger.error(f"Error in scheduled dashboard refresh: {e}")

async def scheduled_soc_sync():
    """Sync data with SOC providers every 5 minutes"""
    logger.info("Running scheduled SOC sync")
    try:
        db = next(get_db())
        results = soc_sync_service.sync_all_due(db)
        logger.info(f"SOC sync completed: {len(results)} providers synced")
        db.close()
    except Exception as e:
        logger.error(f"Error in scheduled SOC sync: {e}")

def setup_scheduler():
    """Configure and start the scheduler"""
    scheduler.add_job(
        scheduled_ransomware_fetch,
        trigger=IntervalTrigger(minutes=15),
        id='ransomware_fetch',
        name='Fetch Ransomware Data',
        replace_existing=True
    )
    
    scheduler.add_job(
        scheduled_threat_refresh,
        trigger=IntervalTrigger(minutes=30),
        id='threat_refresh',
        name='Refresh Threat Intelligence',
        replace_existing=True
    )
    
    scheduler.add_job(
        scheduled_dashboard_refresh,
        trigger=IntervalTrigger(seconds=30),
        id='dashboard_refresh',
        name='Refresh Dashboard Stats',
        replace_existing=True
    )
    
    scheduler.add_job(
        scheduled_soc_sync,
        trigger=IntervalTrigger(minutes=5),
        id='soc_sync',
        name='Sync with SOC Providers',
        replace_existing=True
    )
    
    logger.info("Scheduler configured with jobs")

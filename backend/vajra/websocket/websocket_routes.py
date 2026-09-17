from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.websocket_manager import websocket_manager
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message: {data}")
            
            # Echo back or handle specific messages
            await websocket.send_json({
                "type": "echo",
                "message": f"Received: {data}"
            })
    except WebSocketDisconnect as e:
        websocket_manager.disconnect(websocket)
        logger.info(f"WebSocket client disconnected: code={e.code}, reason={e.reason}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        logger.error(f"WebSocket error traceback: {traceback.format_exc()}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass
        websocket_manager.disconnect(websocket)

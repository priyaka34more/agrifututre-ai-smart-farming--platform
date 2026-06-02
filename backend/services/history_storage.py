"""
Simple History Storage Service
In-memory storage for recent detections and decisions
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid

logger = logging.getLogger("HistoryStorage")

class HistoryStorage:
    def __init__(self, max_items: int = 50):
        self.max_items = max_items
        self.detection_history: List[Dict] = []
        self.decision_history: List[Dict] = []
        self.cleanup_interval = 3600  # 1 hour
        self.last_cleanup = datetime.now()
    
    def add_detection(self, detection_data: Dict) -> str:
        """Add a detection record to history"""
        try:
            record = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "disease": detection_data.get("disease"),
                "confidence": detection_data.get("confidence"),
                "image_uri": detection_data.get("image_uri"),
                "region": detection_data.get("region", "unknown"),
                "user_id": detection_data.get("user_id", "anonymous"),
                "status": detection_data.get("status", "success"),
                "advisory": detection_data.get("advisory"),
                "result_id": detection_data.get("result_id")
            }
            
            self.detection_history.append(record)
            self._cleanup_old_items()
            
            logger.info(f"Detection added to history: {record['disease']} (confidence: {record['confidence']})")
            return record["id"]
            
        except Exception as e:
            logger.error(f"Failed to add detection to history: {e}")
            return ""
    
    def add_decision(self, decision_data: Dict) -> str:
        """Add a decision record to history"""
        try:
            record = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "disease": decision_data.get("disease"),
                "confidence": decision_data.get("confidence"),
                "predicted_price": decision_data.get("predicted_price"),
                "trend": decision_data.get("trend"),
                "recommendation": decision_data.get("recommendation"),
                "priority": decision_data.get("priority"),
                "action_items": decision_data.get("action_items", []),
                "confidence_score": decision_data.get("confidence_score"),
                "user_id": decision_data.get("user_id", "anonymous"),
                "client_ip": decision_data.get("client_ip")
            }
            
            self.decision_history.append(record)
            self._cleanup_old_items()
            
            logger.info(f"Decision added to history: {record['recommendation'][:50]}...")
            return record["id"]
            
        except Exception as e:
            logger.error(f"Failed to add decision to history: {e}")
            return ""
    
    def get_recent_detections(self, limit: int = 5) -> List[Dict]:
        """Get recent detection records"""
        try:
            # Sort by timestamp (most recent first)
            sorted_history = sorted(
                self.detection_history, 
                key=lambda x: x.get("timestamp", ""), 
                reverse=True
            )
            return sorted_history[:limit]
        except Exception as e:
            logger.error(f"Failed to get recent detections: {e}")
            return []
    
    def get_recent_decisions(self, limit: int = 5) -> List[Dict]:
        """Get recent decision records"""
        try:
            # Sort by timestamp (most recent first)
            sorted_history = sorted(
                self.decision_history, 
                key=lambda x: x.get("timestamp", ""), 
                reverse=True
            )
            return sorted_history[:limit]
        except Exception as e:
            logger.error(f"Failed to get recent decisions: {e}")
            return []
    
    def get_detection_stats(self) -> Dict:
        """Get detection statistics"""
        try:
            if not self.detection_history:
                return {
                    "total_detections": 0,
                    "diseases_detected": {},
                    "avg_confidence": 0,
                    "last_detection": None
                }
            
            # Count diseases
            disease_counts = {}
            total_confidence = 0
            
            for detection in self.detection_history:
                disease = detection.get("disease", "unknown")
                confidence = detection.get("confidence", 0)
                
                disease_counts[disease] = disease_counts.get(disease, 0) + 1
                total_confidence += confidence
            
            avg_confidence = total_confidence / len(self.detection_history) if self.detection_history else 0
            last_detection = max(d.get("timestamp", "") for d in self.detection_history)
            
            return {
                "total_detections": len(self.detection_history),
                "diseases_detected": disease_counts,
                "avg_confidence": round(avg_confidence, 3),
                "last_detection": last_detection
            }
            
        except Exception as e:
            logger.error(f"Failed to get detection stats: {e}")
            return {"error": str(e)}
    
    def get_decision_stats(self) -> Dict:
        """Get decision statistics"""
        try:
            if not self.decision_history:
                return {
                    "total_decisions": 0,
                    "priorities": {},
                    "avg_confidence_score": 0,
                    "last_decision": None
                }
            
            # Count priorities
            priority_counts = {}
            total_confidence = 0
            
            for decision in self.decision_history:
                priority = decision.get("priority", "medium")
                confidence = decision.get("confidence_score", 0)
                
                priority_counts[priority] = priority_counts.get(priority, 0) + 1
                total_confidence += confidence
            
            avg_confidence = total_confidence / len(self.decision_history) if self.decision_history else 0
            last_decision = max(d.get("timestamp", "") for d in self.decision_history)
            
            return {
                "total_decisions": len(self.decision_history),
                "priorities": priority_counts,
                "avg_confidence_score": round(avg_confidence, 3),
                "last_decision": last_decision
            }
            
        except Exception as e:
            logger.error(f"Failed to get decision stats: {e}")
            return {"error": str(e)}
    
    def get_user_history(self, user_id: str, limit: int = 10) -> Dict:
        """Get history for a specific user"""
        try:
            user_detections = [
                d for d in self.detection_history 
                if d.get("user_id") == user_id
            ][:limit]
            
            user_decisions = [
                d for d in self.decision_history 
                if d.get("user_id") == user_id
            ][:limit]
            
            return {
                "detections": sorted(user_detections, key=lambda x: x.get("timestamp", ""), reverse=True),
                "decisions": sorted(user_decisions, key=lambda x: x.get("timestamp", ""), reverse=True),
                "total_detections": len(user_detections),
                "total_decisions": len(user_decisions)
            }
            
        except Exception as e:
            logger.error(f"Failed to get user history: {e}")
            return {"error": str(e)}
    
    def _cleanup_old_items(self):
        """Remove old items to prevent memory bloat"""
        try:
            now = datetime.now()
            
            # Run cleanup periodically
            if (now - self.last_cleanup).seconds < self.cleanup_interval:
                return
            
            # Remove items older than 24 hours
            cutoff_time = now - timedelta(hours=24)
            
            self.detection_history = [
                d for d in self.detection_history 
                if datetime.fromisoformat(d.get("timestamp", now.isoformat())) > cutoff_time
            ]
            
            self.decision_history = [
                d for d in self.decision_history 
                if datetime.fromisoformat(d.get("timestamp", now.isoformat())) > cutoff_time
            ]
            
            # Also limit by max_items
            if len(self.detection_history) > self.max_items:
                self.detection_history = self.detection_history[-self.max_items:]
            
            if len(self.decision_history) > self.max_items:
                self.decision_history = self.decision_history[-self.max_items:]
            
            self.last_cleanup = now
            logger.info(f"History cleanup completed. Detections: {len(self.detection_history)}, Decisions: {len(self.decision_history)}")
            
        except Exception as e:
            logger.error(f"History cleanup error: {e}")
    
    def clear_history(self) -> bool:
        """Clear all history (for testing/admin)"""
        try:
            self.detection_history.clear()
            self.decision_history.clear()
            logger.info("History cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear history: {e}")
            return False
    
    def get_storage_info(self) -> Dict:
        """Get storage information"""
        return {
            "detection_count": len(self.detection_history),
            "decision_count": len(self.decision_history),
            "max_items": self.max_items,
            "last_cleanup": self.last_cleanup.isoformat(),
            "memory_usage_kb": len(str(self.detection_history)) + len(str(self.decision_history))
        }

# Global history storage instance
history_storage = HistoryStorage(max_items=50)

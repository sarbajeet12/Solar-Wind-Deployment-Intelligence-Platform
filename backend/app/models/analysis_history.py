from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class AnalysisHistory(Base):
    """An immutable, user-owned snapshot of a completed site assessment."""
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="Completed")
    overall_score = Column(Float)
    recommendation = Column(String)
    report_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project = relationship("Project", back_populates="analyses")
    site = relationship("Site", back_populates="analyses")
    owner = relationship("User", back_populates="analyses")

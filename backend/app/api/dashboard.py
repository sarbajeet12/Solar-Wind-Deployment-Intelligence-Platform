from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.auth.password import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    owned_projects = db.query(Project).filter(Project.created_by == current_user.id)
    total_projects = owned_projects.count()
    total_sites = db.query(Site).join(Project).filter(Project.created_by == current_user.id).count()

    solar_sites = db.query(Site).join(Project).filter(
        Project.created_by == current_user.id, Site.energy_type == "Solar"
    ).count()

    wind_sites = db.query(Site).join(Project).filter(
        Project.created_by == current_user.id, Site.energy_type == "Wind"
    ).count()

    pending_sites = db.query(Site).join(Project).filter(
        Project.created_by == current_user.id, Site.status == "Pending"
    ).count()

    completed_sites = db.query(Site).join(Project).filter(
        Project.created_by == current_user.id, Site.status == "Completed"
    ).count()

    return {
        "projects": total_projects,
        "sites": total_sites,
        "solar": solar_sites,
        "wind": wind_sites,
        "pending": pending_sites,
        "completed": completed_sites
    }

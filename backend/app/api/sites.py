from app.services.nasa_power import get_nasa_power_data
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse
from app.auth.password import get_current_user

router = APIRouter(
    prefix="/sites",
    tags=["Sites"]
)


def _owned_site(site_id: int, db: Session, current_user: User) -> Site:
    site = (db.query(Site).join(Project).filter(
        Site.id == site_id, Project.created_by == current_user.id
    ).first())
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.post("/", response_model=SiteResponse)
def create_site(site: SiteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == site.project_id, Project.created_by == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    new_site = Site(**site.model_dump())

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return new_site


@router.get("/", response_model=list[SiteResponse])
def get_sites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Site).join(Project).filter(Project.created_by == current_user.id).all()


@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _owned_site(site_id, db, current_user)


@router.put("/{site_id}", response_model=SiteResponse)
def update_site(
    site_id: int,
    updated_site: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = _owned_site(site_id, db, current_user)
    project = db.query(Project).filter(Project.id == updated_site.project_id, Project.created_by == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in updated_site.model_dump().items():
        setattr(site, key, value)

    db.commit()
    db.refresh(site)

    return site


@router.delete("/{site_id}")
def delete_site(site_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    site = _owned_site(site_id, db, current_user)

    db.delete(site)
    db.commit()

    return {
        "message": "Site deleted successfully"
    }

@router.get("/environment/")
def get_environment_data(
    latitude: float,
    longitude: float
):
    return get_nasa_power_data(
        latitude,
        longitude
    )

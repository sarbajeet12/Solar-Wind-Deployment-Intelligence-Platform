from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.password import get_current_user
from app.database.database import get_db
from app.models.analysis_history import AnalysisHistory
from app.models.prediction_history import PredictionHistory
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.services.environmental_engine import get_environmental_profile
from app.services.pdf_report import build_site_analysis_pdf
from app.services.report_generator import generate_resource_report

try:
    from ml.inference.predict import predict_power_from_dict
except ModuleNotFoundError:
    predict_power_from_dict = None


router = APIRouter(prefix="/analysis", tags=["Environmental Analysis"])


class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    project_id: int | None = None
    site_id: int | None = None


class PdfReportRequest(LocationRequest):
    site_name: str | None = None
    analysis_id: int | None = None


class PowerPredictionRequest(BaseModel):
    MODULE_TEMP: float
    Amb_Temp: float
    WIND_Speed: float
    IRR: float
    DC_Current: float
    AC_Ir: float
    AC_Iy: float
    AC_Ib: float
    project_id: int | None = None
    site_id: int | None = None


def _owned_site(site_id: int, db: Session, user: User) -> Site:
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.created_by == user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


def _owned_analysis(analysis_id: int, db: Session, user: User) -> AnalysisHistory:
    analysis = db.query(AnalysisHistory).filter(AnalysisHistory.id == analysis_id, AnalysisHistory.created_by == user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


def _pdf_response(report: dict, latitude: float, longitude: float, site_name: str | None):
    pdf = build_site_analysis_pdf(report, latitude, longitude, site_name)
    return StreamingResponse(pdf, media_type="application/pdf", headers={"Content-Disposition": 'attachment; filename="site-analysis-report.pdf"'})


@router.post("/environment")
def environmental_analysis(location: LocationRequest):
    try:
        return get_environmental_profile(location.latitude, location.longitude)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/report")
def resource_assessment_report(location: LocationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Run an explicit new assessment. A site-bound result is preserved as a new history item."""
    try:
        site = None
        if location.site_id is not None:
            site = _owned_site(location.site_id, db, current_user)
            if location.project_id is not None and site.project_id != location.project_id:
                raise HTTPException(status_code=400, detail="The selected site does not belong to this project")
        elif location.project_id is not None:
            project = db.query(Project).filter(Project.id == location.project_id, Project.created_by == current_user.id).first()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")

        report = generate_resource_report(location.latitude, location.longitude)
        if "error" in report:
            raise HTTPException(status_code=502, detail="Unable to complete the site analysis. Please try again.")

        if site:
            history = AnalysisHistory(
                project_id=site.project_id, site_id=site.id, created_by=current_user.id,
                latitude=location.latitude, longitude=location.longitude,
                overall_score=report.get("overall_score"), recommendation=report.get("recommendation"), report_data=report,
            )
            site.status = "Completed"
            project = db.get(Project, site.project_id)
            if project:
                project.status = "Analysis Complete"
            db.add(history)
            db.commit()
            db.refresh(history)
            return {**report, "analysis_id": history.id, "saved": True}
        return report
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/projects/{project_id}/analyses")
def project_analyses(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.created_by == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(AnalysisHistory).filter(AnalysisHistory.project_id == project_id, AnalysisHistory.created_by == current_user.id).order_by(AnalysisHistory.created_at.desc()).all()


@router.get("/sites/{site_id}/analyses")
def site_analyses(site_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_site(site_id, db, current_user)
    return db.query(AnalysisHistory).filter(AnalysisHistory.site_id == site_id, AnalysisHistory.created_by == current_user.id).order_by(AnalysisHistory.created_at.desc()).all()


@router.get("/history/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = _owned_analysis(analysis_id, db, current_user)
    return {**analysis.report_data, "analysis_id": analysis.id, "project_id": analysis.project_id, "site_id": analysis.site_id, "created_at": analysis.created_at, "status": analysis.status}


@router.get("/history/{analysis_id}/pdf")
def saved_analysis_pdf(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = _owned_analysis(analysis_id, db, current_user)
    return _pdf_response(analysis.report_data, analysis.latitude, analysis.longitude, None)


@router.post("/predict-power")
def predict_solar_power(data: PowerPredictionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if predict_power_from_dict is None:
        raise HTTPException(status_code=503, detail="Prediction model is not available in the current environment.")
    try:
        site = None
        if data.site_id is not None:
            site = _owned_site(data.site_id, db, current_user)
            if data.project_id is not None and data.project_id != site.project_id:
                raise HTTPException(status_code=400, detail="The selected site does not belong to this project")
        features = {"MODULE_TEMP": data.MODULE_TEMP, "Amb_Temp": data.Amb_Temp, "WIND_Speed": data.WIND_Speed, "IRR (W/m2)": data.IRR, "DC Current in Amps": data.DC_Current, "AC Ir in Amps": data.AC_Ir, "AC Iy in Amps": data.AC_Iy, "AC Ib in Amps": data.AC_Ib}
        prediction = float(predict_power_from_dict(features))
        history = PredictionHistory(project_id=site.project_id if site else data.project_id, site_id=data.site_id, created_by=current_user.id, model_name="Random Forest Regressor", model_version="1", input_data=data.model_dump(exclude={"project_id", "site_id"}), predicted_ac_power_watts=prediction)
        db.add(history)
        db.commit()
        db.refresh(history)
        return {"predicted_ac_power_watts": prediction, "model": "Random Forest Regressor", "prediction_id": history.id}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/sites/{site_id}/predictions")
def site_predictions(site_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _owned_site(site_id, db, current_user)
    return db.query(PredictionHistory).filter(PredictionHistory.site_id == site_id, PredictionHistory.created_by == current_user.id).order_by(PredictionHistory.created_at.desc()).all()


@router.post("/report/pdf")
def download_resource_assessment_report(data: PdfReportRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.analysis_id is not None:
        analysis = _owned_analysis(data.analysis_id, db, current_user)
        return _pdf_response(analysis.report_data, analysis.latitude, analysis.longitude, data.site_name)
    # Preserves the legacy endpoint while requiring explicit site context for saved workflow PDFs.
    try:
        report = generate_resource_report(data.latitude, data.longitude)
        if "error" in report:
            raise HTTPException(status_code=502, detail="Unable to complete the site analysis. Please try again.")
        return _pdf_response(report, data.latitude, data.longitude, data.site_name)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to generate the site analysis PDF. Please try again.")

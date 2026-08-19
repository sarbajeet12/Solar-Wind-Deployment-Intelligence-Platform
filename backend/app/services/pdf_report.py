from datetime import date
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


def _value(value, fallback="Not available"):
    return str(value) if value not in (None, "") else fallback


def _section(title, rows, styles):
    data = [[Paragraph(f"<b>{_value(label)}</b>", styles["BodyText"]), Paragraph(_value(value), styles["BodyText"])] for label, value in rows]
    table = Table(data, colWidths=[6.1 * cm, 10.4 * cm], hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EAF7FA")), ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#C7DCE3")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    return [Paragraph(title, styles["SectionHeading"]), Spacer(1, 0.18 * cm), table, Spacer(1, 0.48 * cm)]


def build_site_analysis_pdf(report, latitude, longitude, site_name=None):
    """Create a user-facing PDF from an already generated site-analysis report."""
    output = BytesIO()
    document = SimpleDocTemplate(output, pagesize=A4, rightMargin=1.4 * cm, leftMargin=1.4 * cm, topMargin=1.35 * cm, bottomMargin=1.35 * cm)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], alignment=TA_CENTER, textColor=colors.HexColor("#075985"), fontSize=22, leading=27, spaceAfter=5))
    styles.add(ParagraphStyle(name="ReportSubtitle", parent=styles["Normal"], alignment=TA_CENTER, textColor=colors.HexColor("#475569"), fontSize=10, leading=14, spaceAfter=18))
    styles.add(ParagraphStyle(name="SectionHeading", parent=styles["Heading2"], textColor=colors.HexColor("#0E7490"), fontSize=14, leading=18, spaceBefore=8, spaceAfter=4))
    location, solar, wind = report.get("location", {}), report.get("solar", {}), report.get("wind", {})
    terrain, deployment = report.get("terrain", {}), report.get("deployment", {})
    forecast, investment = report.get("forecast", {}), report.get("investment", {})
    site_label = site_name or location.get("city") or "Selected site"
    story = [Paragraph("Solar &amp; Wind Deployment Intelligence", styles["ReportTitle"]), Paragraph("Site Analysis Report", styles["ReportSubtitle"]), Paragraph(f"Prepared for <b>{_value(site_label)}</b> | Generated {date.today().isoformat()}", styles["ReportSubtitle"])]
    story += _section("Site Information", [("Selected location", site_label), ("Country", location.get("country")), ("State", location.get("state")), ("District", location.get("district")), ("City", location.get("city")), ("Latitude", f"{latitude:.6f}"), ("Longitude", f"{longitude:.6f}")], styles)
    story += _section("Location Map Reference", [("Site coordinates", f"{latitude:.6f}, {longitude:.6f}"), ("Map note", "The interactive site map in the platform is centred on these coordinates and marks this selected location.")], styles)
    story += _section("Solar Resource Assessment", [("Solar resource", f"{_value(solar.get('ghi'))} kWh/m²"), ("Temperature", f"{_value(solar.get('temperature'))} °C"), ("Suitability score", f"{_value(solar.get('score'))}/100"), ("Assessment", solar.get("category"))], styles)
    story += _section("Wind Resource Assessment", [("Wind speed", f"{_value(wind.get('speed'))} m/s"), ("Power density", f"{_value(wind.get('power_density'))} W/m²"), ("Suitability score", f"{_value(wind.get('score'))}/100"), ("Assessment", wind.get("category"))], styles)
    story += _section("Terrain Assessment", [("Elevation", f"{_value(terrain.get('elevation'))} m"), ("Terrain source", terrain.get("source")), ("Construction complexity", deployment.get("construction_complexity"))], styles)
    story.append(PageBreak())
    story += _section("Overall Resource Assessment", [("Overall suitability", f"{_value(report.get('overall_score'))}/100"), ("Recommendation", report.get("recommendation")), ("Solar score", f"{_value(solar.get('score'))}/100"), ("Wind score", f"{_value(wind.get('score'))}/100")], styles)
    story += _section("Deployment Recommendation", [("Recommended deployment", deployment.get("recommended_deployment")), ("Project size", deployment.get("project_size")), ("Investment risk", deployment.get("investment_risk")), ("Deployment priority", deployment.get("deployment_priority")), ("Construction complexity", deployment.get("construction_complexity"))], styles)
    story += _section("Energy Potential", [("Future potential", forecast.get("future_potential")), ("Growth trend", forecast.get("growth_trend")), ("Estimate", forecast.get("prediction"))], styles)
    story += _section("Investment & Planning Insights", [("Decision", investment.get("decision")), ("Estimated ROI", investment.get("estimated_roi")), ("Investment level", investment.get("investment_level")), ("Payback period", investment.get("payback_period"))], styles)
    story += _section("Key Findings", [("Summary", f"The selected site is assessed as {report.get('recommendation', 'not available')}. The recommended deployment is {deployment.get('recommended_deployment', 'not available')} with {deployment.get('construction_complexity', 'not available')} construction complexity.")], styles)
    story += _section("Data & Assumptions", [("Important note", "This is an initial site assessment based on available environmental, terrain, resource and planning data. Detailed engineering, grid, land, regulatory, environmental and financial due diligence may still be required.")], styles)

    def add_page_number(canvas, doc):
        canvas.saveState(); canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#64748B")); canvas.drawRightString(A4[0] - 1.4 * cm, 0.8 * cm, f"Page {doc.page}"); canvas.restoreState()

    document.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    output.seek(0)
    return output

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, MapPin, Plus, RefreshCw } from "lucide-react";
import api from "../services/api";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import PageBackButton from "../components/ui/PageBackButton";

export default function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [sites, setSites] = useState([]);
    const [analyses, setAnalyses] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        localStorage.setItem("current_project_id", projectId);
        const load = async () => {
            try {
                const [projectResult, sitesResult, analysisResult] = await Promise.all([
                    api.get(`/projects/${projectId}`), api.get("/sites/"), api.get(`/analysis/projects/${projectId}/analyses`),
                ]);
                setProject(projectResult.data);
                setSites(sitesResult.data.filter((site) => String(site.project_id) === String(projectId)));
                setAnalyses(analysisResult.data);
            } catch (loadError) {
                setError(loadError.response?.data?.detail || "Unable to load this project workspace.");
            }
        };
        load();
    }, [projectId]);

    const download = async (analysis) => {
        const response = await api.get(`/analysis/history/${analysis.id}/pdf`, { responseType: "blob" });
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a"); link.href = url; link.download = "site-analysis-report.pdf"; link.click(); URL.revokeObjectURL(url);
    };

    if (error) return <div className="p-8 text-red-300">{error}</div>;
    if (!project) return <div className="p-8 text-slate-300">Loading project workspace...</div>;
    return <div className="min-h-screen bg-night-950 px-4 py-8 sm:px-6 lg:px-8">
        <PageBackButton label="Back to Projects" onClick={() => navigate("/projects")} />
        <PageHeader badge="Project workspace" title={project.name} subtitle={`${project.location} · ${project.energy_type} · ${project.status}`} action={<Button onClick={() => navigate(`/sites?new=1&projectId=${project.id}`)}><Plus size={18} /> Add Site</Button>} />
        <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300"><b className="text-cyan-200">Project ✓ Created</b><span className="mx-3">→</span>Site → Analysis. Add a site or select an existing site to continue.</div>
        <h2 className="mb-4 font-display text-xl font-semibold text-white">Sites</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sites.length === 0 && <Card><p className="text-slate-400">No sites yet. Add a location to begin an assessment.</p></Card>}
            {sites.map((site) => <Card key={site.id}><h3 className="text-lg font-semibold text-white">{site.site_name}</h3><p className="mt-2 flex gap-2 text-sm text-slate-400"><MapPin size={16} />{site.district}, {site.state}</p><p className="mt-2 text-sm text-slate-400">{site.status === "Completed" ? "Latest analysis available" : "Analysis pending"}</p><Button className="mt-5" onClick={() => navigate(`/analysis?projectId=${project.id}&siteId=${site.id}`)}>{site.status === "Completed" ? "View Site" : "Run Site Analysis"}</Button></Card>)}
        </div>
        <h2 className="mb-4 mt-10 font-display text-xl font-semibold text-white">Analysis History</h2>
        <div className="space-y-3">{analyses.length === 0 ? <Card><p className="text-slate-400">No saved analysis has been run for this project yet.</p></Card> : analyses.map((analysis) => <Card key={analysis.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-white">Suitability: {analysis.overall_score ?? "—"}/100</p><p className="mt-1 text-sm text-slate-400">{analysis.recommendation} · {new Date(analysis.created_at).toLocaleString()}</p></div><div className="flex gap-3"><Button variant="secondary" onClick={() => navigate(`/analysis?projectId=${project.id}&siteId=${analysis.site_id}&analysisId=${analysis.id}`)}><FileText size={17} /> View Analysis</Button><Button variant="secondary" onClick={() => download(analysis)}><RefreshCw size={17} /> Download PDF</Button></div></Card>)}</div>
    </div>;
}

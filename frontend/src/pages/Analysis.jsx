import LocationSearch from "../components/location/LocationSearch";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
    MapPinned,
    Sun,
    Wind,
    Mountain,
    BadgeCheck,
    ArrowLeft,
    RotateCcw,
    Search,
    TrendingUp,
    Coins,
    Target,
    Gauge as GaugeIcon,
    AlertTriangle,
    CheckCircle2,
    Globe,
    Sprout,
    Layers,
    BarChart3,
    BrainCircuit,
    Zap,
    Activity,
    LoaderCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
} from "lucide-react";

import SiteMap from "../components/map/SiteMap";
import api, { downloadSiteAnalysisPdf, predictSolarPower } from "../services/api";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Gauge from "../components/ui/Gauge";
import ProgressBar from "../components/ui/ProgressBar";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import PageBackButton from "../components/ui/PageBackButton";

const delay = (i, base = 0.2) => ({ transition: { delay: base + i * 0.08 } });

const defaultPredictionInputs = {
    MODULE_TEMP: "",
    Amb_Temp: "",
    WIND_Speed: "",
    IRR: "",
    DC_Current: "",
    AC_Ir: "",
    AC_Iy: "",
    AC_Ib: "",
};

const predictionFieldConfig = {
    MODULE_TEMP: { label: "Module Temperature", unit: "°C", min: 8.855, max: 72.4475 },
    Amb_Temp: { label: "Ambient Temperature", unit: "°C", min: 10.41361, max: 34.95997 },
    WIND_Speed: { label: "Wind Speed", unit: "m/s", min: 0.238025, max: 597.4435 },
    IRR: { label: "Irradiance", unit: "W/m²", min: 2.129417, max: 1494.851 },
    DC_Current: { label: "DC Current", unit: "A", min: 0.6, max: 995.679988 },
    AC_Ir: { label: "AC Current R", unit: "A", min: 1.4, max: 461.2 },
    AC_Iy: { label: "AC Current Y", unit: "A", min: 1.4, max: 461.1 },
    AC_Ib: { label: "AC Current B", unit: "A", min: 1.5, max: 461.7 },
};

const environmentalPredictionFields = ["MODULE_TEMP", "Amb_Temp", "WIND_Speed", "IRR"];
const electricalPredictionFields = ["DC_Current", "AC_Ir", "AC_Iy", "AC_Ib"];

const formatPredictionWatts = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
};

export default function Analysis() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get("projectId");
    const siteId = searchParams.get("siteId");
    const analysisId = searchParams.get("analysisId");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingLocation, setEditingLocation] = useState(false);
    const [locationSaving, setLocationSaving] = useState(false);
    const [locationNotice, setLocationNotice] = useState("");

    const [prediction, setPrediction] = useState(null);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [predictionInputs, setPredictionInputs] = useState(defaultPredictionInputs);
    const [predictionInputErrors, setPredictionInputErrors] = useState({});
    const [predictionError, setPredictionError] = useState("");
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [showModelPerformance, setShowModelPerformance] = useState(false);
    const [showPlantEstimator, setShowPlantEstimator] = useState(false);
    const [showSiteReport, setShowSiteReport] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState("");

    useEffect(() => {
        const loadSavedAnalysis = async () => {
            try {
                if (analysisId) {
                    const response = await api.get(`/analysis/history/${analysisId}`);
                    setReport(response.data);
                }
                if (siteId) {
                    const requests = [api.get(`/sites/${siteId}`), api.get(`/analysis/sites/${siteId}/analyses`)];
                    if (projectId) requests.push(api.get(`/projects/${projectId}`));
                    const [siteResponse, historyResponse, projectResponse] = await Promise.all(requests);
                    setSelectedSite(siteResponse.data);
                    if (projectResponse) setSelectedProject(projectResponse.data);
                    setSelectedLocation({ name: siteResponse.data.site_name, latitude: siteResponse.data.latitude, longitude: siteResponse.data.longitude });
                    if (!analysisId && historyResponse.data.length) setReport({ ...historyResponse.data[0].report_data, analysis_id: historyResponse.data[0].id });
                }
            } catch (error) {
                setAnalysisError("Unable to load saved analysis. Please try again.");
            }
        };
        loadSavedAnalysis();
    }, [analysisId, projectId, siteId]);

    const cancelLocationEdit = () => {
        if (selectedSite) setSelectedLocation({ name: selectedSite.site_name, latitude: selectedSite.latitude, longitude: selectedSite.longitude });
        setEditingLocation(false);
        setLocationNotice("");
    };

    const saveLocation = async () => {
        if (!selectedSite || !selectedLocation) return;
        setLocationSaving(true);
        setLocationNotice("");
        try {
            const response = await api.put(`/sites/${selectedSite.id}`, {
                site_name: selectedSite.site_name,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                state: selectedSite.state,
                district: selectedSite.district,
                energy_type: selectedSite.energy_type,
                project_id: selectedSite.project_id,
                status: selectedSite.status,
            });
            setSelectedSite(response.data);
            setSelectedLocation({ name: response.data.site_name, latitude: response.data.latitude, longitude: response.data.longitude });
            setEditingLocation(false);
            if (report) setReport(null);
            setLocationNotice("Location saved. Run a new analysis for these coordinates; earlier results remain in history.");
        } catch (error) {
            setLocationNotice(error.response?.data?.detail || "Unable to save the site location. Please try again.");
        } finally {
            setLocationSaving(false);
        }
    };

    const loadPredictionHistory = async () => {
        if (!siteId) return;
        try {
            const response = await api.get(`/analysis/sites/${siteId}/predictions`);
            setPredictionHistory(response.data);
        } catch (_) {
            // A history panel is optional to the estimator; preserve its primary workflow on a transient failure.
        }
    };

    useEffect(() => { loadPredictionHistory(); }, [siteId]);

    const validatePredictionInput = (key, value) => {
        if (value === "" || value === null || value === undefined) {
            return `Please enter the current ${predictionFieldConfig[key].label.toLowerCase()}.`;
        }

        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            return "Enter a valid number.";
        }

        const config = predictionFieldConfig[key];
        if (numericValue < config.min || numericValue > config.max) {
            return `Enter a value within the model's observed range (${config.min}–${config.max} ${config.unit}).`;
        }

        return "";
    };

    const validatePredictionInputs = (values) => {
        const nextErrors = {};

        Object.entries(values).forEach(([key, value]) => {
            const message = validatePredictionInput(key, value);
            if (message) {
                nextErrors[key] = message;
            }
        });

        return nextErrors;
    };

    const handlePredictionInputChange = (key) => (event) => {
        const rawValue = event.target.value;
        const nextValue = rawValue === "" ? "" : Number(rawValue);

        setPredictionInputs((prev) => ({
            ...prev,
            [key]: nextValue,
        }));

        setPredictionInputErrors((prev) => ({
            ...prev,
            [key]: "",
        }));

        setPredictionError("");
    };

    const analyzeSite = async () => {
        if (!selectedLocation) return;
        setLoading(true);
        setAnalysisError("");
        try {
            const res = await api.post(
                "/analysis/report",
                {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    project_id: projectId ? Number(projectId) : undefined,
                    site_id: siteId ? Number(siteId) : undefined,
                }
            );
            if (res.data?.error) {
                throw new Error("Analysis service returned an error");
            }
            setReport(res.data);
        } catch (err) {
            console.error(err);
            setAnalysisError("We couldn't complete the site analysis. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const predictPower = async () => {
        const nextErrors = validatePredictionInputs(predictionInputs);

        if (Object.keys(nextErrors).length > 0) {
            setPredictionInputErrors(nextErrors);
            setPredictionError("Please correct the highlighted input values before predicting.");
            return;
        }

        setPredictionLoading(true);
        setPredictionError("");
        setPredictionInputErrors({});

        try {
            const result = await predictSolarPower(predictionInputs, {
                projectId: projectId ? Number(projectId) : null,
                siteId: siteId ? Number(siteId) : null,
            });
            setPrediction(result);
            await loadPredictionHistory();
        } catch (err) {
            console.error("Power prediction failed:", err);
            if (err?.code === "ERR_NETWORK" || err?.response?.status === 503 || err?.response?.status === 500) {
                setPredictionError("Unable to reach the prediction service. Please make sure the backend is running.");
            } else {
                setPredictionError("Unable to generate the power prediction right now. Please try again.");
            }
            setPrediction(null);
        } finally {
            setPredictionLoading(false);
        }
    };

    const downloadPdfReport = async () => {
        if (!selectedLocation || !report) return;
        setPdfLoading(true);
        setPdfError("");
        try {
            const pdf = await downloadSiteAnalysisPdf({
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                siteName: selectedLocation.name,
                analysisId: report.analysis_id,
            });
            const url = URL.createObjectURL(pdf);
            const link = document.createElement("a");
            link.href = url;
            link.download = "site-analysis-report.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF report download failed:", err);
            setPdfError("We couldn't generate the PDF report. Please try again.");
        } finally {
            setPdfLoading(false);
        }
    };

    const resetAnalysis = () => {
        setReport(null);
        setSelectedLocation(null);
        setPrediction(null);
        setPredictionError("");
        setPredictionInputErrors({});
        setPredictionInputs(defaultPredictionInputs);
        setShowPlantEstimator(false);
        setShowSiteReport(false);
        setPdfError("");
        setAnalysisError("");
    };

    const riskColor = (risk) => {
        const map = { Low: "emerald", Medium: "amber", High: "red" };
        return map[risk] || "slate";
    };

    const priorityColor = (p) => {
        const map = { High: "emerald", Medium: "amber", Low: "slate" };
        return map[p] || "slate";
    };

    const complexityColor = (c) => {
        const map = { Easy: "emerald", Moderate: "amber", Difficult: "red" };
        return map[c] || "slate";
    };

const callout = (icon, label, value, color) => (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <h4 className="mt-0.5 font-display text-lg font-semibold text-white">{value}</h4>
                </div>
            </div>
        </div>
    );

    const selectedSiteMap = selectedLocation && siteId && (
        <Card hover={false}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg"><MapPinned className="text-white" size={22} /></div>
                    <div><h2 className="font-display text-xl font-bold text-white">Interactive Deployment Map</h2><p className="mt-1 text-sm text-slate-400">Project: {selectedProject?.name || "Selected project"} · Site: {selectedSite?.site_name || selectedLocation.name}</p><p className="mt-1 font-mono text-xs text-cyan-200">Coordinates: {Number(selectedLocation.latitude).toFixed(6)}, {Number(selectedLocation.longitude).toFixed(6)}</p></div>
                </div>
                {!editingLocation && <Button variant="secondary" onClick={() => { setEditingLocation(true); setLocationNotice(""); }}><MapPinned size={18} /> Edit Location</Button>}
            </div>
            {editingLocation && <div className="mb-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100"><p className="font-medium">Drag the pin to the exact location you want to assess.</p><p className="mt-1 text-amber-200/80">Changing the site location requires a new analysis. Existing results will remain in history.</p><div className="mt-4 flex flex-wrap gap-3"><Button onClick={saveLocation} disabled={locationSaving}>{locationSaving ? "Saving Location..." : "Save New Location"}</Button><Button variant="secondary" onClick={cancelLocationEdit} disabled={locationSaving}>Cancel</Button></div></div>}
            {locationNotice && <div className="mb-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">{locationNotice}</div>}
            <p className="mb-4 text-xs text-slate-400">The pin marks the selected project location. You can adjust it to the exact area you want to assess; the map does not determine construction suitability.</p>
            <SiteMap selectedLocation={selectedLocation} project={selectedProject} site={selectedSite} editing={editingLocation} onLocationChange={setSelectedLocation} />
        </Card>
    );

    return (
        <>
            <div className="min-h-screen bg-night-950 px-4 py-8 sm:px-6 lg:px-8">
                {projectId && <PageBackButton label="Back to Project" onClick={() => navigate(`/projects/${projectId}`)} />}
                <PageHeader
                    badge="Analysis"
                    title="Environmental Intelligence"
                    subtitle="Analyze renewable energy suitability using multi-source environmental data, forecasting and investment modeling."
                    action={
                        report && (
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary" onClick={() => setShowSiteReport(true)}>
                                    <FileText size={18} /> View Site Analysis Report
                                </Button>
                                <Button onClick={downloadPdfReport} disabled={pdfLoading}>
                                    {pdfLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />} {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
                                </Button>
                                <Button variant="secondary" onClick={resetAnalysis}>
                                    <ArrowLeft size={18} /> Back
                                </Button>
                                <Button onClick={resetAnalysis}>
                                    <RotateCcw size={18} /> Analyze Another Site
                                </Button>
                            </div>
                        )
                    }
                />

                {showPlantEstimator && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-8 max-w-5xl">
                        <Card hover={false} className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_38%)]" />
                            <div className="relative">
                                <PageBackButton label="Back to Analysis" onClick={() => setShowPlantEstimator(false)} />
                                <div className="mt-6 flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"><Zap className="text-white" size={24} /></div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Existing Solar Plant</p>
                                        <h2 className="mt-1 font-display text-2xl font-bold text-white">Plant Power Estimation</h2>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Use this tool if you already operate a solar plant and have its current operating measurements. No live plant sensor connection is available.</p>
                                    </div>
                                </div>

                                <div className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
                                    <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/35 p-5">
                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">Current Plant Operating Data</p>
                                        <p className="mt-2 text-sm text-slate-400">All fields are required. Enter readings from the current plant operating condition.</p>
                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            {[...environmentalPredictionFields, ...electricalPredictionFields].map((key) => {
                                                const config = predictionFieldConfig[key];
                                                return (
                                                    <label key={key} className="block">
                                                        <span className="mb-1.5 block text-xs font-medium text-slate-300">{config.label} ({config.unit})</span>
                                                        <input type="number" min={config.min} max={config.max} step="any" value={predictionInputs[key]} onChange={handlePredictionInputChange(key)} aria-label={`${config.label} ${config.unit}`} aria-invalid={Boolean(predictionInputErrors[key])} className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ${predictionInputErrors[key] ? "border-red-400/70 focus:ring-red-500/50" : "border-white/10 focus:ring-cyan-500/50"}`} />
                                                        {predictionInputErrors[key] && <span className="mt-1.5 block text-xs text-red-300">{predictionInputErrors[key]}</span>}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="flex items-center gap-2 text-xs text-slate-400"><Info className="text-cyan-400" size={14} /> Values are checked against the model’s observed training ranges.</span>
                                            <Button onClick={predictPower} disabled={predictionLoading} className="min-w-[190px]" icon={predictionLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Zap size={18} />}>{predictionLoading ? "Estimating..." : "Estimate AC Power"}</Button>
                                        </div>
                                        {predictionError && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{predictionError}</div>}
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                        {prediction ? (
                                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-300">Current AC Power</p>
                                                <p className="mt-4 bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-4xl font-bold leading-none text-transparent sm:text-5xl">{formatPredictionWatts(prediction.predicted_ac_power_watts)} <span className="text-base text-slate-400">W</span></p>
                                                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm"><p className="font-medium text-emerald-300">Prediction successful</p><p className="mt-2 text-slate-400">{prediction.model}</p></div>
                                                <p className="mt-4 text-xs leading-5 text-slate-400">Estimated from the operating measurements you provided.</p>
                                            </motion.div>
                                        ) : <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-5 text-center"><BrainCircuit className="text-cyan-300" size={26} /><p className="mt-4 font-semibold text-white">Ready to estimate current power</p><p className="mt-2 text-sm text-slate-400">Your plant readings will be used only for this operational AC-power estimate.</p></div>}
                                        <div className="mt-5 border-t border-white/10 pt-4">
                                            <button type="button" onClick={() => setShowModelPerformance((value) => !value)} className="flex w-full items-center justify-between text-left text-sm font-medium text-white"><span>How is this estimate calculated?</span>{showModelPerformance ? <ChevronUp size={16} className="text-cyan-300" /> : <ChevronDown size={16} className="text-cyan-300" />}</button>
                                            {showModelPerformance && <div className="mt-3 text-xs leading-5 text-slate-400"><p>The platform uses a trained machine-learning model to estimate AC power from the current operating conditions you provide.</p><p className="mt-3">Model: Random Forest Regressor · R²: 0.999599 · MAE: 1.05 kW · RMSE: 1.83 kW.</p><p className="mt-3">R² describes variation explained in the evaluation dataset; it is not a guarantee for every plant or condition. This tool estimates current AC power, not future annual energy generation.</p></div>}
                                        </div>
                                        {siteId && <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">Prediction History</p>{predictionHistory.length ? <div className="mt-3 space-y-2">{predictionHistory.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between text-xs text-slate-400"><span>{new Date(item.created_at).toLocaleString()}</span><span className="font-medium text-white">{formatPredictionWatts(item.predicted_ac_power_watts)} W</span></div>)}</div> : <p className="mt-2 text-xs text-slate-500">No saved predictions for this site yet.</p>}</div>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Site-analysis workflow */}
                <AnimatePresence mode="wait">
                    {!showPlantEstimator && !report && (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-strong rounded-3xl p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                                    <Search className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-white">Select Deployment Site</h2>
                                    <p className="text-slate-400">Choose a renewable energy site for environmental assessment.</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-6">
                                <LocationSearch onLocationSelect={setSelectedLocation} />

                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-display text-lg font-semibold text-white">Already have a solar plant?</p>
                                            <p className="mt-1 max-w-xl text-sm text-slate-400">Estimate current plant power from the operating readings you already collect.</p>
                                        </div>
                                        <Button variant="secondary" onClick={() => setShowPlantEstimator(true)} icon={<Zap size={18} />}>Estimate Plant Power</Button>
                                    </div>
                                </div>

                                {selectedLocation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPinned className="text-cyan-400" size={20} />
                                            <h3 className="font-display text-lg font-semibold text-cyan-300">Selected Location</h3>
                                        </div>
                                        <p className="mt-3 text-white">{selectedLocation.name}</p>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="rounded-xl bg-white/[0.03] p-4">
                                                <p className="text-xs text-slate-400">Latitude</p>
                                                <p className="mt-1 font-mono font-semibold text-white">{selectedLocation.latitude}</p>
                                            </div>
                                            <div className="rounded-xl bg-white/[0.03] p-4">
                                                <p className="text-xs text-slate-400">Longitude</p>
                                                <p className="mt-1 font-mono font-semibold text-white">{selectedLocation.longitude}</p>
                                            </div>
                                        </div>
                                        <Button className="mt-6 w-full" onClick={analyzeSite} disabled={loading || editingLocation}>
                                            {loading ? "Analyzing..." : editingLocation ? "Save or Cancel Location Edit" : "Analyze Location"}
                                        </Button>
                                    </motion.div>
                                )}

                                {selectedSiteMap}

                                {loading && (
                                    <p className="flex items-center gap-2 text-cyan-400">
                                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-energy-pulse" />
                                        Analyzing your selected site...
                                    </p>
                                )}

                                {analysisError && (
                                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                                        <p>{analysisError}</p>
                                        <Button className="mt-3" variant="secondary" onClick={analyzeSite} disabled={loading}>Retry analysis</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {!showPlantEstimator && report && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-8 space-y-8"
                        >
                            {/* Overall Score Hero */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative overflow-hidden rounded-3xl glass-strong p-8"
                            >
                                <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl animate-aurora" />
                                <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl animate-aurora" style={{ animationDelay: "-5s" }} />
                                <div className="relative z-10 grid gap-8 md:grid-cols-3 md:items-center">
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="text-cyan-400" size={24} />
                                            <h2 className="font-display text-2xl font-bold text-white">Resource Assessment</h2>
                                        </div>
                                        <p className="mt-4 text-2xl font-semibold text-green-300 md:text-3xl">
                                            {report.recommendation}
                                        </p>
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <div className="mb-1.5 flex justify-between text-sm">
                                                    <span className="text-slate-400">Overall Suitability</span>
                                                    <span className="font-semibold text-white">{report.overall_score}/100</span>
                                                </div>
                                                <ProgressBar value={report.overall_score} max={100} showLabel={false} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="mb-1.5 flex justify-between text-sm">
                                                        <span className="text-slate-400">Solar</span>
                                                        <span className="font-semibold text-yellow-300">{report.solar.score}/100</span>
                                                    </div>
                                                    <ProgressBar value={report.solar.score} max={100} color="from-yellow-400 to-orange-500" />
                                                </div>
                                                <div>
                                                    <div className="mb-1.5 flex justify-between text-sm">
                                                        <span className="text-slate-400">Wind</span>
                                                        <span className="font-semibold text-blue-300">{report.wind.score}/100</span>
                                                    </div>
                                                    <ProgressBar value={report.wind.score} max={100} color="from-blue-400 to-cyan-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <Gauge value={report.overall_score} max={100} size={190} color="#22d3ee" label="Score" sublabel={report.site_suitability?.category} />
                                    </div>
                                </div>

                                {pdfError && <div className="relative z-10 mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{pdfError}</div>}

                                {/* Recommendation chips */}
                                <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <p className="text-xs text-slate-400">Recommended Deployment</p>
                                        <p className="mt-1 font-display text-lg font-semibold text-cyan-300">{report.deployment.recommended_deployment}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <p className="text-xs text-slate-400">Project Size</p>
                                        <p className="mt-1 font-display text-lg font-semibold text-violet-300">{report.deployment.project_size}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <p className="text-xs text-slate-400">Construction Complexity</p>
                                        <p className="mt-1 font-display text-lg font-semibold text-white">{report.deployment.construction_complexity}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/60 to-blue-500/10 p-6"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300">Site Analysis Complete</p>
                                        <h3 className="mt-2 font-display text-2xl font-bold text-white">{selectedLocation?.name || report.location.city || "Selected Site"}</h3>
                                        <p className="mt-2 text-sm text-slate-300">Your selected site has been successfully analyzed.</p>
                                    </div>
                                    <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                                        <span className="text-slate-400">Overall Site Suitability</span>
                                        <div className="mt-1 font-display text-xl font-bold text-emerald-300">{report.overall_score} / 100</div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Button variant="secondary" onClick={() => setShowSiteReport(true)} icon={<FileText size={18} />}>
                                        View Site Analysis Report
                                    </Button>
                                    <Button onClick={downloadPdfReport} disabled={pdfLoading} icon={pdfLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />}>
                                        {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
                                    </Button>
                                </div>

                                {pdfError && (
                                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        {pdfError}
                                    </div>
                                )}
                            </motion.div>

                            {showSiteReport && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card hover={false} className="border border-cyan-400/20">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Solar & Wind Deployment Intelligence</p>
                                                <h2 className="mt-1 font-display text-2xl font-bold text-white">Site Analysis Report</h2>
                                                <p className="mt-2 text-sm text-slate-400">{selectedLocation?.name || report.location.city} · {selectedLocation?.latitude}, {selectedLocation?.longitude}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <PageBackButton label="Back to Analysis" onClick={() => setShowSiteReport(false)} />
                                                <Button onClick={downloadPdfReport} disabled={pdfLoading} icon={pdfLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />}>
                                                    {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Overall assessment</p>
                                                <p className="mt-2 text-lg font-semibold text-emerald-300">{report.recommendation}</p>
                                                <p className="mt-2 text-sm text-slate-300">Overall suitability: {report.overall_score}/100 · Solar: {report.solar.score}/100 · Wind: {report.wind.score}/100</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Recommended deployment</p>
                                                <p className="mt-2 text-lg font-semibold text-cyan-300">{report.deployment.recommended_deployment}</p>
                                                <p className="mt-2 text-sm text-slate-300">{report.deployment.project_size} project · {report.deployment.construction_complexity} construction complexity</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Solar assessment</p>
                                                <p className="mt-2 text-sm text-slate-300">GHI: {report.solar.ghi} kWh/m² · Temperature: {report.solar.temperature} °C · Score: {report.solar.score}/100 · Category: {report.solar.category}</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Wind assessment</p>
                                                <p className="mt-2 text-sm text-slate-300">Wind speed: {report.wind.speed} m/s · Power density: {report.wind.power_density} W/m² · Score: {report.wind.score}/100 · Category: {report.wind.category}</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Terrain assessment</p>
                                                <p className="mt-2 text-sm text-slate-300">Elevation: {report.terrain.elevation} m · Source: {report.terrain.source} · Construction complexity: {report.deployment.construction_complexity}</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                                <p className="text-xs text-slate-400">Planning insights</p>
                                                <p className="mt-2 text-sm text-slate-300">{report.investment.decision} · Estimated ROI: {report.investment.estimated_roi} · Investment level: {report.investment.investment_level}</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:col-span-2">
                                                <p className="text-xs text-slate-400">Key findings</p>
                                                <p className="mt-2 text-sm text-slate-300">This site was assessed as {report.recommendation}. Solar conditions are {report.solar.category.toLowerCase()} and wind conditions are {report.wind.category.toLowerCase()}, with a recommended deployment of {report.deployment.recommended_deployment} and an investment decision of {report.investment.decision}.</p>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:col-span-2">
                                                <p className="text-xs text-slate-400">Assumptions and data limitations</p>
                                                <p className="mt-2 text-sm text-slate-300">The assessment is based on available environmental, terrain and resource data for the selected coordinates. Detailed engineering, grid, permitting and land-use review may still be required before final implementation.</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Location + Solar + Wind + Terrain */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(0)}>
                                    <Card hover={false} className="h-full">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-500 shadow-lg">
                                                <Globe className="text-white" size={22} />
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-white">Location</h3>
                                        </div>
                                        <div className="mt-5 space-y-2 text-sm text-slate-300">
                                            <p><span className="text-slate-500">Country:</span> <span className="font-medium text-white">{report.location.country}</span></p>
                                            <p><span className="text-slate-500">State:</span> <span className="font-medium text-white">{report.location.state}</span></p>
                                            <p><span className="text-slate-500">District:</span> <span className="font-medium text-white">{report.location.district}</span></p>
                                            <p><span className="text-slate-500">City:</span> <span className="font-medium text-white">{report.location.city}</span></p>
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(1)}>
                                    <Card hover={false} className="h-full">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                                                <Sun className="text-white" size={22} />
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-white">Solar Analysis</h3>
                                        </div>
                                        <div className="mt-5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Global Horizontal Irradiance</p>
                                                <p className="mt-1 font-display text-4xl font-bold text-yellow-300">
                                                    <AnimatedCounter value={report.solar.ghi} decimals={2} /> <span className="text-lg text-slate-400">kWh/m²</span>
                                                </p>
                                            </div>
                                            <Badge color="amber">{report.solar.category}</Badge>
                                        </div>
                                        <div className="mt-5 space-y-3 text-sm">
                                            <p className="text-slate-400">Temperature <span className="float-right font-medium text-white">{report.solar.temperature} °C</span></p>
                                            <ProgressBar value={report.solar.score} max={100} color="from-yellow-400 to-orange-500" />
                                            <p className="text-slate-400">Solar Score <span className="float-right font-semibold text-yellow-300">{report.solar.score}/100</span></p>
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(2)}>
                                    <Card hover={false} className="h-full">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg">
                                                <Wind className="text-white" size={22} />
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-white">Wind Analysis</h3>
                                        </div>
                                        <div className="mt-5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Wind Speed</p>
                                                <p className="mt-1 font-display text-4xl font-bold text-blue-300">
                                                    <AnimatedCounter value={report.wind.speed} decimals={2} /> <span className="text-lg text-slate-400">m/s</span>
                                                </p>
                                            </div>
                                            <Badge color="blue">{report.wind.category}</Badge>
                                        </div>
                                        <div className="mt-5 space-y-3 text-sm">
                                            <p className="text-slate-400">Power Density <span className="float-right font-medium text-white">{report.wind.power_density} W/m²</span></p>
                                            <ProgressBar value={report.wind.score} max={100} color="from-blue-400 to-cyan-400" />
                                            <p className="text-slate-400">Wind Score <span className="float-right font-semibold text-blue-300">{report.wind.score}/100</span></p>
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(3)}>
                                    <Card hover={false} className="h-full">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                                                <Mountain className="text-white" size={22} />
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-white">Terrain</h3>
                                        </div>
                                        <div className="mt-5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Elevation</p>
                                                <p className="mt-1 font-display text-4xl font-bold text-emerald-300">
                                                    <AnimatedCounter value={report.terrain.elevation} /> <span className="text-lg text-slate-400">m</span>
                                                </p>
                                            </div>
                                            <Sprout className="text-emerald-400/40" size={32} />
                                        </div>
                                        <div className="mt-5 space-y-3 text-sm">
                                            <p className="text-slate-400">Source <span className="float-right font-medium text-white">{report.terrain.source}</span></p>
                                            <p className="text-slate-400">Complexity <span className="float-right font-medium text-white">{report.deployment.construction_complexity}</span></p>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(4)}>
                                <Card hover={false} className="border border-cyan-400/15">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600"><Zap className="text-white" size={21} /></div>
                                            <div><p className="font-display text-lg font-semibold text-white">Already have a solar plant?</p><p className="mt-1 text-sm text-slate-400">Estimate current plant power from your operating readings in a separate workflow.</p></div>
                                        </div>
                                        <Button variant="secondary" onClick={() => setShowPlantEstimator(true)} icon={<Zap size={18} />}>Estimate Plant Power</Button>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Existing-plant workflow is intentionally separate from site analysis. */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(4)} className="hidden">
                                <Card hover={false} className="relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_35%)]" />
                                    <div className="relative">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                                                <BrainCircuit className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h2 className="font-display text-xl font-bold text-white">AI Solar Power Estimation</h2>
                                                <p className="text-sm text-slate-400">Estimate AC power from current solar operating conditions.</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-5 lg:grid-cols-[1.8fr_0.9fr]">
                                            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/35 p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Selected site</p>
                                                        <p className="mt-1 font-medium text-white">{selectedLocation?.name || report.location.city || "Analyzed deployment site"}</p>
                                                        <p className="mt-1 text-sm text-slate-400">{report.location.city}, {report.location.state}, {report.location.country}</p>
                                                    </div>
                                                    <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200">
                                                        Random Forest
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-xl border border-blue-400/15 bg-blue-500/5 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Activity className="mt-0.5 shrink-0 text-blue-300" size={18} />
                                                        <div className="text-sm">
                                                            <p className="font-medium text-white">Available site analysis</p>
                                                            <p className="mt-1 text-slate-400">Solar resource: {report.solar.ghi} kWh/m² · Temperature: {report.solar.temperature} °C · Wind: {report.wind.speed} m/s</p>
                                                            <p className="mt-2 text-xs text-slate-500">These planning values are displayed for context and are not substituted for the model’s required operating measurements.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={18} />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-100">Operating electrical data is required for this model.</p>
                                                            <p className="mt-1 text-xs leading-5 text-slate-400">No verified live electrical sensor feed is connected to this site analysis. Enter current operating measurements manually to generate an estimate.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button type="button" onClick={() => setShowPlantEstimator((value) => !value)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm font-medium text-white transition hover:border-cyan-400/30 hover:bg-cyan-500/5" aria-expanded={showPlantEstimator}>
                                                    <span>{showPlantEstimator ? "Hide manual operating data" : "Enter operating data manually"}</span>
                                                    {showPlantEstimator ? <ChevronUp size={17} className="text-cyan-300" /> : <ChevronDown size={17} className="text-cyan-300" />}
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {showPlantEstimator && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                            <div className="pt-5">
                                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Environmental operating measurements</p>
                                                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                                                    {environmentalPredictionFields.map((key) => {
                                                                        const config = predictionFieldConfig[key];
                                                                        return <label key={key} className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">{config.label} ({config.unit})</span><input type="number" step="any" value={predictionInputs[key]} onChange={handlePredictionInputChange(key)} aria-label={`${config.label} ${config.unit}`} className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ${predictionInputErrors[key] ? "border-red-400/70 focus:ring-red-500/50" : "border-white/10 focus:ring-cyan-500/50"}`} />{predictionInputErrors[key] && <span className="mt-1.5 block text-xs text-red-300">{predictionInputErrors[key]}</span>}</label>;
                                                                    })}
                                                                </div>
                                                                <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Required electrical operating data</p>
                                                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                                                    {electricalPredictionFields.map((key) => {
                                                                        const config = predictionFieldConfig[key];
                                                                        return <label key={key} className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">{config.label} ({config.unit})</span><input type="number" min="0" step="any" value={predictionInputs[key]} onChange={handlePredictionInputChange(key)} aria-label={`${config.label} ${config.unit}`} className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ${predictionInputErrors[key] ? "border-red-400/70 focus:ring-red-500/50" : "border-white/10 focus:ring-cyan-500/50"}`} />{predictionInputErrors[key] && <span className="mt-1.5 block text-xs text-red-300">{predictionInputErrors[key]}</span>}</label>;
                                                                    })}
                                                                </div>
                                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="flex items-center gap-2 text-xs text-slate-400"><Info className="text-cyan-400" size={14} /> Using manually entered operating conditions.</div>
                                                                    <Button onClick={predictPower} disabled={predictionLoading} variant="primary" className="min-w-[190px]" icon={predictionLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Zap size={18} />}>{predictionLoading ? "Estimating..." : "Estimate AC Power"}</Button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {predictionError && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{predictionError}</div>}
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                                {prediction ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="h-full"
                                                    >
                                                        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-300">AI Power Estimation</p>
                                                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                                                            <Activity className="text-cyan-400" size={16} />
                                                            Predicted AC Power
                                                        </div>
                                                        <div className="mt-3 text-4xl font-bold leading-none text-white sm:text-5xl">
                                                            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                                                                {formatPredictionWatts(prediction.predicted_ac_power_watts)}
                                                            </span>
                                                            <span className="ml-2 align-middle text-base font-medium text-slate-400">W</span>
                                                        </div>
                                                        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                                <span className="text-slate-400">Model</span>
                                                                <span className="font-medium text-white">{prediction.model}</span>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                                                <span className="text-slate-400">Status</span>
                                                                <span className="font-medium text-emerald-300">Prediction successful</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-4 text-xs text-slate-400">Based on manually entered environmental and electrical operating conditions.</p>
                                                    </motion.div>
                                                ) : (
                                                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-5 text-center">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300">
                                                            <BrainCircuit size={24} />
                                                        </div>
                                                        <p className="mt-4 text-lg font-semibold text-white">Ready for operating data</p>
                                                        <p className="mt-2 max-w-xs text-sm text-slate-400">
                                                            Open manual entry to provide the operating measurements required for an AC power estimate.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-5 border-t border-white/10 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowModelPerformance((value) => !value)}
                                                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left text-sm font-medium text-white transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                                                    >
                                                        <span>Model Performance</span>
                                                        {showModelPerformance ? <ChevronUp size={16} className="text-cyan-300" /> : <ChevronDown size={16} className="text-cyan-300" />}
                                                    </button>

                                                    <AnimatePresence initial={false}>
                                                        {showModelPerformance && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="mt-4 space-y-3">
                                                                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <p className="font-medium text-white">Random Forest</p>
                                                                            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-200">
                                                                                Selected Model
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                                                                            <div className="rounded-lg bg-slate-900/40 p-2"><p className="text-slate-400">R²</p><p className="mt-1 font-semibold text-white">0.999599</p></div>
                                                                            <div className="rounded-lg bg-slate-900/40 p-2"><p className="text-slate-400">MAE</p><p className="mt-1 font-semibold text-white">1.05 kW</p></div>
                                                                            <div className="rounded-lg bg-slate-900/40 p-2"><p className="text-slate-400">RMSE</p><p className="mt-1 font-semibold text-white">1.83 kW</p></div>
                                                                        </div>
                                                                        <p className="mt-3 text-xs leading-5 text-slate-400">R² describes how much variance in the held-out test target is explained by the model. It is not equivalent to prediction accuracy.</p>
                                                                    </div>

                                                                    <div className="rounded-xl border border-white/10 bg-slate-900/30 p-3">
                                                                        <p className="font-medium text-white">XGBoost</p>
                                                                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                                                                            <div className="rounded-lg bg-slate-950/40 p-2"><p className="text-slate-400">R²</p><p className="mt-1 font-semibold text-white">0.999441</p></div>
                                                                            <div className="rounded-lg bg-slate-950/40 p-2"><p className="text-slate-400">MAE</p><p className="mt-1 font-semibold text-white">1410.91</p></div>
                                                                            <div className="rounded-lg bg-slate-950/40 p-2"><p className="text-slate-400">RMSE</p><p className="mt-1 font-semibold text-white">2160.94</p></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Deployment Recommendation */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(5)}>
                                <Card hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                                            <Target className="text-white" size={22} />
                                        </div>
                                        <h2 className="font-display text-xl font-bold text-white">Deployment Recommendation</h2>
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {callout(<Sun className="text-white" size={20} />, "Recommended Deployment", report.deployment.recommended_deployment, "from-cyan-500 to-blue-500")}
                                        {callout(<AlertTriangle className="text-white" size={20} />, "Investment Risk", report.deployment.investment_risk, "from-red-500 to-orange-500")}
                                        {callout(<TrendingUp className="text-white" size={20} />, "Deployment Priority", report.deployment.deployment_priority, "from-emerald-500 to-teal-400")}
                                        {callout(<Layers className="text-white" size={20} />, "Project Size", report.deployment.project_size, "from-violet-500 to-purple-400")}
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                            <p className="text-xs text-slate-400">Risk</p>
                                            <Badge color={riskColor(report.deployment.investment_risk)} className="mt-2">{report.deployment.investment_risk}</Badge>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                            <p className="text-xs text-slate-400">Priority</p>
                                            <Badge color={priorityColor(report.deployment.deployment_priority)} className="mt-2">{report.deployment.deployment_priority}</Badge>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                            <p className="text-xs text-slate-400">Complexity</p>
                                            <Badge color={complexityColor(report.deployment.construction_complexity)} className="mt-2">{report.deployment.construction_complexity}</Badge>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Forecast */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(5)}>
                                <Card hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg">
                                            <BarChart3 className="text-white" size={22} />
                                        </div>
                                        <h2 className="font-display text-xl font-bold text-white">Energy Forecast</h2>
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {callout(<TrendingUp className="text-white" size={20} />, "Future Potential", report.forecast.future_potential, "from-emerald-500 to-teal-400")}
                                        {callout(<TrendingUp className="text-white" size={20} />, "Growth Trend", report.forecast.growth_trend, "from-cyan-500 to-blue-500")}
                                        {callout(<GaugeIcon className="text-white" size={20} />, "Forecast Confidence", report.forecast.confidence, "from-amber-400 to-orange-500")}
                                        {callout(<Sprout className="text-white" size={20} />, "Prediction", report.forecast.prediction, "from-violet-500 to-purple-400")}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Investment */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(6)}>
                                <Card hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                            <Coins className="text-white" size={22} />
                                        </div>
                                        <h2 className="font-display text-xl font-bold text-white">Investment Recommendation</h2>
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {callout(<CheckCircle2 className="text-white" size={20} />, "Investment Decision", report.investment.decision, "from-green-500 to-emerald-500")}
                                        {callout(<TrendingUp className="text-white" size={20} />, "Estimated ROI", report.investment.estimated_roi, "from-cyan-500 to-blue-500")}
                                        {callout(<Target className="text-white" size={20} />, "Investment Level", report.investment.investment_level, "from-amber-400 to-orange-500")}
                                        {callout(<Coins className="text-white" size={20} />, "Payback Period", report.investment.payback_period, "from-violet-500 to-purple-400")}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Interactive Map */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...delay(7)}>
                                {selectedSiteMap}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

import { useEffect, useState } from "react";
import api from "../services/api";

export default function Analysis() {
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const res = await api.get("/sites/");
            setSites(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const analyzeSite = async () => {
        if (!selectedSite) return;

        const site = sites.find(
            (s) => s.id === parseInt(selectedSite)
        );

        setLoading(true);

        try {
            const res = await api.post("/analysis/report", {
                latitude: site.latitude,
                longitude: site.longitude,
            });

            setReport(res.data);
        } catch (err) {
            console.error(err);
            alert("Analysis failed.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

                    <h1 className="text-4xl font-bold mb-2">
                        Environmental Analysis
                    </h1>

                    <p className="text-slate-400 mb-8">
                        Analyze environmental suitability for renewable energy deployment.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4">

                        <select
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white flex-1"
                        >
                            <option value="">Select Site</option>

                            {sites.map((site) => (
                                <option
                                    key={site.id}
                                    value={site.id}
                                >
                                    {site.site_name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={analyzeSite}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl px-8 py-3 font-semibold transition"
                        >
                            {loading ? "Analyzing..." : "Analyze"}
                        </button>

                    </div>

                    {loading && (
                        <p className="mt-6 text-cyan-400">
                            Generating renewable energy assessment...
                        </p>
                    )}

                </div>

                {report && (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                        {/* Location */}

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

                            <h2 className="text-cyan-400 text-xl font-bold mb-4">
                                📍 Location
                            </h2>

                            <p><strong>Country:</strong> {report.location.country}</p>
                            <p><strong>State:</strong> {report.location.state}</p>
                            <p><strong>District:</strong> {report.location.district}</p>
                            <p><strong>City:</strong> {report.location.city}</p>

                        </div>

                        {/* Solar */}

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

                            <h2 className="text-yellow-400 text-xl font-bold mb-4">
                                ☀ Solar Analysis
                            </h2>

                            <p>Average GHI</p>

                            <h1 className="text-5xl font-bold mt-2">
                                {report.solar.ghi}
                            </h1>

                            <p className="text-slate-400 mt-4">
                                Temperature: {report.solar.temperature} °C
                            </p>

                            <hr className="border-slate-700 my-4" />

                            <p>
                                <strong>Solar Score:</strong> {report.solar.score}/100
                            </p>

                            <p className="mt-2">
                                <strong>Category:</strong>{" "}
                                <span className="text-yellow-400">
                                    {report.solar.category}
                                </span>
                            </p>

                        </div>

                        {/* Wind */}

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

                            <h2 className="text-blue-400 text-xl font-bold mb-4">
                                🌬 Wind Analysis
                            </h2>

                            <p>Wind Speed</p>

                            <h1 className="text-5xl font-bold mt-2">
                                {report.wind.speed}
                            </h1>

                            <p className="text-slate-400 mt-4">
                                Power Density: {report.wind.power_density} W/m²
                            </p>

                            <hr className="border-slate-700 my-4" />

                            <p>
                                <strong>Wind Score:</strong> {report.wind.score}/100
                            </p>

                            <p className="mt-2">
                                <strong>Category:</strong>{" "}
                                <span className="text-blue-400">
                                    {report.wind.category}
                                </span>
                            </p>

                        </div>

                        {/* Terrain */}

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

                            <h2 className="text-green-400 text-xl font-bold mb-4">
                                ⛰ Terrain
                            </h2>

                            <h1 className="text-5xl font-bold">
                                {report.terrain.elevation} m
                            </h1>

                            <p className="text-slate-400 mt-4">
                                Source: {report.terrain.source}
                            </p>

                        </div>

                        {/* Resource Assessment */}

                        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6">

                            <h2 className="text-purple-400 text-2xl font-bold mb-6">
                                ⭐ Resource Assessment Report
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div className="bg-slate-800 rounded-xl p-5 text-center">
                                    <p className="text-slate-400">
                                        Overall Score
                                    </p>

                                    <h1 className="text-5xl font-bold text-purple-400 mt-3">
                                        {report.overall_score}
                                    </h1>

                                    <p className="mt-2 text-slate-400">
                                        out of 100
                                    </p>
                                </div>

                                <div className="md:col-span-2 bg-slate-800 rounded-xl p-5">

                                    <h3 className="text-lg font-semibold mb-3">
                                        Recommendation
                                    </h3>

                                    <p className="text-green-400 text-lg font-semibold">
                                        {report.recommendation}
                                    </p>

                                    <div className="mt-5 grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-slate-400">
                                                Solar Score
                                            </p>

                                            <p className="text-2xl font-bold text-yellow-400">
                                                {report.solar.score}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">
                                                Wind Score
                                            </p>

                                            <p className="text-2xl font-bold text-blue-400">
                                                {report.wind.score}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>
        </div>
    );
}
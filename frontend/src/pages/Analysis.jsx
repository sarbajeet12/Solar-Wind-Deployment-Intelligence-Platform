import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
    MapPinned,
    Sun,
    Wind,
    Mountain,
    BadgeCheck,
    ArrowLeft,
    RotateCcw,
    Search,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import SiteMap from "../components/map/SiteMap";
import api from "../services/api";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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

            const res = await api.post(
                "/analysis/report",
                {
                    latitude: site.latitude,
                    longitude: site.longitude,
                }
            );

            setReport(res.data);

        } catch (err) {

            console.error(err);
            alert("Analysis failed.");

        }

        setLoading(false);

    };

    const resetAnalysis = () => {
        setReport(null);
        setSelectedSite("");
    };

    return (
        <>
            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-[#050816] p-6"
            >

                <PageHeader
                    title="Environmental Analysis"
                    subtitle="Analyze renewable energy suitability using environmental intelligence."
                    badge="ANALYSIS"
                    action={
                        report && (
                            <div className="flex gap-3">

                                <Button
                                    variant="secondary"
                                    onClick={resetAnalysis}
                                >
                                    <ArrowLeft size={18} />
                                    Back
                                </Button>

                                <Button
                                    onClick={resetAnalysis}
                                >
                                    <RotateCcw size={18} />
                                    Analyze Another Site
                                </Button>

                            </div>
                        )
                    }
                />

                {!report && (

                    <Card
                        className="mt-8"
                        hover={false}
                    >

                        <div className="flex items-center gap-3 mb-6">

                            <Search
                                className="text-cyan-400"
                                size={28}
                            />

                            <div>

                                <h2 className="text-2xl font-bold text-white">
                                    Select Deployment Site
                                </h2>

                                <p className="text-slate-400">
                                    Choose a renewable energy site for environmental assessment.
                                </p>

                            </div>

                        </div>

                        <div className="flex flex-col md:flex-row gap-4">

                            <select
                                value={selectedSite}
                                onChange={(e) =>
                                    setSelectedSite(
                                        e.target.value
                                    )
                                }
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                            >

                                <option value="">
                                    Select Site
                                </option>

                                {sites.map((site) => (

                                    <option
                                        key={site.id}
                                        value={site.id}
                                    >
                                        {site.site_name}
                                    </option>

                                ))}

                            </select>

                            <Button
                                onClick={analyzeSite}
                                disabled={loading}
                            >

                                {loading
                                    ? "Analyzing..."
                                    : "Analyze"}

                            </Button>

                        </div>

                        {loading && (

                            <p className="mt-6 text-cyan-400">
                                Generating renewable energy assessment...
                            </p>

                        )}

                    </Card>

                )}

                {report && (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                        {/* Location */}

                        <Card hover={false}>

                            <div className="flex items-center gap-3 mb-5">

                                <MapPinned
                                    className="text-cyan-400"
                                    size={28}
                                />

                                <h2 className="text-2xl font-bold text-white">
                                    Location
                                </h2>

                            </div>

                            <div className="space-y-3 text-slate-300">

                                <p><strong>Country:</strong> {report.location.country}</p>
                                <p><strong>State:</strong> {report.location.state}</p>
                                <p><strong>District:</strong> {report.location.district}</p>
                                <p><strong>City:</strong> {report.location.city}</p>

                            </div>

                        </Card>

                        {/* Solar */}

                        <Card hover={false}>

                            <div className="flex items-center gap-3 mb-5">

                                <Sun
                                    className="text-yellow-400"
                                    size={28}
                                />

                                <h2 className="text-2xl font-bold text-white">
                                    Solar Analysis
                                </h2>

                            </div>

                            <h1 className="text-5xl font-bold text-yellow-400">
                                {report.solar.ghi}
                            </h1>

                            <p className="text-slate-400 mt-4">
                                Temperature : {report.solar.temperature} °C
                            </p>

                            <hr className="border-slate-700 my-5" />

                            <p className="text-white">
                                Solar Score :
                                <span className="text-yellow-400 font-bold ml-2">
                                    {report.solar.score}/100
                                </span>
                            </p>

                            <p className="mt-3 text-slate-300">
                                Category :
                                <span className="text-yellow-400 font-semibold ml-2">
                                    {report.solar.category}
                                </span>
                            </p>

                        </Card>

                        {/* Wind */}

                        <Card hover={false}>

                            <div className="flex items-center gap-3 mb-5">

                                <Wind
                                    className="text-blue-400"
                                    size={28}
                                />

                                <h2 className="text-2xl font-bold text-white">
                                    Wind Analysis
                                </h2>

                            </div>

                            <h1 className="text-5xl font-bold text-blue-400">
                                {report.wind.speed}
                            </h1>

                            <p className="text-slate-400 mt-4">
                                Power Density :
                                {" "}
                                {report.wind.power_density} W/m²
                            </p>

                            <hr className="border-slate-700 my-5" />

                            <p className="text-white">
                                Wind Score :
                                <span className="text-blue-400 font-bold ml-2">
                                    {report.wind.score}/100
                                </span>
                            </p>

                            <p className="mt-3 text-slate-300">
                                Category :
                                <span className="text-blue-400 font-semibold ml-2">
                                    {report.wind.category}
                                </span>
                            </p>

                        </Card>

                        {/* Terrain */}

                        <Card hover={false}>

                            <div className="flex items-center gap-3 mb-5">

                                <Mountain
                                    className="text-green-400"
                                    size={28}
                                />

                                <h2 className="text-2xl font-bold text-white">
                                    Terrain
                                </h2>

                            </div>

                            <h1 className="text-5xl font-bold text-green-400">
                                {report.terrain.elevation} m
                            </h1>

                            <p className="text-slate-400 mt-5">
                                Source : {report.terrain.source}
                            </p>

                        </Card>

                      {/* Resource Assessment */}

                    <Card
                        hover={false}
                        className="lg:col-span-2"
                    >

                        <div className="flex items-center gap-3 mb-6">

                            <BadgeCheck
                                className="text-purple-400"
                                size={28}
                            />

                            <h2 className="text-2xl font-bold text-white">
                                Resource Assessment
                            </h2>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="rounded-xl bg-slate-800 p-6 text-center">

                                <p className="text-slate-400">
                                    Overall Score
                                </p>

                                <h1 className="text-6xl font-bold text-purple-400 mt-3">
                                    {report.overall_score}
                                </h1>

                                <p className="text-slate-500 mt-2">
                                    out of 100
                                </p>

                            </div>

                            <div className="md:col-span-2 rounded-xl bg-slate-800 p-6">

                                <h3 className="text-xl font-semibold text-white">
                                    Recommendation
                                </h3>

                                <p className="text-green-400 text-xl mt-4 font-semibold">
                                    {report.recommendation}
                                </p>

                                <div className="grid grid-cols-2 gap-6 mt-8">

                                    <div>

                                        <p className="text-slate-400">
                                            Solar Score
                                        </p>

                                        <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                                            {report.solar.score}
                                        </h2>

                                    </div>

                                    <div>

                                        <p className="text-slate-400">
                                            Wind Score
                                        </p>

                                        <h2 className="text-4xl font-bold text-blue-400 mt-2">
                                            {report.wind.score}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </Card>


                {/* Interactive Map */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >

                    <Card hover={false}>

                        <h2 className="text-2xl font-bold text-white mb-6">
                            Interactive Deployment Map
                        </h2>

                        <SiteMap />

                    </Card>

                </motion.div>
                </div>

            )}

        </motion.div>

    </>

);

}
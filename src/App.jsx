import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { generateData, preprocessData, solveRidge, solveLasso } from './utils/math';
import { RefreshCw, Settings, Info, TrendingUp, Activity } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [lambda, setLambda] = useState(1);
  const [paths, setPaths] = useState({ lasso: [], ridge: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Generation
  useEffect(() => {
    handleGenerateData();
  }, []);

  const handleGenerateData = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const newData = generateData(100, 10, 10);
        const processed = preprocessData(newData.X, newData.y);

        const lambdaValues = [];
        for (let i = -2; i <= 4; i += 0.2) {
          lambdaValues.push(Math.pow(10, i));
        }

        const ridgePath = lambdaValues.map(l => {
          const coefs = solveRidge(processed.X, processed.y, l);
          const obj = { lambda: l };
          if (Array.isArray(coefs)) {
            coefs.forEach((c, idx) => obj[`c${idx}`] = c);
          }
          return obj;
        });

        const lassoPath = lambdaValues.map(l => {
          const coefs = solveLasso(processed.X, processed.y, l);
          const obj = { lambda: l };
          if (Array.isArray(coefs)) {
            coefs.forEach((c, idx) => obj[`c${idx}`] = c);
          }
          return obj;
        });

        setData({ ...newData, processed });
        setPaths({ lasso: lassoPath, ridge: ridgePath });
      } catch (err) {
        console.error("Error generating data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400); // Slight delay for effect
  };

  const currentCoefs = useMemo(() => {
    if (!data) return { lasso: [], ridge: [] };
    const ridge = solveRidge(data.processed.X, data.processed.y, lambda);
    const lasso = solveLasso(data.processed.X, data.processed.y, lambda);
    return { ridge, lasso };
  }, [data, lambda]);

  const colors = ['#f472b6', '#c084fc', '#818cf8', '#60a5fa', '#38bdf8', '#2dd4bf', '#4ade80', '#fbbf24', '#fb923c', '#f87171'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-300 font-mono text-xs mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-200">{entry.name}: </span>
              <span className="font-mono font-bold text-white">{Number(entry.value).toFixed(3)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-red-400 p-4">
      <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="opacity-80">{error}</p>
        <button onClick={handleGenerateData} className="mt-4 btn btn-primary">Try Again</button>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-blue-400 font-medium animate-pulse">Initializing Model...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-200 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

      {/* Header */}
      <header className="mb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          Interactive Visualization
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Lasso
          </span>
          <span className="text-slate-700 mx-4 font-light">&</span>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 text-transparent bg-clip-text">
            Ridge
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Vizualize how <span className="text-blue-400 font-semibold">L2 (Ridge)</span> shrinks coefficients and <span className="text-purple-400 font-semibold">L1 (Lasso)</span> promotes sparsity by driving them to zero.
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card backdrop-blur-md bg-slate-900/80 border-slate-800 p-6 flex flex-col gap-6 sticky top-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-indigo-400" />
                Configuration
              </h2>
              <button
                onClick={handleGenerateData}
                className="btn btn-primary flex items-center gap-2 text-sm shadow-indigo-500/20"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : 'New Dataset'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-400">Regularization (λ)</label>
                <div className="font-mono text-xl font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded">
                  {lambda.toFixed(3)}
                </div>
              </div>

              <div className="relative pt-2 pb-6">
                <input
                  type="range"
                  min="-2"
                  max="4"
                  step="0.1"
                  value={Math.log10(lambda)}
                  onChange={(e) => setLambda(Math.pow(10, parseFloat(e.target.value)))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
                <div className="absolute top-8 left-0 text-xs text-slate-600 font-mono">0.01</div>
                <div className="absolute top-8 right-0 text-xs text-slate-600 font-mono">10,000</div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                <Info className="w-4 h-4 text-sky-400" />
                Key Observations
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                  <span>
                    <strong className="text-purple-300">Lasso (L1):</strong> Performs feature selection. Notice how coefficients snap to exactly <span className="font-mono text-purple-300">0</span> one by one as λ increases.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span>
                    <strong className="text-blue-300">Ridge (L2):</strong> Shrinks all coefficients towards zero proportionally, but keeps them all active (dense solution).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Bar Chart Section */}
          <div className="card p-6 border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Coefficient Comparison
              </h2>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Current State at λ = {lambda.toFixed(2)}
              </span>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.true_coef.map((t, i) => ({
                    name: `X${i + 1}`,
                    True: t,
                    Ridge: currentCoefs.ridge[i],
                    Lasso: currentCoefs.lasso[i]
                  }))}
                  barGap={0}
                  barCategoryGap="20%"
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="True" fill="#475569" opacity={0.3} radius={[4, 4, 0, 0]} name="True Value" />
                  <Bar dataKey="Ridge" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Ridge (L2)" />
                  <Bar dataKey="Lasso" fill="#c084fc" radius={[4, 4, 0, 0]} name="Lasso (L1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Ridge Path */}
            <div className="card p-6 border-slate-800 bg-slate-900/50">
              <h3 className="text-lg font-bold mb-6 text-blue-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ridge Coefficient Path
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <LineChart data={paths.ridge} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="lambda"
                      scale="log"
                      domain={['auto', 'auto']}
                      stroke="#64748b"
                      tickFormatter={(Tick) => Number(Tick).toExponential(0)}
                      type="number"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={lambda} stroke="#ffffff" strokeDasharray="3 3" strokeOpacity={0.5} />
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={`c${i}`}
                        stroke={colors[i]}
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lasso Path */}
            <div className="card p-6 border-slate-800 bg-slate-900/50">
              <h3 className="text-lg font-bold mb-6 text-purple-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Lasso Coefficient Path
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <LineChart data={paths.lasso} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="lambda"
                      scale="log"
                      domain={['auto', 'auto']}
                      stroke="#64748b"
                      tickFormatter={(Tick) => Number(Tick).toExponential(0)}
                      type="number"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={lambda} stroke="#ffffff" strokeDasharray="3 3" strokeOpacity={0.5} />
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={`c${i}`}
                        stroke={colors[i]}
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;

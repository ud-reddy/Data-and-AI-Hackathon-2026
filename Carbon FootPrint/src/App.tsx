/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import * as d3 from "d3-hierarchy";
import Papa from "papaparse";
import { Loader2, Footprints, Info } from "lucide-react";

interface CountryData {
  country: string;
  year: number;
  co2: number;
  population: number;
  co2_per_capita: number;
  region: string;
  color: string;
}

const REGIONS = {
  AFRICA: { label: "Africa", color: "#9333ea" },
  ASIA: { label: "Asia", color: "#f97316" },
  MIDDLE_EAST: { label: "Middle East", color: "#dc2626" },
  CARIBBEAN: { label: "Caribbean", color: "#38bdf8" },
  CENTRAL_AMERICA: { label: "Central America", color: "#db2777" },
  EUROPE: { label: "Europe", color: "#16a34a" },
  NORTH_AMERICA: { label: "North America", color: "#a3e635" },
  OCEANIA: { label: "Oceania", color: "#1d4ed8" },
  SOUTH_AMERICA: { label: "South America", color: "#92400e" },
};

const MIDDLE_EAST_COUNTRIES = ["Bahrain", "Cyprus", "Egypt", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Syria", "Turkey", "United Arab Emirates", "Yemen"];
const CARIBBEAN_COUNTRIES = ["Antigua and Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica", "Dominican Republic", "Grenada", "Haiti", "Jamaica", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "Aruba", "Curacao", "Sint Maarten (Dutch part)", "British Virgin Islands", "United States Virgin Islands"];
const CENTRAL_AMERICA_COUNTRIES = ["Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama"];

const getRegionLabel = (regionKey: string) => {
  return (REGIONS as any)[regionKey]?.label || "Other";
};

const getRegion = (country: string, continent: string): string => {
  if (MIDDLE_EAST_COUNTRIES.includes(country)) return "MIDDLE_EAST";
  if (CARIBBEAN_COUNTRIES.includes(country)) return "CARIBBEAN";
  if (CENTRAL_AMERICA_COUNTRIES.includes(country)) return "CENTRAL_AMERICA";
  
  switch (continent) {
    case "Africa": return "AFRICA";
    case "Asia": return "ASIA";
    case "Europe": return "EUROPE";
    case "North America": return "NORTH_AMERICA";
    case "South America": return "SOUTH_AMERICA";
    case "Oceania": return "OCEANIA";
    default: return "ASIA";
  }
};

const DATA_URL = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv";

export default function App() {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(DATA_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filtered = (results.data as any[])
              .filter((d) => d.year >= 2007 && d.year <= 2023 && d.iso_code && d.co2 !== null)
              .map((d) => {
                const regionKey = getRegion(d.country, d.continent);
                return {
                  country: d.country,
                  year: d.year,
                  co2: d.co2,
                  population: d.population,
                  co2_per_capita: d.co2_per_capita || (d.co2 * 1000000) / (d.population || 1),
                  region: regionKey,
                  color: (REGIONS as any)[regionKey]?.color || "#ccc",
                };
              });
            setData(filtered);
            setLoading(false);
          },
          error: (err: any) => {
            setError("Failed to parse data: " + err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError("Failed to fetch data. Please check your connection.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFootLayout = (data: CountryData[], valueKey: keyof CountryData, xOffset: number, yOffset: number) => {
    const sorted = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number));
    const isLeftFoot = xOffset < 0;
    
    // Split into toes (top 5) and sole (rest)
    const toes = sorted.slice(0, 5);
    const sole = sorted.slice(5);

    // Sole layout
    const soleRoot = d3.hierarchy({ children: sole }).sum((d: any) => d[valueKey] || 0);
    const solePack = d3.pack().size([1.8, 2.2]).padding(0.002); // Even tighter
    const soleLeaves = solePack(soleRoot as any).leaves();

    // Toe positions (relative to sole) - TOES AT BOTTOM (upside down concept)
    // Big toe is on the inside (right for left foot, left for right foot)
    const baseToeOffsets = [
      { x: 0.5, y: 1.35, r: 0.26 }, // Big toe
      { x: 0.15, y: 1.5, r: 0.18 },
      { x: -0.15, y: 1.55, r: 0.15 },
      { x: -0.4, y: 1.5, r: 0.13 },
      { x: -0.6, y: 1.4, r: 0.11 }, // Pinky toe
    ];

    const toeOffsets = isLeftFoot ? baseToeOffsets : baseToeOffsets.map(o => ({ ...o, x: -o.x }));

    const toeResults = toes.map((d, i) => {
      const offset = toeOffsets[i];
      return {
        x: offset.x + xOffset,
        y: offset.y * 1.6 + yOffset,
        size: Math.sqrt(d[valueKey] as number) * (valueKey === 'co2' ? 1.9 : 38), // Tight fill
        text: `<b>${d.country}</b><br>${getRegionLabel(d.region)}<br>${valueKey === 'co2' ? 'Total' : 'Per Capita'}: ${d[valueKey]?.toLocaleString()} ${valueKey === 'co2' ? 'Mt' : 't'}`,
        color: d.color,
        country: d.country,
        data: d
      };
    });

    const soleResults = soleLeaves.map((d: any) => {
      // Anatomical width profile (t=0 top/heel, t=1 bottom/ball)
      const t = d.y / 2.2;
      
      // New reference-accurate width profile (Upside down: t=0 is heel, t=1 is ball)
      const heelWidth = 0.6 * Math.exp(-Math.pow(t - 0.1, 2) / 0.03);
      const ballWidth = 1.1 * Math.exp(-Math.pow(t - 0.85, 2) / 0.05);
      const archWidth = 0.35;
      
      const baseWidth = Math.max(heelWidth, ballWidth, archWidth);
      
      // Deep medial arch cutout (inner side)
      // Left foot: inner is right (+x). Right foot: inner is left (-x).
      const archCurve = Math.pow(Math.sin(t * Math.PI), 1.2);
      const medialShift = isLeftFoot
        ? (t > 0.2 && t < 0.8 ? -archCurve * 0.55 : 0)
        : (t > 0.2 && t < 0.8 ? archCurve * 0.55 : 0);

      return {
        x: (d.x - 0.9) * baseWidth + xOffset + medialShift,
        y: (d.y - 1.1) * 2.4 + yOffset,
        size: d.r * 880, // High fill, minimal overlap
        text: `<b>${d.data.country}</b><br>${getRegionLabel(d.data.region)}<br>${valueKey === 'co2' ? 'Total' : 'Per Capita'}: ${d.data[valueKey]?.toLocaleString()} ${valueKey === 'co2' ? 'Mt' : 't'}`,
        color: d.data.color,
        country: d.data.country,
        data: d.data
      };
    });

    return {
      x: [...soleResults.map(r => r.x), ...toeResults.map(r => r.x)],
      y: [...soleResults.map(r => r.y), ...toeResults.map(r => r.y)],
      size: [...soleResults.map(r => r.size), ...toeResults.map(r => r.size)],
      text: [...soleResults.map(r => r.text), ...toeResults.map(r => r.text)],
      color: [...soleResults.map(r => r.color), ...toeResults.map(r => r.color)],
      countries: [...soleResults.map(r => r.country), ...toeResults.map(r => r.country)],
      allData: [...soleResults.map(r => r.data), ...toeResults.map(r => r.data)],
    };
  };

  // Calculate fixed positions based on reference year (2022)
  const referenceData = useMemo(() => data.filter(d => d.year === 2022), [data]);
  const currentYearData = useMemo(() => data.filter(d => d.year === selectedYear), [data, selectedYear]);

  const top100TotalRef = useMemo(() => [...referenceData].sort((a, b) => b.co2 - a.co2).slice(0, 150), [referenceData]);
  const top100PerCapitaRef = useMemo(() => [...referenceData].sort((a, b) => b.co2_per_capita - a.co2_per_capita).slice(0, 150), [referenceData]);

  const leftFootBase = useMemo(() => getFootLayout(top100TotalRef, 'co2', -1.5, 0.4), [top100TotalRef]);
  const rightFootBase = useMemo(() => getFootLayout(top100PerCapitaRef, 'co2_per_capita', 1.5, -0.4), [top100PerCapitaRef]);

  // Map current year values to fixed positions
  const getDynamicData = (base: any, valueKey: 'co2' | 'co2_per_capita') => {
    return base.allData.map((baseD: CountryData, i: number) => {
      const currentD = currentYearData.find(d => d.country === baseD.country);
      const val = currentD ? (currentD[valueKey] as number) : 0;
      const baseVal = baseD[valueKey] as number;
      
      // Use original size if current year data is missing to keep structure, but set to 0 if we want it to disappear
      // To keep structure intact, we use the base positions and just update sizes
      const finalSize = currentD && baseVal > 0 ? (base.size[i] * Math.sqrt(val / baseVal)) : 0;

      return {
        x: base.x[i],
        y: base.y[i],
        size: finalSize || 0,
        text: currentD ? `<b>${currentD.country}</b> (${selectedYear})<br>${getRegionLabel(currentD.region)}<br>${valueKey === 'co2' ? 'Total' : 'Per Capita'}: ${currentD[valueKey]?.toLocaleString()} ${valueKey === 'co2' ? 'Mt' : 't'}` : '',
        color: baseD.color,
        country: baseD.country,
        data: currentD || baseD
      };
    });
  };

  const leftFoot = useMemo(() => {
    const dynamic = getDynamicData(leftFootBase, 'co2');
    return {
      x: dynamic.map((d: any) => d.x),
      y: dynamic.map((d: any) => d.y),
      size: dynamic.map((d: any) => d.size),
      text: dynamic.map((d: any) => d.text),
      color: dynamic.map((d: any) => d.color),
      countries: dynamic.map((d: any) => d.country),
    };
  }, [leftFootBase, currentYearData, selectedYear]);

  const rightFoot = useMemo(() => {
    const dynamic = getDynamicData(rightFootBase, 'co2_per_capita');
    return {
      x: dynamic.map((d: any) => d.x),
      y: dynamic.map((d: any) => d.y),
      size: dynamic.map((d: any) => d.size),
      text: dynamic.map((d: any) => d.text),
      color: dynamic.map((d: any) => d.color),
      countries: dynamic.map((d: any) => d.country),
    };
  }, [rightFootBase, currentYearData, selectedYear]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-serif italic">Loading Global Carbon Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-6 text-center">
        <div className="border-2 border-red-100 p-12 rounded-3xl max-w-md">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-all font-bold uppercase tracking-widest text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      {/* Main Visualization - Full Screen Focus */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-7xl h-[70vh] relative">
          {/* Floating Labels */}
          <div className="absolute top-8 left-0 w-full flex justify-between px-12 z-10 pointer-events-none">
            <div className="space-y-1">
              <h2 className="text-xs font-black tracking-[0.3em] uppercase text-gray-500">Total Emissions</h2>
              <div className="h-0.5 w-12 bg-red-500/50" />
            </div>
            <div className="space-y-1 text-right">
              <h2 className="text-xs font-black tracking-[0.3em] uppercase text-gray-500">Per Capita</h2>
              <div className="h-0.5 w-12 bg-blue-500/50 ml-auto" />
            </div>
          </div>

          <Plot
            data={[
              {
                x: leftFoot.x,
                y: leftFoot.y,
                mode: 'markers',
                type: 'scatter',
                name: 'Total CO2',
                customdata: leftFoot.countries,
                marker: {
                  size: leftFoot.size.map((s, i) => 
                    leftFoot.countries[i] === selectedCountry?.country ? s * 1.3 : s
                  ),
                  sizemode: 'area',
                  color: leftFoot.color,
                  opacity: 0.85,
                  line: { 
                    color: leftFoot.countries.map((c, i) => 
                      c === selectedCountry?.country ? '#fff' : 'rgba(255,255,255,0.4)'
                    ), 
                    width: leftFoot.countries.map((c, i) => 
                      c === selectedCountry?.country ? 3 : 1.5
                    )
                  }
                },
                text: leftFoot.text,
                hoverinfo: 'text',
              },
              {
                x: rightFoot.x,
                y: rightFoot.y,
                mode: 'markers',
                type: 'scatter',
                name: 'CO2 Per Capita',
                customdata: rightFoot.countries,
                marker: {
                  size: rightFoot.size.map((s, i) => 
                    rightFoot.countries[i] === selectedCountry?.country ? s * 1.3 : s
                  ),
                  sizemode: 'area',
                  color: rightFoot.color,
                  opacity: 0.85,
                  line: { 
                    color: rightFoot.countries.map((c, i) => 
                      c === selectedCountry?.country ? '#fff' : 'rgba(255,255,255,0.4)'
                    ), 
                    width: rightFoot.countries.map((c, i) => 
                      c === selectedCountry?.country ? 3 : 1.5
                    )
                  }
                },
                text: rightFoot.text,
                hoverinfo: 'text',
              }
            ]}
            onClick={(e) => {
              const point = e.points[0];
              const countryName = point.customdata as string;
              const countryData = currentYearData.find(d => d.country === countryName);
              if (countryData) setSelectedCountry(countryData);
            }}
            layout={{
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              showlegend: false,
              margin: { l: 0, r: 0, t: 0, b: 0 },
              xaxis: { visible: false, range: [-3.5, 3.5] },
              yaxis: { visible: false, range: [-3, 3] },
              hoverlabel: {
                bgcolor: '#111',
                bordercolor: '#444',
                font: { color: '#fff', family: 'Inter', size: 14 },
                align: 'left'
              },
              annotations: [
                {
                  x: -1.0,
                  y: -2.4, // Back to bottom for toes
                  text: "<b>CHINA</b><br><span style='color:#888;font-size:11px'>TOTAL EMISSIONS LEADER</span>",
                  showarrow: true,
                  arrowhead: 2,
                  ax: -40,
                  ay: -40, 
                  font: { size: 12, family: 'Inter', color: '#ccc' },
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderpad: 10,
                  borderwidth: 1,
                  bordercolor: 'rgba(255,255,255,0.1)'
                },
                {
                  x: 1.0,
                  y: -2.0, // Back to bottom for toes
                  text: "<b>USA</b><br><span style='color:#888;font-size:11px'>HIGH TOTAL / MODERATE PER CAPITA</span>",
                  showarrow: true,
                  arrowhead: 2,
                  ax: 40,
                  ay: -40,
                  font: { size: 12, family: 'Inter', color: '#ccc' },
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderpad: 10,
                  borderwidth: 1,
                  bordercolor: 'rgba(255,255,255,0.1)'
                }
              ]
            }}
            config={{ responsive: true, displayModeBar: false }}
            className="w-full h-full"
          />
        </div>

        {/* Year Slider */}
        <div className="w-full max-w-2xl px-8 pb-12 pt-4">
          <div className="relative group">
            <div className="flex justify-between mb-4 px-2">
              <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">2007</span>
              <span className="text-2xl font-serif italic text-blue-400">{selectedYear}</span>
              <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">2023</span>
            </div>
            <input
              type="range"
              min="2007"
              max="2023"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            <div className="flex justify-between mt-2 px-1">
              {[2007, 2011, 2015, 2019, 2023].map(year => (
                <div key={year} className="w-0.5 h-1 bg-gray-700" />
              ))}
            </div>
          </div>
        </div>

          {/* Detailed Info Card */}
          {selectedCountry && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedCountry(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCountry.color }} />
                <h3 className="text-xl font-black tracking-tight">{selectedCountry.country}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Region</p>
                  <p className="text-sm font-medium text-gray-200">{getRegionLabel(selectedCountry.region)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total CO2</p>
                    <p className="text-lg font-bold text-red-400">{selectedCountry.co2.toLocaleString()} <span className="text-xs font-normal text-gray-500">Mt</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Per Capita</p>
                    <p className="text-lg font-bold text-blue-400">{selectedCountry.co2_per_capita.toFixed(2)} <span className="text-xs font-normal text-gray-500">t</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-[9px] text-gray-500 leading-relaxed italic">
                    Data represents CO2 emissions for the year 2022. Total emissions are measured in million tonnes (Mt), while per capita is in tonnes (t) per person.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

      {/* Minimal Floating Legend */}
      <div className="fixed top-24 right-8 z-20 hidden xl:block">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col gap-4 shadow-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/10 pb-4">Regional Legend</span>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(REGIONS).map(([key, region]) => (
              <div key={key} className="flex items-center gap-3 group cursor-help" title={region.label}>
                <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: region.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                  {region.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




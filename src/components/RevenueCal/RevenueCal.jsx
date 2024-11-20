import { useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./RevenueCal.css";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueCal = () => {
  const [currentRevenue, setCurrentRevenue] = useState("");
  const [growthRate, setGrowthRate] = useState(10.0);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, avgGrowth: 0 });
  const [error, setError] = useState("");

  const calculateRevenue = () => {
    // Validation for negative inputs
    if (parseFloat(currentRevenue) < 0) {
      setError("Revenue cannot be negative.");
      return;
    }
    if (parseFloat(growthRate) < 0) {
      setError("Growth rate cannot be negative.");
      return;
    }

    setError(""); // Clear error if inputs are valid

    if (!currentRevenue) {
      alert("Please enter a valid input for current revenue.");
      return;
    }
    const revenue = parseFloat(currentRevenue);
    const growth = parseFloat(growthRate) / 100;
    let revenues = [revenue];

    for (let i = 1; i <= 5; i++) {
      const nextYearRevenue = revenues[i - 1] * (1 + growth);
      revenues.push(nextYearRevenue);
    }

    const totalRevenue = revenues.slice(1).reduce((sum, rev) => sum + rev, 0);
    const avgGrowth = (Math.pow(1 + growth, 5) - 1) * 100;

    setResults(
      revenues.slice(1).map((rev, index) => ({
        year: index + 1,
        revenue: rev,
        growth:
          index === 0 ? 0 : ((rev - revenues[index]) / revenues[index]) * 100,
      }))
    );
    setSummary({ totalRevenue, avgGrowth });
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const headers = [
      "Year",
      "Projected Revenue ($)",
      "Year-over-Year Growth (%)",
    ];
    const csvRows = [
      headers,
      ...results.map((row) => [
        `Year ${row.year}`,
        row.revenue.toFixed(2),
        `${row.growth.toFixed(2)}%`,
      ]),
    ];

    csvRows.push(
      [""],
      ["Summary"],
      ["Total Revenue ($)", summary.totalRevenue.toFixed(2)],
      ["Average Annual Growth (%)", summary.avgGrowth.toFixed(2)]
    );

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "revenue_projections.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetCalculator = () => {
    setCurrentRevenue("");
    setGrowthRate(10.0);
    setResults([]);
    setSummary({ totalRevenue: 0, avgGrowth: 0 });
    setError(""); // Clear any existing error
  };

  const chartData = {
    labels: results.map((result) => `Year ${result.year}`),
    datasets: [
      {
        label: "Projected Revenue ($)",
        data: results.map((result) => result.revenue),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="revenue-calculator">
      <h2>Revenue Upside Calculator</h2>
      <div className="input-form">
        <label className="revenue">
          Current Revenue ($):
          <input
            type="number"
            value={currentRevenue}
            onChange={(e) => setCurrentRevenue(e.target.value)}
            placeholder="Enter current revenue"
          />
        </label>
        <label className="growth-rate">
          Annual Growth Rate (%):
          <div className="growth-rate">
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
            />
            <input
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              step="0.01"
              min="0"
              max="100"
            />
            <span className="slider-value">%</span>
          </div>
        </label>
        {error && <div className="error-message">{error}</div>}{" "}
        {/* Error message */}
        <div className="button-container">
          <button onClick={calculateRevenue}>Calculate</button>
          <button onClick={resetCalculator} className="reset-button">
            Reset
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="output-section">
          <h3>Projected Revenue</h3>

          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Projected Revenue ($)</th>
                <th>Year-over-Year Growth (%)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.year}>
                  <td>Year {result.year}</td>
                  <td>{result.revenue.toFixed(2)}</td>
                  <td>{result.growth.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-section">
            <h3>Revenue Upside Summary</h3>
            <p>Total Revenue: ${summary.totalRevenue.toFixed(2)}</p>
            <p>Average Annual Growth: {summary.avgGrowth.toFixed(2)}%</p>
          </div>

          {/* Export CSV Button, Positioned Above the Chart */}
          <div className="export-section">
            <button onClick={downloadCSV} className="export-button">
              <DownloadIcon size={16} />
              Export CSV
            </button>
          </div>

          {/* Line Chart Component placed below the table */}
          <div className="line-chart">
            <Line
              data={chartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueCal;

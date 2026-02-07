import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AdminCharts({ bookings }) {
  /* ===== GROUP DATA BY DATE ===== */
  const grouped = bookings.reduce((acc, b) => {
    const date = new Date(b.travel_date).toLocaleDateString();
    acc[date] = acc[date] || { revenue: 0, count: 0 };
    acc[date].revenue += Number(b.price);
    acc[date].count += 1;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const revenueData = labels.map(d => grouped[d].revenue);
  const bookingsData = labels.map(d => grouped[d].count);

  /* ===== CHART CONFIG ===== */
  const revenueChart = {
    labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const bookingsChart = {
    labels,
    datasets: [
      {
        label: "Bookings",
        data: bookingsData,
        backgroundColor: "#16a34a",
      },
    ],
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Revenue Trend</h3>
        <Line data={revenueChart} />
      </div>

      <div className="chart-card">
        <h3>Bookings Trend</h3>
        <Bar data={bookingsChart} />
      </div>
    </div>
  );
}

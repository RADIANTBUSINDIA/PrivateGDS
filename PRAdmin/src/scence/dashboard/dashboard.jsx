import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaMapMarkerAlt } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const summaryCards = [
    { title: "Total Bookings", value: "12,380" },
    { title: "Total Revenue", value: "₹78,50,000" },
    { title: "Today's Bookings", value: "184" },
    { title: "Today's Revenue", value: "₹1,25,300" },
    { title: "Total Visitors", value: "3,240" },
    { title: "Total Routes Live", value: "780" },
  ];

  const topRoutes = [
    { route: "Bangalore - Hyderabad", bookings: 120 },
    { route: "Chennai - Coimbatore", bookings: 95 },
    { route: "Delhi - Jaipur", bookings: 90 },
    { route: "Mumbai - Pune", bookings: 85 },
    { route: "Kolkata - Siliguri", bookings: 80 },
  ];

  const bookingsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Monthly Bookings",
        data: [500, 700, 600, 850, 780, 920, 1000],
        borderColor: "#4db5ff",
        backgroundColor: "rgba(30, 30, 45, 0.3)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: [80000, 100000, 75000, 110000, 95000, 130000, 120000],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(255, 205, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(201, 203, 207, 0.5)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,

        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#1e1e2d",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#1e1e2d",
        },
      },
      y: {
        ticks: {
          color: "#1e1e2d",
        },
      },
    },
  };

  return (
    <div
      className="container-fluid py-4"
      style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
    >
      <h2 className="mb-4" style={{ color: "#1e1e2d" }}>
        Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {summaryCards.map((card, idx) => (
          <div className="col-md-2 col-sm-6" key={idx}>
            <div
              className="p-4 rounded text-center bg-white shadow-lg summary-card"
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 .5rem 1rem rgba(0,0,0,.15)";
              }}
            >
              <div
                className="text-dark fw-semibold small mb-2"
                style={{ fontSize: "13px" }}
              >
                {card.title}
              </div>
              <div
                className="fw-bold text-primary"
                style={{ fontSize: "20px" }}
              >
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="container mt-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="p-4 rounded bg-white shadow-lg chart-card">
              <h5 className="mb-3 text-dark border-bottom pb-2">
                Monthly Bookings
              </h5>
              <Line data={bookingsData} options={chartOptions} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-4 rounded bg-white shadow-lg chart-card">
              <h5 className="mb-3 text-dark border-bottom pb-2">
                Monthly Revenue
              </h5>
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Inline CSS */}
        <style>
          {`
          .chart-card {
            transition: all 0.3s ease-in-out;
          }
          .chart-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
        `}
        </style>
      </div>
      {/* Top Routes */}

      <div className="row">
        <div className="col-md-12">
          <div className="p-4 shadow rounded bg-white">
            <h5 className="mb-4 text-dark fw-bold border-bottom pb-2">
              <FaMapMarkerAlt className="me-2 text-primary" />
              Top Routes
            </h5>
            <ul className="list-group list-group-flush">
              {topRoutes.map((route, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                  style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span className="fw-medium">{route.route}</span>
                  <span className="badge bg-primary-subtle text-primary fw-semibold">
                    {route.bookings} bookings
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";

const Insights = () => {
  const chartData = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Deployment Success Rate",
        data: [65, 59, 80, 81, 56],
        fill: false,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg-image.jpg')" }}
    >
      <Navbar />
      <div className="container mx-auto py-10">
        <h1 className="text-white text-3xl mb-6">Deployment Insights</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Insights;

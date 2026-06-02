import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  const diseaseDistribution = [
    { name: 'Late Blight', value: 400 },
    { name: 'Early Blight', value: 300 },
    { name: 'Healthy', value: 500 },
    { name: 'Yellow Leaf Curl', value: 200 },
    { name: 'Septoria', value: 150 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const cropUsage = [
    { name: 'Potato', count: 1200 },
    { name: 'Tomato', count: 900 },
    { name: 'Rice', count: 600 },
    { name: 'Wheat', count: 400 },
    { name: 'Corn', count: 300 },
  ];

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <h1>Detailed Analytics</h1>
        <p>Comprehensive breakdown of system performance and agricultural data</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Disease Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={diseaseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diseaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Popular Crops</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart layout="vertical" data={cropUsage}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 14, fontWeight: 500}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 10, 10, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

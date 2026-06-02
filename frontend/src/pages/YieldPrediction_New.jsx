import React, { useState } from "react";
import { 
  Sprout, TrendingUp, DollarSign, Droplets, Sun,
  Calculator, ArrowRight, AlertCircle, CheckCircle
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import AppLayout from "../components/layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

function YieldPrediction() {
  const [state, setState] = useState({
    crop: '',
    landSize: '',
    soilType: '',
    irrigation: '',
    season: '',
    fertilizer: '',
    loading: false,
    results: null,
    error: ''
  });

  const { crop, landSize, soilType, irrigation, season, fertilizer, loading, results, error } = state;

  // Sample data
  const cropComparison = [
    { name: 'Wheat', yield: 2800, revenue: 78400 },
    { name: 'Rice', yield: 3200, revenue: 76800 },
    { name: 'Maize', yield: 2500, revenue: 62500 },
    { name: 'Cotton', yield: 1800, revenue: 90000 },
  ];

  const pieData = [
    { name: 'Seeds', value: 15, color: '#16a34a' },
    { name: 'Fertilizer', value: 25, color: '#22c55e' },
    { name: 'Irrigation', value: 20, color: '#0ea5e9' },
    { name: 'Labor', value: 30, color: '#f59e0b' },
    { name: 'Equipment', value: 10, color: '#ef4444' },
  ];

  const handlePredict = async () => {
    if (!crop || !landSize || !soilType || !irrigation || !season) {
      setState(prev => ({ ...prev, error: 'Please fill all required fields' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Simulate API call
      const mockResults = {
        predictedYield: 2800,
        totalRevenue: 78400,
        totalCost: 45600,
        profit: 32800,
        roi: 72,
        bestCrop: 'Wheat',
        confidence: 85,
        recommendations: [
          'Use organic fertilizer for better soil health',
          'Optimize irrigation schedule for water efficiency',
          'Consider crop rotation for soil fertility'
        ]
      };

      setState(prev => ({
        ...prev,
        loading: false,
        results: mockResults
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to generate prediction. Please try again.',
        results: null
      }));
    }
  };

  const ResultCard = ({ title, value, icon: Icon, color = 'green', subtitle }) => (
    <Card className={`border-2 ${
      color === 'green' ? 'border-green-200' : 
      color === 'blue' ? 'border-blue-200' : 
      'border-orange-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'green' ? 'bg-green-100' : 
          color === 'blue' ? 'bg-blue-100' : 
          'bg-orange-100'
        }`}>
          <Icon size={24} className={
            color === 'green' ? 'text-green-600' : 
            color === 'blue' ? 'text-blue-600' : 
            'text-orange-600'
          } />
        </div>
      </div>
    </Card>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <SectionHeader 
          title="Yield Prediction" 
          subtitle="Get AI-powered crop yield estimates and profitability analysis"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Farm Details
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Crop Type"
                  placeholder="e.g., Wheat, Rice, Maize"
                  value={crop}
                  onChange={(e) => setState(prev => ({ ...prev, crop: e.target.value }))}
                  icon={<Sprout size={20} />}
                />

                <Input
                  label="Land Size (acres)"
                  placeholder="e.g., 5"
                  type="number"
                  value={landSize}
                  onChange={(e) => setState(prev => ({ ...prev, landSize: e.target.value }))}
                  icon={<Calculator size={20} />}
                />

                <Input
                  label="Soil Type"
                  placeholder="e.g., Loamy, Clay, Sandy"
                  value={soilType}
                  onChange={(e) => setState(prev => ({ ...prev, soilType: e.target.value }))}
                />

                <Input
                  label="Irrigation Type"
                  placeholder="e.g., Drip, Flood, Sprinkler"
                  value={irrigation}
                  onChange={(e) => setState(prev => ({ ...prev, irrigation: e.target.value }))}
                  icon={<Droplets size={20} />}
                />

                <Input
                  label="Growing Season"
                  placeholder="e.g., Kharif, Rabi, Zaid"
                  value={season}
                  onChange={(e) => setState(prev => ({ ...prev, season: e.target.value }))}
                  icon={<Sun size={20} />}
                />

                <Input
                  label="Fertilizer Type"
                  placeholder="e.g., NPK, Organic, Urea"
                  value={fertilizer}
                  onChange={(e) => setState(prev => ({ ...prev, fertilizer: e.target.value }))}
                />

                <Button
                  variant="primary"
                  onClick={handlePredict}
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator size={20} className="mr-2" />
                      Predict Yield
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-6">
                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ResultCard
                    title="Predicted Yield"
                    value={`${results.predictedYield} kg`}
                    icon={<Sprout />}
                    color="green"
                    subtitle="per acre"
                  />
                  <ResultCard
                    title="Total Revenue"
                    value={`₹${results.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign />}
                    color="blue"
                  />
                  <ResultCard
                    title="Total Cost"
                    value={`₹${results.totalCost.toLocaleString()}`}
                    icon={<Calculator />}
                    color="orange"
                  />
                  <ResultCard
                    title="Expected Profit"
                    value={`₹${results.profit.toLocaleString()}`}
                    icon={<TrendingUp />}
                    color="green"
                  />
                </div>

                {/* Best Crop Recommendation */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🌟 Best Crop Recommendation</h4>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-bold text-green-700">{results.bestCrop}</span>
                        <Badge variant="success">Highest ROI</Badge>
                      </div>
                      <p className="text-gray-700 mt-2">
                        Based on your soil type and climate conditions, {results.bestCrop} offers the best return on investment.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">{results.roi}%</div>
                      <div className="text-sm text-gray-600">Expected ROI</div>
                    </div>
                  </div>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Crop Comparison */}
                  <Card>
                    <SectionHeader title="Crop Comparison" />
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cropComparison}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                            }}
                          />
                          <Bar dataKey="yield" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Cost Breakdown */}
                  <Card>
                    <SectionHeader title="Cost Breakdown" />
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <SectionHeader title="📋 Farming Recommendations" />
                  <div className="space-y-3">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5" />
                        <p className="text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button variant="primary" onClick={handlePredict}>
                    <Calculator size={20} className="mr-2" />
                    Recalculate
                  </Button>
                  <Button variant="outline">
                    Download Report
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Calculator size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Yield Prediction
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter farm details to get AI-powered yield estimates and profitability analysis
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default YieldPrediction;

import { useQuery } from '@tanstack/react-query';
import { Phone, Search, PhoneCall, Clock, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  totalUsers: number;
  activeToday: number;
  adminUsers: number;
  totalContacts: number;
  serviceDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
}

export function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const serviceColors = {
    police: 'bg-[hsl(207,90%,54%)]',
    medical: 'bg-[hsl(0,84.2%,60.2%)]',
    fire: 'bg-[hsl(32,95%,44%)]',
    municipal: 'bg-[hsl(142,71%,45%)]',
  };

  const topLocations = Object.entries(analytics?.locationDistribution || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  const totalUsage = Object.values(analytics?.locationDistribution || {})
    .reduce((sum: number, count) => sum + (count as number), 0);

  return (
    <div className="space-y-8">
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-total-contacts">
                  {analytics?.totalContacts || 0}
                </p>
              </div>
              <div className="bg-[hsl(207,90%,54%)] bg-opacity-10 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-[hsl(207,90%,54%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Searches</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-daily-searches">342</p>
              </div>
              <div className="bg-[hsl(142,71%,45%)] bg-opacity-10 p-3 rounded-lg">
                <Search className="w-6 h-6 text-[hsl(142,71%,45%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calls Made</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-calls-made">1,289</p>
              </div>
              <div className="bg-[hsl(0,84.2%,60.2%)] bg-opacity-10 p-3 rounded-lg">
                <PhoneCall className="w-6 h-6 text-[hsl(0,84.2%,60.2%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-avg-response">4.2s</p>
              </div>
              <div className="bg-[hsl(32,95%,44%)] bg-opacity-10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-[hsl(32,95%,44%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-text">Service Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center w-full">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Service Distribution Chart</p>
                <div className="space-y-3">
                  {analytics?.serviceDistribution && Object.entries(analytics.serviceDistribution).map(([service, count]) => {
                    const percentage = Math.round(((count as number) / analytics.totalContacts) * 100);
                    return (
                      <div key={service} className="flex items-center justify-between" data-testid={`service-stat-${service}`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 ${serviceColors[service as keyof typeof serviceColors]} rounded-full`}></div>
                          <span className="text-sm capitalize">{service} ({percentage}%)</span>
                        </div>
                        <span className="text-sm font-medium">{count as number} contacts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-text">Usage Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Usage Trends Chart</p>
                <p className="text-sm text-gray-400 mt-2">Real-time data visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-text">Top Locations by Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No location data available</div>
            ) : (
              topLocations.map(([location, count], index) => {
                const percentage = totalUsage > 0 ? Math.round(((count as number) / totalUsage) * 100) : 0;
                return (
                  <div key={location} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`location-stat-${index}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[hsl(207,90%,54%)] bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-[hsl(207,90%,54%)] text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-text">{location}</p>
                        <p className="text-sm text-gray-500">{count as number} searches this month</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-neutral-text">{percentage}%</p>
                      <p className="text-sm text-gray-500">of total usage</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

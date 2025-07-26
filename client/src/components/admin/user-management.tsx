import { useQuery } from '@tanstack/react-query';
import { Users, Activity, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@shared/schema';

interface AnalyticsData {
  totalUsers: number;
  activeToday: number;
  adminUsers: number;
  totalContacts: number;
  serviceDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
}

export function UserManagement() {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
  });

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const formatLastLogin = (lastLogin: string | Date | null) => {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-total-users">
                  {analytics?.totalUsers || users.length}
                </p>
              </div>
              <div className="bg-[hsl(207,90%,54%)] bg-opacity-10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-[hsl(207,90%,54%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-active-today">
                  {analytics?.activeToday || 0}
                </p>
              </div>
              <div className="bg-[hsl(142,71%,45%)] bg-opacity-10 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-[hsl(142,71%,45%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-3xl font-bold text-neutral-text" data-testid="text-admin-users">
                  {analytics?.adminUsers || users.filter((u: User) => u.role === 'admin').length}
                </p>
              </div>
              <div className="bg-[hsl(32,95%,44%)] bg-opacity-10 p-3 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-[hsl(32,95%,44%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-text">User Management</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Login</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50" data-testid={`row-user-${user.id}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={user.role === 'admin' ? 'bg-[hsl(207,90%,54%)] text-white' : 'bg-gray-400 text-white'}>
                              {getInitials(user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-neutral-text" data-testid={`text-user-name-${user.id}`}>
                              {user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500" data-testid={`text-user-email-${user.id}`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600" data-testid={`text-user-location-${user.id}`}>
                        {user.city && user.state ? `${user.city}, ${user.state}` : 'Not set'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600" data-testid={`text-user-last-login-${user.id}`}>
                        {formatLastLogin(user.lastLoginAt)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[hsl(207,90%,54%)] hover:text-blue-700"
                          data-testid={`button-user-actions-${user.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

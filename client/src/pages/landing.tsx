import { Shield, ShieldCheck, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-[hsl(0,84.2%,60.2%)] w-12 h-12 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Cure It</h1>
          </div>
          <p className="text-center text-gray-600 mt-2 text-lg">
            Emergency Contacts Application - Connect to Help When You Need It Most
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Access Level
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access emergency contacts for your location or manage the emergency contact database 
            with administrative privileges.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* User Login Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">User Access</CardTitle>
              <p className="text-gray-600">Find emergency contacts in your area</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Location-based emergency contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Police, Medical, Fire & Municipal services</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Click-to-call emergency numbers</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/login">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                    data-testid="button-user-login"
                  >
                    User Login
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Enter your email to access emergency contacts
              </p>
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Admin Access</CardTitle>
              <p className="text-gray-600">Manage emergency contacts & users</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span>Add, edit & delete emergency contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-500" />
                  <span>View user analytics & management</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Full database management control</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/admin-login">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    data-testid="button-admin-login"
                  >
                    Admin Login
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Administrative access required
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Notice */}
        <div className="mt-16 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Notice</h3>
          <p className="text-red-800">
            In case of life-threatening emergencies, dial <strong>112</strong> (National Emergency Number) 
            immediately. This application provides additional local contacts for your convenience.
          </p>
        </div>
      </div>
    </div>
  );
}
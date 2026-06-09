'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Bell, Lock, Database, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    maintenanceAlerts: true,
    rentalReminders: true,
    financialReports: false,
  });
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your HYPERBOX account and preferences</p>
      </div>

      {/* Account Information */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={20} />
          Account Information
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-sm">Name</p>
            <p className="font-medium">{session?.user?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Email</p>
            <p className="font-medium">{session?.user?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Role</p>
            <p className="font-medium uppercase text-primary">{(session?.user as any)?.role}</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {key === 'emailNotifications' && 'Receive email notifications for important events'}
                  {key === 'maintenanceAlerts' && 'Get alerts about scheduled maintenance'}
                  {key === 'rentalReminders' && 'Receive reminders for upcoming rentals'}
                  {key === 'financialReports' && 'Receive monthly financial reports'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleNotificationChange(key as keyof typeof notifications)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} />
          System Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Environment</span>
            <span className="font-medium">{process.env.NODE_ENV}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-900 flex items-center gap-2">
          <LogOut size={20} />
          Danger Zone
        </h2>
        <p className="text-sm text-red-800 mb-4">
          Sign out of your account. You will be redirected to the login page.
        </p>
        <Button
          onClick={handleLogout}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut size={20} className="mr-2" />
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}

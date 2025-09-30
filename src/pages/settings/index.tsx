import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, DollarSign, Globe, Bell } from 'lucide-react';

export default function SettingsIndex() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">BuildTech Construction Pvt Ltd</span>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>{' '}
                <span className="font-medium">Mumbai, Maharashtra</span>
              </div>
              <div>
                <span className="text-muted-foreground">GST:</span>{' '}
                <span className="font-mono">27AAAAA0000A1ZA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Currency:</span>{' '}
                <span className="font-medium">INR (₹)</span>
              </div>
              <div>
                <span className="text-muted-foreground">GST Default:</span>{' '}
                <span className="font-medium">18%</span>
              </div>
              <div>
                <span className="text-muted-foreground">PO Approval Threshold:</span>{' '}
                <span className="font-medium">₹1,00,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Timezone:</span>{' '}
                <span className="font-medium">Asia/Kolkata (IST)</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date Format:</span>{' '}
                <span className="font-medium">DD/MM/YYYY</span>
              </div>
              <div>
                <span className="text-muted-foreground">Number Format:</span>{' '}
                <span className="font-medium">Lakhs/Crores</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Email Notifications:</span>{' '}
                <span className="font-medium">Enabled</span>
              </div>
              <div>
                <span className="text-muted-foreground">Approval Alerts:</span>{' '}
                <span className="font-medium">Enabled</span>
              </div>
              <div>
                <span className="text-muted-foreground">SLA Warnings:</span>{' '}
                <span className="font-medium">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

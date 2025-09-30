import { useCompanyProfile, useSystemSettings, useFinancialYears } from '@/lib/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Settings2, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { data: company, isLoading: companyLoading } = useCompanyProfile();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const { data: financialYears, isLoading: fyLoading } = useFinancialYears();

  const isLoading = companyLoading || settingsLoading || fyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and preferences</p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {company && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-medium">{company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{company.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{company.gst}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {company.address}, {company.city}, {company.state} - {company.pincode}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{settings.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{settings.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Format</p>
                  <p className="font-medium">{settings.dateFormat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number Format</p>
                  <p className="font-medium capitalize">{settings.numberFormat}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tax Defaults (%)</p>
                <div className="flex gap-4">
                  <Badge variant="outline">GST: {settings.taxDefaults.gst}%</Badge>
                  <Badge variant="outline">WCT: {settings.taxDefaults.wct}%</Badge>
                  <Badge variant="outline">TDS: {settings.taxDefaults.tds}%</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Approval Thresholds</p>
                <div className="flex gap-4">
                  <Badge variant="secondary">PO: ₹{(settings.approvalThresholds.po / 100000).toFixed(1)}L</Badge>
                  <Badge variant="secondary">WO: ₹{(settings.approvalThresholds.wo / 100000).toFixed(1)}L</Badge>
                  <Badge variant="secondary">Payment: ₹{(settings.approvalThresholds.payment / 100000).toFixed(1)}L</Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Financial Years */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Financial Years
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financialYears && financialYears.length > 0 && (
            <div className="space-y-3">
              {financialYears.map((fy) => (
                <div
                  key={fy.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{fy.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fy.startDate).toLocaleDateString()} - {new Date(fy.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {fy.active && <Badge variant="default">Active</Badge>}
                    {fy.locked && <Badge variant="secondary">Locked</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

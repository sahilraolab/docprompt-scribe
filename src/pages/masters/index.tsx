import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import {
  FolderKanban, Package, Building2, Truck, Ruler,
  Users, Target, Calculator
} from 'lucide-react';

const MASTER_ITEMS = [
  {
    title: 'Projects',
    description: 'Manage construction projects',
    icon: FolderKanban,
    href: '/masters/projects',
  },
  {
    title: 'Materials',
    description: 'Material master data',
    icon: Package,
    href: '/masters/materials',
  },
  {
    title: 'Companies',
    description: 'Company information',
    icon: Building2,
    href: '/masters/companies',
  },
  {
    title: 'Suppliers',
    description: 'Supplier/vendor management',
    icon: Truck,
    href: '/masters/suppliers',
  },
  {
    title: 'Units of Measure',
    description: 'UOM definitions',
    icon: Ruler,
    href: '/masters/uoms',
  },
  {
    title: 'Departments',
    description: 'Organizational departments',
    icon: Users,
    href: '/masters/departments',
  },
  {
    title: 'Cost Centers',
    description: 'Cost center tracking',
    icon: Target,
    href: '/masters/cost-centers',
  },
  {
    title: 'Taxes',
    description: 'Tax rates and types',
    icon: Calculator,
    href: '/masters/taxes',
  },
];

export default function MastersIndex() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Masters"
        description="Manage master data for the ERP system"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MASTER_ITEMS.map((item) => (
          <NavLink key={item.href} to={item.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

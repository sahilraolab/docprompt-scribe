import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { usePartner, useCreatePartner, useUpdatePartner } from '@/lib/hooks/usePartners';

const partnerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long').or(z.literal('')),
  phone: z.string().trim().max(20, 'Phone too long').or(z.literal('')),
  type: z.enum(['Individual', 'Company']),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format').or(z.literal('')),
  gst: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/, 'Invalid GST format').or(z.literal('')),
  address: z.string().trim().max(500, 'Address too long').or(z.literal('')),
  active: z.boolean(),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export default function PartnerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  const { data: partner, isLoading: loadingPartner } = usePartner(id);
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'Individual',
      pan: '',
      gst: '',
      address: '',
      active: true,
    },
  });

  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        type: partner.type || 'Individual',
        pan: partner.pan || '',
        gst: partner.gst || '',
        address: partner.address || '',
        active: partner.active ?? true,
      });
    }
  }, [partner, reset]);

  const partnerType = watch('type');

  const onSubmit = async (data: PartnerFormData) => {
    try {
      if (isEditing && id) {
        await updatePartner.mutateAsync({ id, data });
      } else {
        await createPartner.mutateAsync(data);
      }
      navigate('/partners/list');
    } catch (error) {
      // Error toast is handled by the hooks
    }
  };

  if (loadingPartner) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Partner' : 'New Partner'}
        description={isEditing ? 'Update partner details' : 'Add a new partner or investor'}
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/partners/list'),
            icon: ArrowLeft,
            variant: 'outline',
          },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Partner name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <SearchableSelect
                  options={[
                    { value: 'Individual', label: 'Individual' },
                    { value: 'Company', label: 'Company' },
                  ]}
                  value={partnerType}
                  onChange={(value) => setValue('type', value as 'Individual' | 'Company')}
                  placeholder="Select type"
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="partner@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Tax Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  {...register('pan')}
                  placeholder="ABCDE1234F"
                  className="uppercase"
                  maxLength={10}
                />
                {errors.pan && (
                  <p className="text-sm text-destructive">{errors.pan.message}</p>
                )}
              </div>

              {partnerType === 'Company' && (
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    {...register('gst')}
                    placeholder="27ABCDE1234F1Z5"
                    className="uppercase"
                    maxLength={15}
                  />
                  {errors.gst && (
                    <p className="text-sm text-destructive">{errors.gst.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Complete address"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Partner is active and can participate in projects
                </p>
              </div>
              <Switch
                checked={watch('active')}
                onCheckedChange={(checked) => setValue('active', checked)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting || createPartner.isPending || updatePartner.isPending}>
                {(isSubmitting || createPartner.isPending || updatePartner.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Partner' : 'Create Partner'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/partners/list')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

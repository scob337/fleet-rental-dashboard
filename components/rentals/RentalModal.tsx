'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Rental {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  status: string;
}

interface RentalModalProps {
  rental: Rental | null;
  onClose: () => void;
  onSave: (data: Partial<Rental>) => void;
}

export default function RentalModal({ rental, onClose, onSave }: RentalModalProps) {
  const [formData, setFormData] = useState<Partial<Rental>>(
    rental || {
      customerId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      dailyRate: 0,
      status: 'ACTIVE',
    }
  );
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, vehiclesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
      ]);

      if (customersRes.ok && vehiclesRes.ok) {
        const customersData = await customersRes.json();
        const vehiclesData = await vehiclesRes.json();
        setCustomers(customersData);
        setVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Failed to fetch dropdown data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dailyRate' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-card">
          <h2 className="text-xl font-bold">
            {rental ? 'Edit Rental' : 'New Rental'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                name="customerId"
                value={formData.customerId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select
                name="vehicleId"
                value={formData.vehicleId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.manufacturer} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Daily Rate ($)</label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status || 'ACTIVE'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {rental ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

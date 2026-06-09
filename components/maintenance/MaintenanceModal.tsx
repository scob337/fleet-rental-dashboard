'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  status: string;
}

interface MaintenanceModalProps {
  record: MaintenanceRecord | null;
  onClose: () => void;
  onSave: (data: Partial<MaintenanceRecord>) => void;
}

export default function MaintenanceModal({ record, onClose, onSave }: MaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>(
    record || {
      vehicleId: '',
      type: '',
      description: '',
      cost: 0,
      scheduledDate: '',
      completedDate: '',
      status: 'SCHEDULED',
    }
  );
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const maintenanceTypes = [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Engine Maintenance',
    'Transmission Service',
    'Battery Replacement',
    'Fluid Top-up',
    'Inspection',
    'Repair',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-card">
          <h2 className="text-xl font-bold">
            {record ? 'Edit Maintenance' : 'Schedule Maintenance'}
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

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select maintenance type</option>
                {maintenanceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost ($)</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {formData.status === 'COMPLETED' && (
              <div>
                <label className="block text-sm font-medium mb-1">Completed Date</label>
                <input
                  type="date"
                  name="completedDate"
                  value={formData.completedDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status || 'SCHEDULED'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
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
                {record ? 'Update' : 'Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

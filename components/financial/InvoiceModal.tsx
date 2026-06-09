'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Invoice {
  id: string;
  rentalId: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (data: Partial<Invoice>) => void;
}

export default function InvoiceModal({ invoice, onClose, onSave }: InvoiceModalProps) {
  const [formData, setFormData] = useState<Partial<Invoice>>(
    invoice || {
      rentalId: '',
      customerId: '',
      amount: 0,
      dueDate: '',
      status: 'PENDING',
    }
  );
  const [rentals, setRentals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [rentalsRes, customersRes] = await Promise.all([
        fetch('/api/rentals'),
        fetch('/api/customers'),
      ]);

      if (rentalsRes.ok && customersRes.ok) {
        const rentalsData = await rentalsRes.json();
        const customersData = await customersRes.json();
        setRentals(rentalsData);
        setCustomers(customersData);
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
      [name]: name === 'amount' ? Number(value) : value,
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
            {invoice ? 'Edit Invoice' : 'New Invoice'}
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
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rental</label>
              <select
                name="rentalId"
                value={formData.rentalId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a rental</option>
                {rentals.map(rental => (
                  <option key={rental.id} value={rental.id}>
                    Rental #{rental.id.substring(0, 8)} - {rental.vehicle?.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status || 'PENDING'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
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
                {invoice ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

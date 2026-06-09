'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import RentalModal from '@/components/rentals/RentalModal';

interface Rental {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  status: string;
  customer?: { name: string; company?: string };
  vehicle?: { licensePlate: string; type: string };
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rentals');
      if (response.ok) {
        const data = await response.json();
        setRentals(data);
      }
    } catch (error) {
      console.error('Failed to fetch rentals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRental = () => {
    setSelectedRental(null);
    setShowModal(true);
  };

  const handleEditRental = (rental: Rental) => {
    setSelectedRental(rental);
    setShowModal(true);
  };

  const handleDeleteRental = async (rentalId: string) => {
    if (confirm('Are you sure you want to delete this rental?')) {
      try {
        const response = await fetch(`/api/rentals/${rentalId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setRentals(rentals.filter(r => r.id !== rentalId));
        }
      } catch (error) {
        console.error('Failed to delete rental', error);
      }
    }
  };

  const handleSaveRental = async (rentalData: Partial<Rental>) => {
    try {
      const url = selectedRental ? `/api/rentals/${selectedRental.id}` : '/api/rentals';
      const method = selectedRental ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentalData),
      });

      if (response.ok) {
        await fetchRentals();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save rental', error);
    }
  };

  const columns: Column<Rental>[] = [
    {
      key: 'id',
      label: 'Rental ID',
      sortable: true,
      render: (value) => `#${value.substring(0, 8)}`,
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value: any) => value?.name || 'N/A',
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (value: any) => value?.licensePlate || 'N/A',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'dailyRate',
      label: 'Daily Rate',
      render: (value) => `$${value}`,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditRental(row)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteRental(value)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rentals</h1>
        <Button onClick={handleAddRental}>
          <Plus size={20} className="mr-2" />
          New Rental
        </Button>
      </div>

      <DataTable columns={columns} data={rentals} loading={loading} />

      {showModal && (
        <RentalModal
          rental={selectedRental}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRental}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import EmployeeTable from './employee-tables';
import { useSession } from 'next-auth/react';

export default function EmployeeListingPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: session } = useSession();

  // Função para buscar usuários
  const fetchUsers = async () => {
    const token = session?.user?.accessToken;
    if (!token) {
      setError('Usuário não autenticado! Faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        throw new Error(data.message);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Usuários (${users.length})`}
            description="Gerencie Usuários"
          />

          <Link
            href={'/dashboard/employee/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Novo
          </Link>
        </div>
        <Separator />

        {loading && <p>Carregando usuários...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <EmployeeTable
            data={users}
            totalData={users.length}
            onUsersUpdated={fetchUsers} 
          />
        )}
      </div>
    </PageContainer>
  );
}

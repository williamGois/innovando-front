'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.'
  }),
  email: z.string().email({
    message: 'Por favor, insira um email válido.'
  }),
  password: z.string().optional(), // Senha apenas na criação
  roleId: z.string().nonempty({ message: 'Por favor, selecione um cargo.' }) // Validação obrigatória
});

export default function EmployeeForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { employeeId } = useParams(); // Captura o segmento dinâmico da rota

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      roleId: ''
    }
  });

  React.useEffect(() => {
    if (employeeId) {
      const fetchUser = async () => {
        const token = session?.user?.accessToken;

        if (!token) {
          toast.error('Usuário não autenticado! Faça login novamente.');
          return;
        }

        try {
          const response = await fetch(`http://localhost:3333/users/${employeeId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erro ao buscar os detalhes do usuário.');
          }

          const data = await response.json();
          form.reset({
            fullName: data.fullName,
            email: data.email,
            roleId: String(data.roleId)
          });
        } catch (error) {
          toast.error('Erro ao carregar os dados do usuário.');
        }
      };

      fetchUser();
    }
  }, [employeeId, session?.user?.accessToken, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = session?.user?.accessToken;

    if (!token) {
      toast.error('Usuário não autenticado! Faça login novamente.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3333/users${employeeId ? `/${employeeId}` : ''}`,
        {
          method: employeeId ? 'PUT' : 'POST', // PUT para atualizar, POST para criar
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values)
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        if (errorResponse.errors) {
          errorResponse.errors.forEach((err: any) => {
            if (err.field === 'email' && err.rule === 'database.unique') {
              toast.error('O email já está em uso. Tente outro.');
            } else {
              toast.error(err.message || 'Erro desconhecido.');
            }
          });
        } else {
          throw new Error(errorResponse.message);
        }
        return;
      }

      toast.success(`Usuário ${employeeId ? 'atualizado' : 'criado'} com sucesso!`);
      router.push('/dashboard/employee');
    } catch (error: any) {
      toast.error(
        `Erro ao ${employeeId ? 'atualizar' : 'criar'} o usuário. ` + error.message
      );
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {employeeId ? 'Atualizar Usuário' : 'Criar Usuário'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!employeeId && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Administrador</SelectItem>
                        <SelectItem value="2">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">{employeeId ? 'Atualizar' : 'Criar'}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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

// Validação do formulário com Zod
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.'
  }),
  email: z.string().email({
    message: 'Por favor, insira um email válido.'
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.'
  }),
  roleId: z
    .string()
    .nonempty({ message: 'Por favor, selecione um cargo.' }) // Validação de campo obrigatório
});

export default function ClientForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      roleId: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = session?.user?.accessToken;

    if (!token) {
      toast.error('Usuário não autenticado! Faça login novamente.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

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

      const result = await response.json();
      toast.success('Usuário criado com sucesso!');
      router.push('/dashboard/employee');
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          Informações do Usuário
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
            <Button type="submit">Enviar</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import * as z from 'zod';

// Validação de formulário
const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
});

type UserFormValue = z.infer<typeof formSchema>;

// Componente de Campo de Formulário
function AuthFormField({
  name,
  label,
  type,
  placeholder,
  disabled,
  control
}: {
  name: keyof UserFormValue;
  label: string;
  type: string;
  placeholder: string;
  disabled: boolean;
  control: any;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            className="w-full" // Garante que o campo tenha largura total
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function UserAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: callbackUrl ?? '/dashboard'
        });

        if (result?.error) {
          toast.error('Credenciais inválidas. Verifique e tente novamente.');
          return;
        }

        if (result?.url) {
          toast.success('Login efetuado com sucesso!');
          router.push(result.url);
        } else {
          toast.error('Erro inesperado ao redirecionar. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro durante o login:', error);
        toast.error('Erro inesperado. Por favor, tente novamente.');
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4" // Remove alterações indesejadas de layout
      >
        <AuthFormField
          name="email"
          label="Email"
          type="email"
          placeholder="Digite seu email..."
          disabled={isPending}
          control={form.control}
        />
        <AuthFormField
          name="password"
          label="Senha"
          type="password"
          placeholder="Digite sua senha..."
          disabled={isPending}
          control={form.control}
        />
        <Button disabled={isPending} className="w-full" type="submit">
          {isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  );
}

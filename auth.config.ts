import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'Digite seu email...' },
        password: { label: 'Senha', type: 'password', placeholder: 'Digite sua senha...' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios.');
        }

        const response = await fetch('http://localhost:3333/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });

        if (!response.ok) {
          throw new Error('Credenciais inválidas. Tente novamente.');
        }

        const user = await response.json();

        if (user && user.token?.token) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            accessToken: user.token.token
          };
        }

        throw new Error('Erro ao autenticar. Por favor, tente novamente.');
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/'
  }
} satisfies NextAuthConfig;

export default authConfig;

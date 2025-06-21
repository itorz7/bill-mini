import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
    };
  }

  interface User {
    id: string;
    username: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string;
  }
}
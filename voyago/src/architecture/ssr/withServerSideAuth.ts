import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getToken } from "next-auth/jwt";

type AuthenticatedServerSideContext = GetServerSidePropsContext & {
  auth: {
    email: string;
    role?: string;
    name?: string;
  };
};

type ServerSideFactory<Props extends Record<string, unknown>> = (
  context: AuthenticatedServerSideContext
) => Promise<GetServerSidePropsResult<Props>>;

export function withServerSideAuth<Props extends Record<string, unknown>>(factory: ServerSideFactory<Props>): GetServerSideProps<Props> {
  return async (context) => {
    const token = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return factory({
      ...context,
      auth: {
        email: token.email,
        role: typeof token.role === "string" ? token.role : undefined,
        name: typeof token.name === "string" ? token.name : undefined,
      },
    } as AuthenticatedServerSideContext);
  };
}

import type { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult } from "next";

type IsrPageFactory<Props> = (context: GetStaticPropsContext) => Promise<GetStaticPropsResult<Props>> | GetStaticPropsResult<Props>;

export function createIsrPageProps<Props extends Record<string, unknown>>(revalidate: number, factory: IsrPageFactory<Props>): GetStaticProps<Props> {
  return async (context) => {
    const result = await factory(context);

    if ("props" in result) {
      return {
        ...result,
        revalidate,
      };
    }

    return result;
  };
}

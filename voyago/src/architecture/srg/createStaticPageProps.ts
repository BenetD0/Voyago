import type { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult } from "next";

type StaticPageFactory<Props extends Record<string, unknown>> = (
  context: GetStaticPropsContext
) => Promise<GetStaticPropsResult<Props>> | GetStaticPropsResult<Props>;

export function createStaticPageProps<Props extends Record<string, unknown>>(factory: StaticPageFactory<Props>): GetStaticProps<Props> {
  return async (context) => {
    return factory(context);
  };
}

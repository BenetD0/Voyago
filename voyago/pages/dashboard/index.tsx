import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const roleParam = context.query.role
  const role = Array.isArray(roleParam) ? roleParam[0] : roleParam

  return {
    redirect: {
      destination: role === "user" ? "/dashboard/client" : "/dashboard/admin",
      permanent: false,
    },
  }
}

export default function DashboardRedirect() {
  return null
}

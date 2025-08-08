import { headers } from "next/headers";
import { FiUser } from "react-icons/fi";
import { AddFuncionarioButton } from "./components/configs";
import FuncionarioTable from "./components/FuncionarioTable";
import FuncionarioCardList from "./components/FuncionarioCardList";
import { ApiUser, Funcionario } from "@/types/funcionarios";
import { auth as authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function FuncionariosPage() {
  const session = await getServerSession(authOptions);

  if(!session || session.user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-red-600">Acesso Negado</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  let funcionarios: Funcionario[] = [];

  try {
    const headerList = headers();
    const cookieHeader = (await headerList).get("cookie") || "";

    const res = await fetch(
      `${process.env.NEXT_URL}/api/privada/users/get`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "force-cache",
      }
    );

    if (!res.ok) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-red-600">
              Erro ao carregar os dados
            </h2>
            <p className="text-gray-600 mt-2">
              Não foi possível carregar a lista de funcionários no momento. Por
              favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      );
    }

    const apiData: ApiUser[] = await res.json();

    funcionarios = apiData.map((u) => ({
      id: (u.id || u._id || u.email) as string,
      name: u.name ?? u.email.split("@")[0],
      email: u.email,
      role: u.role?.toLowerCase() === "admin" ? "admin" : "staff",
      active: String(u.active ?? true) as "true" | "false",
    }));
  } catch (err) {
    console.error("Erro ao carregar funcionários:", err);
    return null;
  }

  if (funcionarios.length === 0) {
    return (
      <div className="w-full mx-auto p-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FiUser className="text-blue-600" size={24} />
                Equipe Odontológica
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie médicos, assistentes e equipe administrativa da clínica
              </p>
            </div>
            <AddFuncionarioButton />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiUser className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Você ainda não possui funcionários cadastrados em sua clínica.
            </p>
            <AddFuncionarioButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FiUser className="text-blue-600" size={24} />
              Equipe Odontológica
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie médicos, assistentes e equipe administrativa da clínica
            </p>
          </div>
          <AddFuncionarioButton />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <FuncionarioTable funcionarios={funcionarios} />
        </div>
        <FuncionarioCardList funcionarios={funcionarios} />
        <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
          {funcionarios.length} {funcionarios.length === 1 ? "funcionário" : "funcionários"} cadastrados
        </div>
      </div>
    </div>
  );
}

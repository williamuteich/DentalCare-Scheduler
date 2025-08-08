import React from "react";
import { FiUser } from "react-icons/fi";
import ModalGeneric from "../../components/modalGeneric";
import ModalDelete from "../../components/modalDelete";
import { funcionarioModalConfig } from "./configs";
import { Funcionario } from "@/types/funcionarios";

interface FuncionarioCardListProps {
  funcionarios: Funcionario[];
}

const FuncionarioCardList: React.FC<FuncionarioCardListProps> = ({ funcionarios }) => (
  <div className="md:hidden">
    {funcionarios.map((funcionario) => (
      <div key={funcionario.id} className="flex flex-col gap-3 p-4 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FiUser className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{funcionario.name}</h3>
              <p className="text-sm text-gray-600">{funcionario.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${funcionario.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
            {funcionario.role === "admin" ? "Administrador" : "Colaborador"}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${funcionario.active === "true" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {funcionario.active === "true" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Ativo
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Inativo
              </>
            )}
          </span>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <ModalGeneric config={funcionarioModalConfig("Editar", funcionario)} params={funcionario.id} />
          <ModalDelete config={{
            id: funcionario.id,
            title: "Excluir funcionário",
            description: "Tem certeza que deseja excluir este funcionário?",
            apiEndpoint: `${process.env.NEXT_URL}/api/agendamento/users/${funcionario.id}`,
            urlRevalidate: ["/dashboard/funcionarios"],
          }} />
        </div>
      </div>
    ))}
  </div>
);

export default FuncionarioCardList;

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FiUser } from "react-icons/fi";
import ModalGeneric from "../../components/modalGeneric";
import ModalDelete from "../../components/modalDelete";
import { funcionarioModalConfig } from "./configs";
import { Funcionario } from "@/types/funcionarios";

interface FuncionarioTableProps {
  funcionarios: Funcionario[];
}

const FuncionarioTable: React.FC<FuncionarioTableProps> = ({ funcionarios }) => (
  <Table className="w-full">
    <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <TableRow className="hover:bg-indigo-700">
        <TableHead className="px-6 py-4 font-semibold uppercase text-white">Funcionário</TableHead>
        <TableHead className="px-6 py-4 font-semibold uppercase text-white">E-mail</TableHead>
        <TableHead className="px-6 py-4 font-semibold uppercase text-white">Cargo</TableHead>
        <TableHead className="px-6 py-4 font-semibold uppercase text-white">Status</TableHead>
        <TableHead className="px-6 py-4 text-right font-semibold uppercase text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {funcionarios.map((funcionario) => (
        <TableRow key={funcionario.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150">
          <TableCell className="px-6 py-4 font-medium text-gray-900">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FiUser className="text-blue-600" size={20} />
              </div>
              <span>{funcionario.name}</span>
            </div>
          </TableCell>
          <TableCell className="px-6 py-4 text-gray-700">{funcionario.email}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${funcionario.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
              {funcionario.role === "admin" ? "Administrador" : "Colaborador"}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4">
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
          </TableCell>
          <TableCell className="px-6 py-4 text-right">
            <div className="flex justify-end items-center gap-2">
              <ModalGeneric config={funcionarioModalConfig("Editar", funcionario)} params={funcionario.id} />
              <ModalDelete config={{
                id: funcionario.id,
                title: "Tem certeza que deseja excluir esse funcionário?",
                description: "Esta ação não pode ser desfeita. O funcionário será removido permanentemente.",
                apiEndpoint: `${process.env.NEXT_URL}/api/privada/users/delete`,
                urlRevalidate: ["/dashboard/funcionarios"],
              }} />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default FuncionarioTable;

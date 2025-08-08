import React from "react";
import { FiUser, FiChevronDown, FiChevronUp, FiPhone, FiMapPin, FiCreditCard, FiCalendar, FiHeart, FiFileText } from "react-icons/fi";
import ModalGeneric from "../../components/modalGeneric";
import ButtonDelete from "../../components/modalDelete";
import { configModalCliente } from "./configs";
import { Client } from "@/types/client";

interface PacienteCardProps {
  cliente: Client;
  parseDateAsLocal: (date: Date | string) => Date;
}

const PacienteCard: React.FC<PacienteCardProps> = ({ cliente, parseDateAsLocal }) => (
  <div
    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <FiUser className="text-blue-600" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{cliente.name}</h3>
          <p className="text-sm text-gray-500 truncate">{cliente.email}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <ModalGeneric config={configModalCliente("Editar", cliente)} params={cliente.id} />
        <ButtonDelete
          config={{
            id: cliente.id,
            title: "Tem certeza que deseja excluir esse paciente?",
            description: "Esta ação não pode ser desfeita. O paciente será removido permanentemente.",
            apiEndpoint: `${process.env.NEXT_URL}/api/privada/clients/delete`,
            urlRevalidate: ["/dashboard/pacientes"],
            tags: undefined,
          }}
        />
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${cliente.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        <span className={`h-2 w-2 rounded-full ${cliente.active ? "bg-green-500" : "bg-red-500"}`}></span>
        {cliente.active ? "Ativo" : "Inativo"}
      </span>
      {cliente.cpf && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">
          <FiCreditCard className="h-3 w-3" />
          {cliente.cpf}
        </span>
      )}
{cliente.birthDate && (
  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs">
    <FiCalendar className="h-3 w-3" />
    {(() => {
      const date = parseDateAsLocal(cliente.birthDate);
      const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      return localDate.toLocaleDateString("pt-BR");
    })()}
  </span>
)}
    </div>
    <details className="group mt-3">
      <summary className="flex items-center justify-between cursor-pointer text-sm text-blue-600 font-medium">
        <span>Mais detalhes</span>
        <FiChevronDown className="h-4 w-4 group-open:hidden" />
        <FiChevronUp className="h-4 w-4 hidden group-open:block" />
      </summary>
      <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 text-sm">
        {cliente.address && (
          <div className="flex items-start gap-2 text-gray-700">
            <FiMapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="truncate">{cliente.address}</span>
          </div>
        )}
        {cliente.emergencyContactName && (
          <div className="flex items-center gap-2 text-gray-700">
            <FiUser className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>{cliente.emergencyContactName}</span>
          </div>
        )}
        {cliente.emergencyContactPhone && (
          <div className="flex items-center gap-2 text-gray-700 ml-5">
            <FiPhone className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>{cliente.emergencyContactPhone}</span>
          </div>
        )}
        {(cliente.allergies || cliente.medicalHistory) && (
          <div className="mt-2">
            <h4 className="font-medium text-gray-800 mb-1">Informações de saúde:</h4>
            {cliente.allergies && (
              <p className="text-rose-600 text-sm flex items-start gap-2">
                <FiHeart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><span className="font-medium">Alergias:</span> {cliente.allergies}</span>
              </p>
            )}
            {cliente.medicalHistory && (
              <p className="text-blue-600 text-sm flex items-start gap-2">
                <FiFileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><span className="font-medium">Histórico:</span> {cliente.medicalHistory}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </details>
  </div>
);

export default PacienteCard;

import { Client } from "@/types/client";

import React from "react";
import { headers } from "next/headers";
import { 
  FiUser, FiFileText 
} from "react-icons/fi";

export const dynamic = 'force-dynamic';


import { BotaoAdicionarCliente } from "./components/configs";
import PacienteCard from "./components/PacienteCard";



export default async function PaginaClientes() {
  let clientes: Client[] = [];

  try {
    const listaHeaders = headers();
    const cookieHeader = (await listaHeaders).get("cookie") || "";

    const resposta = await fetch(`${process.env.NEXT_URL}/api/privada/clients/get`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!resposta.ok) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-red-600">Erro ao carregar os dados</h2>
            <p className="text-gray-600 mt-2">
              Não foi possível carregar a lista de clientes no momento. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      );
    }

    const dadosApi: Client[] = await resposta.json();

    clientes = dadosApi.map((c) => ({
      _id: c._id ?? c.id ?? c.email ?? '',
      id: c.id ?? c._id ?? c.email ?? '',
      name: c.name,
      email: c.email,
      phone: c.phone ?? '',
      cpf: c.cpf,
      birthDate: c.birthDate ? new Date(c.birthDate) : null,
      address: c.address,
      historico: c.historico ?? '',
      allergies: c.allergies,
      medicalHistory: c.medicalHistory,
      emergencyContactName: c.emergencyContactName,
      emergencyContactPhone: c.emergencyContactPhone,
      active: c.active ?? true,
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
    }));
  } catch (erro) {
    console.error("Erro ao carregar clientes:", erro);
    return null;
  }

  function parseDateAsLocal(date: Date | string) {
    if (date instanceof Date) return date;
    if (!date) return new Date('');
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Calcular estatísticas
  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.active).length,
    comHistorico: clientes.filter(c => c.medicalHistory).length,
  }

  if (clientes.length === 0) {
    return (
      <div className="w-full  mx-auto p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiUser className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum paciente cadastrado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Você ainda não possui pacientes cadastrados em sua clínica.
            </p>
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
              Gerenciamento de Pacientes
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie os pacientes da sua clínica odontológica
            </p>
          </div>
          <BotaoAdicionarCliente />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total de Pacientes</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUser className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Ativos</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.ativos} <span className="text-sm font-normal">({stats.total ? Math.round((stats.ativos / stats.total) * 100) : 0}%)</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <FiFileText className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Com Histórico</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.comHistorico}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => (
          <PacienteCard key={cliente.id} cliente={cliente} parseDateAsLocal={parseDateAsLocal} />
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        {clientes.length} {clientes.length === 1 ? 'paciente' : 'pacientes'} cadastrados
      </div>
    </div>
  );
}
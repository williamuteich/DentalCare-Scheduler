'use client';

import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

const ProntuarioRedirect = () => {
  const { id } = useParams();
  
  // Redireciona para a rota correta no dashboard
  redirect(`/dashboard/prontuario/${id}`);
};

export default ProntuarioRedirect;

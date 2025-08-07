import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname.replace('/api/privada/exames/', '');
    const downloadName = url.searchParams.get('download');

    const filePath = path.join(process.cwd(), 'public', 'exames', pathname);

    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    // Ler o arquivo
    const fileBuffer = await fs.readFile(filePath);
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    
    if (downloadName) {
      headers.set('Content-Disposition', `attachment; filename="${downloadName}"`);
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}

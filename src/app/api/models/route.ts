import { NextResponse } from 'next/server';
import { getProviders } from './providers';

export async function GET() {
  return NextResponse.json(await getProviders());
}

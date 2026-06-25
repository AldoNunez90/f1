#!/usr/bin/env node

/**
 * Script para sincronizar datos de Open F1 manualmente
 * Uso: pnpm sync-f1-data
 */

import connectDB from '@/lib/db/connection.js';
import { fetchF1Data, AVAILABLE_ENDPOINTS } from '@/lib/services/f1Service.js';

async function syncAllData() {
  console.log('🚀 Iniciando sincronización de datos de F1...\n');

  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    for (const endpoint of AVAILABLE_ENDPOINTS) {
      try {
        console.log(`⏳ Sincronizando ${endpoint}...`);
        await fetchF1Data(endpoint);
        console.log(`✅ ${endpoint} sincronizado\n`);
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Error en ${endpoint}: ${errorMessage}\n`);
        failureCount++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Resumen de Sincronización:');
    console.log(`✅ Éxitos: ${successCount}`);
    console.log(`❌ Fallos: ${failureCount}`);
    console.log(`⏱️ Tiempo: ${duration}s`);
    console.log('='.repeat(50));

    process.exit(failureCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

syncAllData();

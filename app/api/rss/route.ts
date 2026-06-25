// import Parser from 'rss-parser';
// import connectDB from '@/lib/db/connection'; // Tu conexión a la base de datos
// // import Publication from '@/models/Publication'; // Tu modelo de Mongoose

// const parser = new Parser();

// export async function fetchMotorsportNews() {
//   await connectDB();
  
//   try {
//     // 1. Apuntamos a la URL del feed RSS específico de F1
//     const feed = await parser.parseURL('https://lat.motorsport.com/rss/f1/news/');
    
//     let addedCount = 0;

//     // 2. Iteramos sobre las publicaciones que devuelve el RSS
//     for (const item of feed.items) {
      
//       // Opcional: Podés aplicar filtros si querés priorizar temas específicos
//       // como cambios en el reglamento técnico o noticias de pilotos argentinos.
//       const isTechnicalOrLocal = item.title.toLowerCase().includes('técnica') || 
//                                  item.title.toLowerCase().includes('argentina') ||
//                                  item.contentSnippet?.toLowerCase().includes('reglamento');

//       // 3. Revisamos en MongoDB que el link no esté duplicado
//       const exists = await Publication.findOne({ link: item.link });
      
//       if (!exists) {
//         // 4. Guardamos el nuevo documento
//         await Publication.create({
//           title: item.title,
//           link: item.link,
//           date: item.pubDate, // El RSS entrega la fecha exacta de publicación
//           excerpt: item.contentSnippet, // Un copete o resumen introductorio
//           source: 'Motorsport LAT',
//           highlight: isTechnicalOrLocal // Flag para darle un estilo distinto en el frontend
//         });
//         addedCount++;
//       }
//     }
    
//     return { success: true, added: addedCount };

//   } catch (error) {
//     console.error('Error procesando el RSS de Motorsport:', error);
//     return { success: false, error: error.message };
//   }
// }
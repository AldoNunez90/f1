import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { FavoritesManager } from "../components/FavoritesManager";

// Importamos el catálogo y el nuevo modal
import { TEAMS, DRIVERS_LIST } from "@/lib/data/f1-catalog";


export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // 1. Buscamos al usuario en la base de datos para obtener sus favoritos
  const client = await clientPromise;
  const db = client.db();
  const userDocument = await db.collection("users").findOne({ 
    _id: new ObjectId(session.user.id) 
  });

  const userFavorites = userDocument?.favorites || {};

  // 2. Cruzamos los IDs guardados con nuestro catálogo local para obtener fotos y colores
  const selectedTeam = TEAMS.find(t => t.id === userFavorites.teamId);
  const selectedDriver = DRIVERS_LIST.find(d => d.id === userFavorites.driverId);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 text-white space-y-8">
      {/* Header del Perfil (Se mantiene igual) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
            {session.user.image ? (
              <Image src={session.user.image} alt="Avatar" fill sizes="96px" className="object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-cyan-400">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">{session.user.name}</h1>
            <p className="text-sm text-slate-400 font-mono mt-1">{session.user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Conectado
            </div>
          </div>
        </div>

        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-900/50 rounded-xl transition-all text-sm font-bold shadow-xs cursor-pointer">
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta de Estadísticas (Prode) */}
        <div className="md:col-span-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-400">Rendimiento</p>
            <h2 className="text-2xl font-black text-white mt-2">Mi Prode</h2>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
              <span className="text-slate-400 text-sm">Puntos totales</span>
              <span className="text-2xl font-mono font-bold text-white">0</span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
              <span className="text-slate-400 text-sm">Aciertos exactos</span>
              <span className="text-xl font-mono font-bold text-white">0</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-sm">Ranking global</span>
              <span className="text-xl font-mono font-bold text-cyan-400">#--</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Favoritos */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-400">Garaje Personal</p>
                <h2 className="text-2xl font-black text-white mt-2 mb-6">Mis Favoritos</h2>
              </div>
              
              {/* Aquí inyectamos el componente Modal que pasará los datos actuales */}
              <FavoritesManager 
                currentTeamId={userFavorites.teamId} 
                currentDriverId={userFavorites.driverId} 
              /> 
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Tarjeta Escudería */}
              <div className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${selectedTeam ? `bg-linear-to-br ${selectedTeam.gradient} border-transparent shadow-lg` : 'border border-dashed border-slate-700 bg-slate-950/50'}`}>
                {selectedTeam ? (
                  <>
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Equipo</p>
                    <p className="text-xl font-black text-white drop-shadow-md">{selectedTeam.name}</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-xl">🏎️</div>
                    <p className="text-sm font-bold text-slate-300">Sin Escudería</p>
                  </>
                )}
              </div>

              {/* Tarjeta Piloto */}
              <div className={`relative rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center transition-all ${selectedDriver ? 'border border-slate-700 bg-slate-800' : 'border border-dashed border-slate-700 bg-slate-950/50 p-6'}`}>
                {selectedDriver ? (
                  <>
                    <div className="absolute inset-0 z-0">
                      <Image src={selectedDriver.imageUrl} alt={selectedDriver.lastName} fill className="object-cover object-top opacity-80" sizes="(max-width: 640px) 100vw, 300px" />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </div>
                    <div className="relative z-10 p-6 flex flex-col items-center justify-end h-full w-full mt-20">
                       <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Piloto</p>
                       <p className="text-2xl font-black text-white drop-shadow-lg">{selectedDriver.lastName.toUpperCase()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-xl">🪖</div>
                    <p className="text-sm font-bold text-slate-300">Sin Piloto</p>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
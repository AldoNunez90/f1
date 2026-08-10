// app/actions/user.ts
"use server";

import { auth } from "@/lib/auth"; 
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function updateFavorites(teamId: string, driverId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para guardar favoritos.");
  }

  const client = await clientPromise;
  const db = client.db(); 

  // Actualizamos el documento del usuario
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { 
      $set: { 
        "favorites.teamId": teamId, 
        "favorites.driverId": driverId 
      } 
    }
  );

  revalidatePath("/perfil");
}
// app/privacy/page.tsx
export const metadata = { title: "Políticas de Privacidad | F1 HUB" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Políticas de Privacidad de F1 HUB</h1>
      <p className="mb-4">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Información que recopilamos</h2>
      <p className="mb-4">Al iniciar sesión en F1 HUB utilizando tu cuenta de Google, recopilamos únicamente tu nombre, dirección de correo electrónico y foto de perfil pública para crear y gestionar tu cuenta de usuario.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">2. Uso de la información</h2>
      <p className="mb-4">Utilizamos tu información exclusivamente para personalizar tu experiencia (Garaje personal), gestionar tus predicciones en el Prode y mostrar tu progreso en el ranking interno. No vendemos, alquilamos ni compartimos tus datos con terceros.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">3. Seguridad de los datos</h2>
      <p className="mb-4">Tus datos se almacenan de forma segura. La autenticación se maneja directamente mediante los protocolos seguros de Google OAuth 2.0. No almacenamos contraseñas en nuestros servidores.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">4. Eliminación de datos</h2>
      <p className="mb-4">Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados (predicciones y favoritos) en cualquier momento escribiendo un correo al administrador de la web.</p>
    </div>
  );
}
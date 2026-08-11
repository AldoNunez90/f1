// app/terms/page.tsx
export const metadata = { title: "Términos de Uso | F1 HUB" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Términos de Uso de F1 HUB</h1>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceptación de los Términos</h2>
      <p className="mb-4">Al acceder y utilizar F1 HUB, aceptas estar sujeto a estos Términos de Uso. Esta aplicación es un proyecto no oficial, creado con fines de entretenimiento y estadísticas deportivas.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">2. Autenticación con Google</h2>
      <p className="mb-4">Para utilizar las funciones interactivas (Prode y Favoritos), debes iniciar sesión mediante tu cuenta de Google. Eres responsable de mantener la confidencialidad de tu acceso.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">3. Descargo de Responsabilidad</h2>
      <p className="mb-4">F1 HUB no está afiliada, asociada, autorizada, respaldada ni conectada oficialmente de ninguna manera con la Fórmula 1, Formula One Management, la FIA, ni con ninguno de sus equipos o pilotos oficiales. El uso de nombres, logotipos e imágenes se hace bajo el principio de &quot;Uso Justo&quot; (Fair Use) con fines informativos y periodísticos.</p>
    </div>
  );
}
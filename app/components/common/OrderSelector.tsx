'use client';

interface OrderSelectorProps {
  currentOrder: string;
}

export function OrderSelector({ currentOrder }: OrderSelectorProps) {
  return (
    <select 
      name="order" 
      id="pilotsOrder"
      defaultValue={currentOrder}
      onChange={(e) => e.target.form?.submit()}
      aria-label="Ordenar pilotos por"
      className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold rounded-lg shadow-xs text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden transition cursor-pointer"
    >
      <option value="wins">Victorias</option>
      <option value="titles">Campeonatos</option>
      <option value="podiums">Podios</option>
      <option value="name">Nombre</option>
    </select>
  );
}
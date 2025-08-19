// Özel isimleri büyük harfe çeviren fonksiyon
export const capitalizeName = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Form input değişikliklerinde otomatik büyük harf yapan fonksiyon (not used directly in forms, but `capitalizeName` is)
export const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const capitalizedValue = capitalizeName(value);
  e.target.value = capitalizedValue;
  return capitalizedValue;
};

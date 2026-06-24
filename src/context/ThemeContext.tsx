import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface ThemeContextType {
  oscuro: boolean;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Hook para consumir el contexto desde cualquier componente
export function useTema(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de <ThemeProvider>');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lee la preferencia guardada en localStorage al iniciar
  const [oscuro, setOscuro] = useState<boolean>(() => {
    const guardado = localStorage.getItem('stockpro_tema');
    return guardado === 'oscuro';
  });

  // Cada vez que cambia el tema, aplica la clase al <html> y guarda en localStorage
  useEffect(() => {
    if (oscuro) {
      document.documentElement.classList.add('tema-oscuro');
    } else {
      document.documentElement.classList.remove('tema-oscuro');
    }
    localStorage.setItem('stockpro_tema', oscuro ? 'oscuro' : 'claro');
  }, [oscuro]);

  function toggleTema() {
    setOscuro((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ oscuro, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

import { useEffect, useState } from "react";

export function useSkipInitialEntering() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return !hasMounted;
}

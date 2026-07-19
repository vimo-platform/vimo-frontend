import { useEffect, useState } from 'react';

import SchoolLoginScreen, { type SchoolLoginScreenProps } from './SchoolLoginScreen';
import SplashEntryScreen from './SplashEntryScreen';

export const ENTRY_SPLASH_DURATION_MS = 2000;

export default function EntryFlowScreen(props: SchoolLoginScreenProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, ENTRY_SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return showSplash ? <SplashEntryScreen /> : <SchoolLoginScreen {...props} />;
}

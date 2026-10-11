import { createContext, useContext } from 'react';
import type { PageAssets } from '../pages/types.ts';

/** The build's asset URLs for the page being rendered (null in dev). */
export const AssetsContext = createContext<PageAssets | null>(null);
export const useAssets = (): PageAssets | null => useContext(AssetsContext);

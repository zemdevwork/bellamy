import { Kalnia_Glaze , Federo ,Bodoni_Moda } from 'next/font/google';

export const kalniaGlaze = Kalnia_Glaze({
  subsets: ['latin'],
  display: 'swap',
});

export const federo = Federo({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const bodoniModa = Bodoni_Moda({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});
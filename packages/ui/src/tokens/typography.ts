export type TypographyVariant =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'heading-3xl'
  | 'heading-2xl'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs'
  | 'body-2xs'
  | 'caption'
  | 'mono';

export type TypographyToken = {
  fontSize: string;
  lineHeight: number;
  fontWeight: number;
  letterSpacing?: string;
};

export type TypographyScale = Record<TypographyVariant, TypographyToken>;

export const typographyTokens: TypographyScale = {
  'display-2xl': {
    fontSize: '3.2rem',
    lineHeight: 1.1,
    fontWeight: 600,
  },
  'display-xl': {
    fontSize: '2.8rem',
    lineHeight: 1.15,
    fontWeight: 600,
  },
  'display-lg': {
    fontSize: '2.4rem',
    lineHeight: 1.2,
    fontWeight: 600,
  },
  'heading-3xl': {
    fontSize: '2rem',
    lineHeight: 1.2,
    fontWeight: 600,
  },
  'heading-2xl': {
    fontSize: '1.75rem',
    lineHeight: 1.25,
    fontWeight: 600,
  },
  'heading-xl': {
    fontSize: '1.5rem',
    lineHeight: 1.3,
    fontWeight: 600,
  },
  'heading-lg': {
    fontSize: '1.25rem',
    lineHeight: 1.3,
    fontWeight: 600,
  },
  'heading-md': {
    fontSize: '1.125rem',
    lineHeight: 1.35,
    fontWeight: 600,
  },
  'body-lg': {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-md': {
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-sm': {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-xs': {
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  'body-2xs': {
    fontSize: '0.625rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  mono: {
    fontSize: '0.9375rem',
    lineHeight: 1.45,
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
};

export const typographyCSSVariables: Record<TypographyVariant, string> =
  Object.fromEntries(
    Object.entries(typographyTokens).map(([variant, token]) => [
      variant,
      `var(--font-size-${variant})/${token.lineHeight}`,
    ])
  ) as Record<TypographyVariant, string>;

export const allTypographyVariants = Object.keys(
  typographyTokens
) as TypographyVariant[];


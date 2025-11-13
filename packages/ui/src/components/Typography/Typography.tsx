import {
  CSSProperties,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  Ref,
  forwardRef,
} from 'react';

import {
  TypographyVariant,
  typographyTokens,
} from '../../tokens/typography';

const defaultElementByVariant: Record<TypographyVariant, ElementType> = {
  'display-2xl': 'h1',
  'display-xl': 'h1',
  'display-lg': 'h1',
  'heading-3xl': 'h2',
  'heading-2xl': 'h2',
  'heading-xl': 'h3',
  'heading-lg': 'h4',
  'heading-md': 'h5',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'p',
  'body-2xs': 'p',
  caption: 'span',
  mono: 'span',
};

type TypographyOwnProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  weight?: CSSProperties['fontWeight'];
};

export type TypographyProps<T extends ElementType> = TypographyOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TypographyOwnProps<T>>;

const TypographyInner = <T extends ElementType = 'span'>(
  {
    as,
    variant = 'body-md',
    weight,
    style,
    ...rest
  }: TypographyProps<T>,
  ref: ForwardedRef<Element>
): ReactElement => {
  const token = typographyTokens[variant];
  const Component = (as ?? defaultElementByVariant[variant] ?? 'span') as ElementType;

  const computedStyle: ComponentPropsWithoutRef<'span'>['style'] = {
    fontSize: `var(--font-size-${variant}, ${token.fontSize})`,
    lineHeight: `var(--line-height-${variant}, ${token.lineHeight})`,
    fontWeight: weight ?? `var(--font-weight-${variant}, ${token.fontWeight})`,
    ...(token.letterSpacing
      ? { letterSpacing: `var(--letter-spacing-${variant}, ${token.letterSpacing})` }
      : {}),
    ...style,
  };

  return <Component ref={ref} style={computedStyle} {...rest} />;
};

type TypographyComponent = <T extends ElementType = 'span'>(
  props: TypographyProps<T> & { ref?: Ref<Element> }
) => ReactElement;

export const Typography = forwardRef(TypographyInner) as TypographyComponent;

export { defaultElementByVariant };


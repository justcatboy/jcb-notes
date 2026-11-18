export interface Ad {
  title: string;
  text?: string;
  href?: string;
  label?: string;
}

// места в правой колонке главной, сверху вниз
export const ads: Ad[] = [
  { title: 'Здесь могла быть ваша реклама', text: 'закажите прямо сейчас!' },
  { title: 'Здесь могла быть ваша реклама', text: 'закажите прямо сейчас!' },
];

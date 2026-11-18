export interface Ad {
  title?: string;
  text?: string;
  // адаптивный SVG: имя файла из src/side/ без .svg
  banner?: string;
  // картинка из public/side/: '/side/имя.png'; imageDark — для тёмной темы
  image?: string;
  imageDark?: string;
  alt?: string;
  href?: string;
  label?: string;
}

// места в правой колонке главной, сверху вниз; требования к баннерам — /placement/
export const ads: Ad[] = [
  { title: 'Здесь могла быть ваша реклама', text: 'закажите прямо сейчас!' },
  { banner: 'side-standards', href: '/standards/' },
];

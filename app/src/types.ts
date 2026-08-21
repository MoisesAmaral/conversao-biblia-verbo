export interface PresentVerseData {
  text: string;
  reference: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  title?: string | null;
  background?: string;
  titleColor?: string;
  align?: "left" | "center" | "right";
}

export interface SlideStyle {
  background: string;
  titleColor: string;
  titleSize: number;
  titleWeight: "normal" | "semibold" | "extrabold";
  align: "left" | "center" | "right";
}

export interface Slide {
  id: string;
  label: string | null;
  text: string;
  title?: string | null;
  style?: SlideStyle;
}

export type PresentationCommand =
  | { type: "theme"; value: "dark" | "light" | "blue" | "sepia" }
  | { type: "fontSize"; value: number }
  | { type: "clear" }
  | { type: "black" }
  | { type: "next" }
  | { type: "prev" };

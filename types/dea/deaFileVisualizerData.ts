export interface DEAWindowData {
  id: number;
  title: string;
  pdfUrl: string;
  content: string;
  isLoading: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  collapse: boolean;
  prevData?: DEAWindowData | null;
}

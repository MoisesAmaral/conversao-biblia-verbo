import { PresentVerseData, PresentationCommand } from "../types";

type Message =
  | { type: "show-verse"; data: PresentVerseData }
  | { type: "command"; cmd: PresentationCommand }
  | { type: "verse-navigate"; dir: "next" | "prev" }
  | { type: "hello" }
  | { type: "bye" };

const CHANNEL_NAME = "biblia-verbo-presentation";

/**
 * Ponte entre a aba do operador e a aba de apresentação (Tela 2), via
 * BroadcastChannel — mesma origem, sem servidor no meio, funciona em
 * qualquer navegador atual. Guarda o último verso/comando enviados para
 * resincronizar uma aba de apresentação recarregada no meio do culto
 * (BroadcastChannel não tem histórico — quem chega depois não vê nada do
 * que já passou, a menos que a gente reenvie).
 */
class PresentationBus {
  private channel: BroadcastChannel;
  private listeners = new Set<(msg: Message) => void>();
  private openListeners = new Set<(open: boolean) => void>();
  private lastVerse: PresentVerseData | null = null;
  private lastCommand: PresentationCommand | null = null;
  private open = false;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (e) => this.handle(e.data as Message);
  }

  private handle(msg: Message) {
    if (msg.type === "hello") {
      this.setOpen(true);
      if (this.lastVerse) this.channel.postMessage({ type: "show-verse", data: this.lastVerse });
      if (this.lastCommand) this.channel.postMessage({ type: "command", cmd: this.lastCommand });
      return;
    }
    if (msg.type === "bye") {
      this.setOpen(false);
      return;
    }
    if (msg.type === "show-verse") this.lastVerse = msg.data;
    if (msg.type === "command" && msg.cmd.type !== "next" && msg.cmd.type !== "prev") {
      this.lastCommand = msg.cmd;
    }
    this.listeners.forEach((l) => l(msg));
  }

  private setOpen(v: boolean) {
    if (this.open === v) return;
    this.open = v;
    this.openListeners.forEach((l) => l(v));
  }

  get isOpen() {
    return this.open;
  }

  onOpenChange(cb: (open: boolean) => void): () => void {
    this.openListeners.add(cb);
    return () => { this.openListeners.delete(cb); };
  }

  subscribe(cb: (msg: Message) => void): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  sendVerse(data: PresentVerseData) {
    this.lastVerse = data;
    this.channel.postMessage({ type: "show-verse", data });
  }

  sendCommand(cmd: PresentationCommand) {
    if (cmd.type !== "next" && cmd.type !== "prev") this.lastCommand = cmd;
    this.channel.postMessage({ type: "command", cmd });
  }

  requestNavigate(dir: "next" | "prev") {
    this.channel.postMessage({ type: "verse-navigate", dir });
  }

  // Chamado pela própria aba de apresentação ao montar / desmontar.
  announceOpen() {
    this.setOpen(true);
    this.channel.postMessage({ type: "hello" });
  }

  announceClosed() {
    this.setOpen(false);
    this.channel.postMessage({ type: "bye" });
  }
}

export const presentationBus = new PresentationBus();
export type { Message as PresentationMessage };

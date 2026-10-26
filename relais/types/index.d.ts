export type Relais = { de: string; message: string; resume: string; recuA: number }

declare module 'claude-code' {
  interface PluginState {
    relais: { recus: Relais[] }
  }
}

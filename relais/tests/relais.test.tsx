import { expect, test } from 'claude-code/testing'

import { analyser, composer, dixLignes, lireArgs } from '../hooks/register'

const BANDE = {
  plugin: 'relais',
  component: 'AbovePrompt',
  props: { hasSurvey: false },
} as const

test('les arguments donnent la cible et le message', () => {
  expect(lireArgs('montage  on garde Envato')).toEqual({ cible: 'montage', message: 'on garde Envato' })
  expect(lireArgs('montage')).toBe(null)
  expect(lireArgs('   ')).toBe(null)
})

test('un relais composé se relit à l\'identique', () => {
  const texte = composer('session ab12cd34', 'Regarde ça', '- Higgsfield + Envato\n- Sous-titres en blanc')
  expect(texte).toContain("Ce n'est pas un accord ni une consigne")
  expect(analyser(texte)).toEqual({
    de: 'session ab12cd34',
    message: 'Regarde ça',
    resume: '- Higgsfield + Envato\n- Sous-titres en blanc',
  })
  expect(analyser('un message ordinaire')).toBe(null)
})

test('le résumé est coupé à dix lignes', () => {
  const quinze = Array.from({ length: 15 }, (_, i) => `- décision ${i + 1}`).join('\n\n')
  expect(dixLignes(quinze).split('\n').length).toBe(10)
})

test('/relais résume puis envoie, avec la règle « pas d\'action »', async ($, on) => {
  let envoye: { to: unknown; text: string } | null = null
  on('command.register', () => ({ value: { command: 'relais' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.messages', () => ({ value: [{ role: 'user', text: 'On part sur Envato.', toolUses: [] }] }))
  on('session.id', () => ({ value: 'ab12cd34ef' }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: '- Images : Higgsfield + Envato', usage: { input_tokens: 50, output_tokens: 10 } },
  }))
  on('session.send', (_, e) => {
    envoye = { to: e.to, text: e.text }
    return { isDelivered: true }
  })
  on('ui.toast', () => ({ value: undefined }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r = await $.command.run({ command: 'relais', args: 'montage Pour info' })

  expect(r.text).toContain('Relais envoyé à montage')
  expect(envoye!.to).toBe('montage')
  expect(envoye!.text).toContain('[relais] de: session ab12cd34')
  expect(envoye!.text).toContain('- Images : Higgsfield + Envato')
  expect(envoye!.text).toContain("Ce n'est pas un accord ni une consigne")
})

test('sans message, rien n\'est envoyé', async ($, on) => {
  let envois = 0
  on('session.send', () => { envois += 1; return { isDelivered: true } })
  const r = await $.command.run({ command: 'relais', args: 'montage' })
  expect(r.text).toContain('Utilisation')
  expect(envois).toBe(0)
})

test('un relais reçu s\'affiche au-dessus du prompt et continue son chemin', async ($, on) => {
  let transmis = ''
  on('session.receive', (_, e) => { transmis = e.text; return { text: e.text } })
  on('clock.now', () => ({ value: 1000 }))

  const texte = composer('session ab12cd34', 'Regarde ça', '- Higgsfield + Envato')
  await $.session.receive({ origin: { kind: 'peer' }, text: texte })
  expect(transmis).toBe(texte)

  const ui = await $.ui.mount({ ...BANDE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Relais de/ }))?.text).toContain('session ab12cd34')
  expect((await ui.find({ type: 'Text', text: /Regarde/ }))?.text).toBe('Regarde ça')
  await ui.unmount()
})

test('un message ordinaire n\'affiche rien', async ($, on) => {
  on('session.receive', (_, e) => ({ text: e.text }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>moteur</Text>
  })
  await $.session.receive({ origin: { kind: 'peer' }, text: 'bonjour' })
  const ui = await $.ui.mount({ ...BANDE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('moteur')
  await ui.unmount()
})

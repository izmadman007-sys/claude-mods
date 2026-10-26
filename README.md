# claude-mods

Mods Claude Code personnels.

## relais

Relais entre deux sessions Claude Code. Dans une session, tape `/relais <nom ou identifiant de la session> <message>` : Claude résume en dix lignes maximum ce qui a été décidé dans cette session (avec le modèle Haiku) et l'envoie à l'autre session, comme l'outil SendMessage, avec ton message. Côté réception, le relais s'affiche au-dessus de la zone de saisie avec le nom déclaré par l'expéditeur (non vérifié) et un bouton « Fermer ». Un relais reçu ne vaut jamais accord : Claude le lit, il n'exécute rien tout seul. Le mod ne lit ni n'écrit aucun fichier et ne fait aucun appel réseau en dehors de Claude Code.

### Installer

Dans une session Claude Code (terminal) :

```
/plugin install relais --marketplace izmadman007-sys/claude-mods
```

Depuis un terminal :

```
claude plugin install relais --marketplace izmadman007-sys/claude-mods
```

Le dépôt est privé : il faut être connecté à GitHub sur l'ordinateur où on l'installe.

### Désactiver

`/plugin`, choisir **relais**, puis **Désactiver**.

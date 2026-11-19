---
title: 'jcb-git-private-backup: приложение 1'
---

Дополнение к практике: связанные с ней материалы — примеры, пояснения, инструменты. Может пригодиться, а может оказаться лишним: соответствие проверяется только по самой практике.

## Как было

Zip-архивы `<проект>-<дата>.zip` в папке `backup/` рядом с проектами: вручную, без шифрования, на том же диске.
Защищает от своей ошибки, но не от потери машины и не от того, кто получит доступ к диску.

## Шифрование: git-remote-gcrypt

[git-remote-gcrypt](https://spwhitton.name/tech/code/git-remote-gcrypt/) — «удалённый адрес с шифрованием» для git:
перед отправкой шифрует всё через GPG — содержимое, имена файлов, сообщения, ветки. На хостинге лежит один
непрозрачный набор файлов. Работает поверх обычного SSH или HTTPS к GitHub/GitLab.

Один раз на машину:

```sh
gpg --quick-generate-key "backup <backup@example.invalid>" ed25519 sign,encr never
gpg --list-secret-keys --keyid-format long     # id ключа
gpg --export-secret-keys --armor <id> > backup-key.asc   # → в менеджер паролей, файл удалить
```

`git-remote-gcrypt` — один shell-скрипт: положить в `PATH` (на Windows — рядом с `git.exe` Git Bash) или поставить
пакетом в Linux. На Windows работу через Git Bash ещё нужно проверить.

Ключ GPG и сам `git-remote-gcrypt` — единственное, что живёт в системе, а не в проекте: шифрование идёт через
связку ключей пользователя.

## Новый проект

```sh
cd <проект>/private
git init
git config user.name  backup
git config user.email backup@example.invalid
git remote add origin gcrypt::git@github.com:<логин>/<проект>-private.git
git config remote.origin.gcrypt-participants <id ключа>
git add -A && git commit -m "backup" && git push -u origin main
```

Репозиторий `<проект>-private` на GitHub — создать заранее, пустым и **приватным**.

Автор — заглушка: сообщения и авторы всё равно зашифрованы, но так в копии нет даже личного имени.

## Регулярный бэкап

`scripts/backup-private.sh` в репозитории проекта — отправляет `private/`, если там есть изменения:

```sh
#!/bin/sh
cd "$(git rev-parse --show-toplevel)/private" || exit 0
if [ -n "$(git status --porcelain)" ]; then
  git add -A && git commit -q -m "backup $(date +%F)"
fi
git push -q origin HEAD || echo "private/ НЕ ОТПРАВЛЕН" >&2
```

`.githooks/pre-push` проекта (хуки включены настройкой репозитория `core.hooksPath=.githooks`):

```sh
#!/bin/sh
sh "$(git rev-parse --show-toplevel)/scripts/backup-private.sh"
exit 0
```

Сбой бэкапа push проекта не останавливает: хук только предупреждает. Если проект неделю не отправлялся —
запустить скрипт вручную: `sh scripts/backup-private.sh`, у Node — `npm run backup` (скрипт
`"backup": "sh scripts/backup-private.sh"` в `package.json`).

Сообщения в `private/` — «backup <дата>», а не по смыслу: это бэкап, а не история работы.

## Журнал проверок

`private/BACKUP.md` — по строке на проверку восстановления:

```text
2026-11-18 — восстановлено на втором ноутбуке, diff пустой
```

## Проверка восстановления

```sh
mkdir /tmp/restore && cd /tmp/restore
git clone gcrypt::git@github.com:<логин>/<проект>-private.git
diff -r <проект>-private <путь к проекту>/private --exclude=.git
```

На второй машине — сначала `gpg --import backup-key.asc` из менеджера паролей: заодно проверяется, что ключ там
действительно есть.

## Другой вариант: restic

Если git-история для личного не нужна — [restic](https://restic.net/): шифрует всё, хранит снимки без повторов,
пишет в папку, на SFTP, S3-совместимые хранилища. Один репозиторий restic на все `private/` сразу или по одному на
проект.

```sh
restic -r <хранилище> init                       # пароль → в менеджер паролей
restic -r <хранилище> backup --files-from=private-dirs.txt   # список папок private/
restic -r <хранилище> forget --keep-daily 7 --keep-weekly 8 --keep-monthly 12 --prune
restic -r <хранилище> restore latest --target /tmp/restore
```

Практике он тоже соответствует, кроме требования «`private/` — git-репозиторий»; если перейду на restic — поменяю
практику.

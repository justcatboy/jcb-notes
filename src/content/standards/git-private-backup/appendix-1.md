---
title: 'jcb-git-private-backup: приложение 1'
---

На моих примерах: как я выполняю этот стандарт в своих проектах и на своих технологиях. Не требование — соответствие проверяется только по стандарту.

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

Скрипт обходит проекты и отправляет каждый `private/`, где есть изменения:

```sh
#!/bin/sh
# backup-private.sh <папка с проектами>
find "$1" -maxdepth 3 -type d -path '*/private/.git' | while read -r git; do
  dir=$(dirname "$git")
  cd "$dir" || continue
  if [ -n "$(git status --porcelain)" ]; then
    git add -A && git commit -q -m "backup $(date +%F)"
  fi
  git push -q origin HEAD || echo "НЕ ОТПРАВЛЕН: $dir" >&2
  cd - >/dev/null
done
```

На Windows — Планировщик заданий, раз в день при входе в систему:

```powershell
schtasks /create /tn "backup-private" /sc daily /st 21:00 `
  /tr "\"C:\Program Files\Git\bin\bash.exe\" -lc '~/bin/backup-private.sh ~/projects'"
```

Сообщения в `private/` — «backup <дата>», а не по смыслу: это бэкап, а не история работы.

## Проверка восстановления

```sh
mkdir /tmp/restore && cd /tmp/restore
git clone gcrypt::git@github.com:<логин>/<проект>-private.git
diff -r <проект>-private ~/projects/<проект>/private --exclude=.git
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

Стандарт ему тоже соответствует, кроме требования «`private/` — git-репозиторий»; если перейду на restic — поменяю
стандарт.

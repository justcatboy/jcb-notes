---
title: 'jcb-git-public-ready: приложение 1'
---

На моих примерах: как я выполняю этот стандарт в своих проектах и на своих технологиях. Не требование — соответствие проверяется только по стандарту.

## Что нашлось в моих репозиториях

Разбор перед первой версией — откуда взялись правила:

- **Автор коммитов зависел от машины**: в историях встречались имя пользователя Windows, имя компьютера и личный
  ящик — в том числе в двух публичных репозиториях. Отсюда `user.useConfigOnly` и замена авторов перед публикацией.
- **Личные данные лежали как данные проекта**: дневник (`data/entries.jsonl`) и профиль закладок
  (`src/data/profiles/personal.json`) — в git. Отсюда «код и данные — раздельно».
- **В заметках для помощника** — абсолютный путь и название рабочего проекта. Отсюда правило о `CLAUDE.md`.
- **В тестах — собственное имя** как пример логина. Отсюда заглушки.
- **В `.gitignore` у каждого проекта свой набор**: `/notes/`, `/input/`, `/backups/`, `/note.txt`, `/certs/`.
  Отсюда одна папка `private/`.

## Настройка машины — один раз

```sh
git config --global user.useConfigOnly true
git config --global core.excludesFile ~/.config/git/ignore
git config --global core.hooksPath ~/.config/git/hooks
```

`~/.config/git/ignore`:

```text
private/
*.local
*.local.*
```

`~/.config/git/denylist` — по строке на запись, сравнение без учёта регистра:

```text
моя-почта@example.com
+7 700 000 00 00
Имя Фамилия
C:\Users\<имя>
<имя-компьютера>
```

## Новый репозиторий

```sh
git init
git config user.name  <логин>
git config user.email <id>+<логин>@users.noreply.github.com   # id и адрес — в настройках почты GitHub
```

В `.gitignore` проекта — те же три строки, что в глобальном.

## Хук перед коммитом

`~/.config/git/hooks/pre-commit` — общий для всех репозиториев. Глобальный `core.hooksPath` заменяет `.git/hooks`
репозитория, поэтому в конце хук передаёт управление хуку проекта, если он есть.

```sh
#!/bin/sh
# 1. Секреты в том, что уходит в коммит.
gitleaks git --pre-commit --staged --redact --no-banner || exit 1

# 2. Личный стоп-лист: добавленные строки и имена файлов.
list="$HOME/.config/git/denylist"
if [ -s "$list" ]; then
  hits=$( { git diff --cached -U0 | grep '^+' ; git diff --cached --name-only ; } | grep -i -F -f "$list")
  if [ -n "$hits" ]; then
    echo "Стоп-лист: в коммите личное — исправь или убери из индекса." >&2
    exit 1
  fi
fi

# 3. Хук проекта.
own="$(git rev-parse --git-dir)/hooks/pre-commit"
[ -x "$own" ] && exec "$own" "$@"
exit 0
```

На Windows хук выполняет Git Bash, который ставится вместе с Git; `gitleaks` — `winget install gitleaks`.
Найденное в выводе хук не печатает: так строка из стоп-листа не оседает в логах терминала.

Сообщение коммита хук `pre-commit` не видит — его проверяет `commit-msg` так же, по стоп-листу.

## CI

GitHub Actions, `.github/workflows/gitleaks.yml`:

```yaml
name: gitleaks
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Плюс в настройках репозитория: **Secret scanning** и **Push protection** — включены.

## Перед тем как открыть репозиторий

```sh
gitleaks git --redact                                   # вся история
git log --all --format='%an <%ae>%n%cn <%ce>' | sort -u  # все авторы и коммиттеры
git log --all --name-only --format= | sort -u            # все файлы, когда-либо бывшие в истории
git grep -i -F -f ~/.config/git/denylist $(git rev-list --all)   # стоп-лист по всем версиям
git log --all --format=%B | grep -i -F -f ~/.config/git/denylist # стоп-лист по сообщениям
```

Список файлов — глазами: `private/`, `*.local*`, `.env` без суффикса шаблона, `*.sql`, `*.db`, `*.log`, `*.zip`,
`*.pem`, `*.key`, папки `backups/`, `notes/`, `data/`.

## Убрать из истории

Короткая история или прошлое не нужно — схлопнуть (так сделано у jcb-notes перед публикацией):

```sh
git checkout --orphan clean && git add -A && git commit -m "chore: initial public version"
git branch -D main && git branch -m main
```

Нужна история — `git filter-repo` (`pip install git-filter-repo`), на свежем клоне:

```sh
git filter-repo --mailmap ../mailmap.txt            # авторы: «Новое <noreply> Старое <old@…>»
git filter-repo --replace-text ../replace.txt       # строки: «старое==>заглушка»
git filter-repo --invert-paths --path private/ --path data/entries.jsonl   # файлы целиком
```

`mailmap.txt` и `replace.txt` — вне репозитория: в них то самое личное.

## Данные отдельно от кода

На примере дневника:

```text
journal/
  data.example/     # в git: схема и пара вымышленных записей
  private/data/     # настоящие записи, игнорируется
  .env.development  # JOURNAL_DATA=private/data
```

Тесты читают `data.example/`, программа — то, что в `JOURNAL_DATA`.

## Бэкап личного

Архивы `<проект>-<дата>.zip` в отдельной папке бэкапов вне репозиториев: туда попадает `private/` и `*.local*` —
то, чего в удалённой копии нет. Удалённая копия репозитория бэкапит только публичное.

## Фотографии

`exiftool -all= -overwrite_original <файл>` — убрать EXIF; проверить: `exiftool <файл>`.

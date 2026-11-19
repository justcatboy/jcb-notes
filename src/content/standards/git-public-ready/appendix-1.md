---
title: 'jcb-git-public-ready: приложение 1'
---

Дополнение к стандарту: связанные с ним материалы — примеры, пояснения, инструменты. Может пригодиться, а может оказаться лишним: соответствие проверяется только по стандарту.

## Что нашлось в моих репозиториях

Разбор перед первой версией — откуда взялись правила:

- **Автор коммитов зависел от машины**: в историях встречались имя пользователя Windows, имя компьютера и личный
  ящик — в том числе в двух публичных репозиториях. Отсюда проверка автора в хуке и замена авторов перед
  публикацией.
- **Личные данные лежали как данные проекта**: дневник (`data/entries.jsonl`) и профиль закладок
  (`src/data/profiles/personal.json`) — в git. Отсюда «код и данные — раздельно».
- **В заметках для помощника** — абсолютный путь и название рабочего проекта. Отсюда правило о `CLAUDE.md`.
- **В тестах — собственное имя** как пример логина. Отсюда заглушки.
- **В `.gitignore` у каждого проекта свой набор**: `/notes/`, `/input/`, `/backups/`, `/note.txt`, `/certs/`.
  Отсюда одна папка `private/`.

## Новый репозиторий

```sh
git init
git config user.name  <логин>
git config user.email <id>+<логин>@users.noreply.github.com   # или <логин>@users.noreply.github.com
git config core.hooksPath .githooks
```

В `.gitignore` — эти три строки, в любом месте файла:

```text
private/
*.local
*.local.*
```

У Node-проекта хуки включаются сами при `npm install`, в `package.json`:

```json
"scripts": {
  "prepare": "git config core.hooksPath .githooks"
}
```

## Хуки

`.githooks/pre-commit`:

```sh
#!/bin/sh
case "$(git config user.email)" in
  *@users.noreply.github.com) ;;
  *) echo "Автор: нужен адрес-заглушка — git config user.email <логин>@users.noreply.github.com" >&2; exit 1 ;;
esac

gitleaks git --pre-commit --staged --redact --no-banner || exit 1
```

Хук — исполняемый: `git update-index --chmod=+x .githooks/*`. На Windows хуки выполняет Git Bash, который ставится
вместе с Git; `gitleaks` — `winget install gitleaks`.

## Личный стоп-лист

Дополнительная проверка: строки, которые встречаться не должны — почта, телефон, имя, домашний путь, имя
компьютера. Сканер секретов их не ловит.

`private/denylist` — по строке на запись, сравнение без учёта регистра; в git он не попадает:

```text
моя-почта@example.com
+7 700 000 00 00
Имя Фамилия
C:\Users\<имя>
<имя-компьютера>
```

Строки одни и те же во всех проектах: файл удобно копировать из соседнего проекта. Без него проверка пропускается.

В конец `.githooks/pre-commit` — добавленные строки и имена файлов:

```sh
list="$(git rev-parse --show-toplevel)/private/denylist"
if [ -s "$list" ]; then
  hits=$( { git diff --cached -U0 | grep '^+' ; git diff --cached --name-only ; } | grep -i -F -f "$list")
  if [ -n "$hits" ]; then
    echo "Стоп-лист: в коммите личное — исправь или убери из индекса." >&2
    exit 1
  fi
fi
```

`.githooks/commit-msg` — сообщение коммита:

```sh
#!/bin/sh
list="$(git rev-parse --show-toplevel)/private/denylist"
if [ -s "$list" ] && grep -q -i -F -f "$list" "$1"; then
  echo "Стоп-лист: в сообщении коммита личное." >&2
  exit 1
fi
```

Найденное хуки не печатают: так строка из стоп-листа не оседает в логах терминала.

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
```

Со стоп-листом — ещё по всем версиям и сообщениям:

```sh
git grep -i -F -f private/denylist $(git rev-list --all)
git log --all --format=%B | grep -i -F -f private/denylist
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

`private/` — отдельным git-репозиторием проекта со своей удалённой копией, зашифрованной целиком: туда попадает то,
чего в удалённой копии проекта нет. Удалённая копия репозитория проекта бэкапит только публичное.

## Фотографии

`exiftool -all= -overwrite_original <файл>` — убрать EXIF; проверить: `exiftool <файл>`.

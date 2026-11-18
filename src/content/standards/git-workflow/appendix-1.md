---
title: 'jcb-git-workflow: приложение 1'
---

Дополнение к стандарту: связанные с ним материалы — примеры, пояснения, инструменты. Может пригодиться, а может оказаться лишним: соответствие проверяется только по стандарту.

## Следующий номер версии

PowerShell:

```powershell
$y = (Get-Date).Year
$last = git tag --list "v$y.*" | Sort-Object | Select-Object -Last 1
$n = if ($last) { [int]($last -replace "^v$y\.") + 1 } else { 1 }
$v = "v$y.{0:D3}" -f $n
```

sh:

```sh
y=$(date +%Y)
last=$(git tag --list "v$y.*" | sort | tail -n 1)
n=$(( ${last:+10#${last#v$y.}} + 1 ))
v=$(printf 'v%s.%03d' "$y" "$n")
```

Сортировка строками работает, потому что номер всегда из трёх цифр. `10#` в sh — чтобы `008` не читалось как
восьмеричное.

## Смотреть

```sh
git log --first-parent --oneline main   # только версии
git log --oneline v2026.001..v2026.002   # что вошло в версию
git diff v2026.001 v2026.002 --stat      # что изменилось между версиями
git describe main                        # последняя версия, если смотреть из dev
```

## Новый репозиторий

Первый коммит — в `main`, от него — `dev`; дальше в `main` только слияния:

```sh
git init -b main
git commit --allow-empty -m "Начало"     # или первое содержимое
git switch -c dev
```

## Автор коммитов в публичном репозитории

Почта автора видна в истории всем. Чтобы не светить настоящую — анонимная почта GitHub
`<id>+<login>@users.noreply.github.com` (id — числовой, из профиля). Задать только для репозитория:

```sh
git config user.name <login>
git config user.email <id>+<login>@users.noreply.github.com
```

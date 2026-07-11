---
title: "My Terminal Setup for 2026"
date: 2026-06-28T08:30:00+08:00
draft: false
tags: ["tools", "terminal", "workflow"]
categories: ["tools"]
description: "The small collection of shell tools I reach for every day, and why each one earns its place."
---

I keep my terminal setup deliberately small. Every tool here has survived years
of use because it does one thing well.

## The essentials

- **A fast shell** with sensible history and completion
- **A fuzzy finder** for files, history, and processes
- **`ripgrep`** for searching code at absurd speed
- **`fd`** as a friendlier `find`

## A tiny bit of glue

A handful of aliases removes most of the daily friction:

```bash
alias gs="git status --short"
alias gl="git log --oneline -20"
alias serve="hugo server --disableFastRender"
```

## Why keep it minimal?

New machines are painless to set up, and there is less to break. When something
does go wrong, I can reason about the whole toolchain in my head.
